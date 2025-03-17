import pypdfium2
import cv2
import numpy as np
import pytesseract

from sklearn.cluster import KMeans
from skimage.filters.rank import entropy
from skimage.morphology import disk

import multiprocessing as mp
from multiprocessing import shared_memory
from tqdm import tqdm

DEBUG_PERFORM_OCR = False
DEBUG_SHOW_DESKEW = False
DEBUG_SHOW_IDENTIFY = False
DEBUG_SHOW_CLEAN = False


class PDFUtils:
    @classmethod
    def debug_show_image(cls, image, window_name="test"):
        """
        Debug function to display an image.
        """

        cv2.imshow(window_name, image)
        cv2.waitKey(0)

    @classmethod
    def render_page(cls, index, pdf_data_name, scale_factor):
        """
        Worker function to render a PDF page into numpy format.
        """

        # retrieve raw PDF data from shared memory
        # since pypdfium2.PdfDocument is not pickleable, sending the raw PDF
        # data works in this case.
        existing_shm = shared_memory.SharedMemory(name=pdf_data_name)
        pdf_data = bytes(existing_shm.buf)
        pdf = pypdfium2.PdfDocument(pdf_data)

        return pdf[index].render(scale=scale_factor).to_numpy()

    @classmethod
    def load_pdf_pages(cls, path, scale_factor=1.75):
        """
        Loads the pages of a PDF to numpy format.
        The pixmap from the PDF page is rendered at a larger size to help with
        OCR (higher PPI usually yields better results)
        """

        pdf = pypdfium2.PdfDocument(path)
        n_pages = len(pdf)
        del pdf
        with open(path, "rb") as f:
            pdf_data = f.read()

        shm = shared_memory.SharedMemory(create=True, size=len(pdf_data))
        shm.buf[:] = pdf_data

        # concurrent read the PDF for speed
        with mp.Pool(mp.cpu_count() - 1) as pool:
            tasks = [(i, shm.name, scale_factor) for i in range(n_pages)]
            images = pool.starmap(cls.render_page, tasks)

        shm.close()
        shm.unlink()

        return images

    @classmethod
    def load_pdf_text(cls, path):
        """
        Loads the pages of a PDF to text format.
        """

        pdf = pypdfium2.PdfDocument(path)

        extracted_text = []

        for page in pdf:
            text_page = page.get_textpage()
            text = text_page.get_text_range()
            extracted_text.append(text.strip())

        return extracted_text

    @classmethod
    def deskew_image(cls, image, mser):
        """
        Corrects the rotation of an image based on the Hough lines transform.
        This should be done before we perform any text identification.
        """

        # preprocess image with MSER to help with identifying the Hough lines
        # which basically represent the orientation of the document
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (3, 3), 1.0)

        mask = cls.create_mser_mask(blur, mser, kernel=(7, 3), iterations=5)
        edges = cv2.Canny(blur, 50, 150)
        masked_edges = cv2.bitwise_and(edges, edges, mask=mask)

        lines = cv2.HoughLinesP(
            masked_edges, 1, np.pi / 180, threshold=80, minLineLength=120, maxLineGap=20
        )

        angles = []
        if lines is not None:
            for line in lines:
                x0, y0, x1, y1 = line[0]  # type: ignore
                angle = np.degrees(np.arctan2(y1 - y0, x1 - x0))
                angles.append(angle)

            # some lines can be have outlier angles
            median_angle = np.median(angles).astype(float)

            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)

            # calculate new dimensions of the resulting image to avoid removing information
            radians = np.deg2rad(median_angle)
            sin = np.abs(np.sin(radians))
            cos = np.abs(np.cos(radians))
            new_w = int((h * sin) + (w * cos))
            new_h = int((h * cos) + (w * sin))

            # adjust rotation matrix to account for new dimensions
            rotation_matrix = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotation_matrix[0, 2] += (new_w - w) / 2
            rotation_matrix[1, 2] += (new_h - h) / 2

            rotated = cv2.warpAffine(
                image,
                rotation_matrix,
                (new_w, new_h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_CONSTANT,
            )

            if DEBUG_SHOW_DESKEW:
                # debug test
                display_image = image.copy()
                for line in lines:
                    x0, y0, x1, y1 = line[0]  # type: ignore
                    cv2.line(
                        display_image,
                        (int(x0), int(y0)),
                        (int(x1), int(y1)),
                        (255, 0, 0),
                        2,
                    )

                # debug test 2: prepare side by side view
                max_height = max(display_image.shape[0], rotated.shape[0])
                padded_display = cv2.copyMakeBorder(
                    display_image,
                    0,
                    max_height - display_image.shape[0],
                    0,
                    0,
                    cv2.BORDER_CONSTANT,
                    value=[0, 0, 0],
                )
                padded_rotated = cv2.copyMakeBorder(
                    rotated,
                    0,
                    max_height - rotated.shape[0],
                    0,
                    0,
                    cv2.BORDER_CONSTANT,
                    value=[0, 0, 0],
                )

                cls.debug_show_image(cv2.hconcat([padded_display, padded_rotated]))

            return rotated

    @classmethod
    def create_mser_mask(cls, image, mser, kernel=(5, 5), iterations=3):
        """
        Creates a mask from a grayscale image `image` that likely
        represents text using MSER.
        """
        regions, _ = mser.detectRegions(image)
        mask = np.zeros_like(image)

        # Some notes on MSER parameters:
        # delta: controls step size between intensity thresholds
        #   - smaller delta: more sensitive but may detect more noise
        #   - larger delta: reduces sensitivity, but may miss some text regions
        # min_area: sets the minimum area of detected regions
        #   - the greater, the more small noisy regions are filtered out
        # max_variation: controls the maximum variation
        #   - smaller value: more strict, detecting very stable regions
        #   - larger value: less stable regions are detected
        # min_diversity: controls the minimum diversity between regions
        #   - smaller value allows for more overlapping regions
        #   - larger value reduces redundancy by favoring more diverse regions

        # draw convex hull for each region
        for region in regions:
            hull = cv2.convexHull(region.reshape(-1, 1, 2))
            cv2.drawContours(mask, [hull], -1, (255, 255, 255), -1)

        # remove small noise
        opening_kernel = cv2.getStructuringElement(
            cv2.MORPH_RECT, (kernel[0] // 2, kernel[1] // 2)
        )
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, opening_kernel, iterations=1)

        h, w = image.shape[:2]
        dynamic_kernel = cv2.getStructuringElement(
            cv2.MORPH_RECT, (max(kernel[0], w // 200), max(kernel[1], h // 200))
        )

        # connect regions together based image dimensions
        mask = cv2.morphologyEx(
            mask, cv2.MORPH_CLOSE, dynamic_kernel, iterations=iterations
        )

        return mask

    @classmethod
    def identify_text_regions(cls, original_image, mser, pad_amount=3):
        """
        Identifies regions that are likely text based off of MSER. Regions
        are padded by `pad_amount`, and returned as a list of coordinates
        that define the bounding boxes of each detected region.
        """

        display_image = original_image.copy()

        gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 1.0)

        # enhance contrast globally
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(blurred)
        # apply adaptive gamma correction
        mean_intensity = np.mean(enhanced)
        gamma = np.interp(mean_intensity, [50, 200], [0.8, 2.0])
        enhanced = (cv2.pow(enhanced / 255.0, gamma) * 255).astype(np.uint8)

        mask = cls.create_mser_mask(enhanced, mser, kernel=(3, 7), iterations=2)

        edges = cv2.Canny(enhanced, 50, 200, L2gradient=True)

        # refine text region detection with the MSER mask as well as Canny edges
        combined_mask = cv2.bitwise_and(mask, edges)

        # merge nearby text regions of the mask
        edge_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 5))
        merge_text_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 3))
        dilated_combined_mask = cv2.dilate(combined_mask, edge_kernel, iterations=3)
        detected_regions = cv2.morphologyEx(
            dilated_combined_mask,
            cv2.MORPH_OPEN,
            merge_text_kernel,
            iterations=2,  # clean up
        )

        contours, _ = cv2.findContours(
            detected_regions, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        rects = []

        # obtain and draw the regions to perform OCR on (if debugging)
        # TODO: Maybe look into reordering way that text regions are read from.
        # Use the centroids of each region and order them.
        # https://stackoverflow.com/questions/29630052/ordering-coordinates-from-top-left-to-bottom-right
        height, width, _ = original_image.shape
        min_area = 120
        region_no = 1
        for contour in reversed(contours):
            x, y, w, h = cv2.boundingRect(contour)

            area = w * h
            if area > min_area:
                # pad around each region
                x0_pad = max(x - pad_amount, 0)
                y0_pad = max(y - pad_amount, 0)
                x1_pad = min(width, x + w + pad_amount)
                y1_pad = min(height, y + h + pad_amount)

                if DEBUG_SHOW_IDENTIFY:
                    # highlight for debugging
                    cv2.rectangle(
                        display_image,
                        (x0_pad, y0_pad),
                        (x1_pad, y1_pad),
                        (0, 255, 0),
                        2,
                    )
                    cv2.putText(
                        display_image,
                        f"{region_no}",
                        (x, y + 30),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.75,
                        (0, 255, 0),
                        2,
                        cv2.LINE_AA,
                    )

                rects.append([x0_pad, y0_pad, x1_pad, y1_pad])
                region_no += 1

        if DEBUG_PERFORM_OCR:
            import pytesseract

            for i, r in enumerate(rects):
                x0, y0, x1, y1 = r
                slice = original_image[y0:y1, x0:x1]
                print(
                    f"region {i + 1}/{len(rects)}:\n{pytesseract.image_to_string(slice).strip()}\n"
                )

        if DEBUG_SHOW_IDENTIFY:
            # debug: show the original image side by side with the masked out text
            text_regions = cv2.bitwise_and(enhanced, enhanced, mask=detected_regions)  # type: ignore
            cls.debug_show_image(
                # cv2.hconcat([display_image, cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)])
                cv2.hconcat(
                    [
                        display_image,
                        cv2.cvtColor(text_regions, cv2.COLOR_GRAY2BGR),
                    ]
                )
            )

        return rects

    @classmethod
    def extract_text(cls, text_regions, original_image):
        # TODO: Use NLP to get rid of links, stopwords, garbage characters, etc that Tesseract may pick up.

        # TODO: Figure out a way to improve the quality of the sliced image (such as resolution).

        # slices = [original_image[r[1] : r[3], r[0] : r[2]] for r in text_regions]

        for x0, y0, x1, y1 in text_regions:
            slice = original_image[y0:y1, x0:x1]
        # TODO: maybe get a RGB histogram of each of the slices and filter out the outliers
        # since histograms of RGB values for ideal slices are usually bimodal
        # - ignore bright backgrounds and try to ignore some of the values?
        # - apply Otsu thresholding on each of the slices?
        return

    @classmethod
    def filter_regions_shannon(
        cls, text_regions, original_image, entropy_threshold=4.6
    ):
        """
        Filters out image-like regions based on Shannon entropy.
        """

        image_gray = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
        entropy_map = entropy(image_gray, disk(7))

        final_rects = []
        for x0, y0, x1, y1 in text_regions:
            entropy_slice = entropy_map[y0:y1, x0:x1]
            mean_entropy = np.mean(entropy_slice)

            if mean_entropy > entropy_threshold:
                if DEBUG_SHOW_CLEAN:
                    cv2.rectangle(original_image, (x0, y0), (x1, y1), (0, 0, 255), 2)
            else:
                if DEBUG_SHOW_CLEAN:
                    cv2.rectangle(original_image, (x0, y0), (x1, y1), (0, 255, 0), 2)
                final_rects.append([x0, y0, x1, y1])

        if DEBUG_SHOW_CLEAN:
            cls.debug_show_image(original_image)

        return final_rects


def main():
    HARDCOPY_MULTI_PATH_1 = (
        "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    )
    HARDCOPY_MULTI_PATH_2 = (
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf"
    )
    ELECTRONIC_SINGLE_PATH = "./source_material/electronic_printouts/single/Slow Cooker Pineapple Pork Chops.pdf"

    print("Loading pages")
    pages = PDFUtils.load_pdf_pages(HARDCOPY_MULTI_PATH_2)
    print("Pages loaded")

    mser_deskew = cv2.MSER_create(  # type: ignore
        delta=2,
        min_area=20,
        max_area=2000,
        max_variation=0.2,
        max_evolution=1000,
    )

    mser_identify = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=45,
        max_area=1000,
        max_variation=0.1,
        max_evolution=1000,
    )
    for page in tqdm(pages, desc="Processing pages", unit="page"):
        rotated = PDFUtils.deskew_image(page, mser_deskew)
        if rotated is None:
            continue
        regions = PDFUtils.identify_text_regions(rotated, mser_identify)
        cleaned_regions = PDFUtils.filter_regions_shannon(regions, rotated)
        PDFUtils.extract_text(cleaned_regions, rotated)

    cv2.destroyAllWindows()

    return


if __name__ == "__main__":
    main()
