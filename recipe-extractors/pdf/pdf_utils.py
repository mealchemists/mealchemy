import pypdfium2
import cv2
import numpy as np
import pytesseract
import pdf2image

from cv2 import COLOR_RGB2BGR, dnn_superres  # type: ignore
from skimage.filters.rank import entropy
from skimage.morphology import disk

from tqdm import tqdm

DEBUG_PERFORM_OCR = False
DEBUG_SHOW_DESKEW = True
DEBUG_SHOW_IDENTIFY = False
DEBUG_SHOW_CLEAN = False

# https://github.com/fannymonori/TF-LapSRN/tree/master/export
MODEL_PATH = "./models/LapSRN_x2.pb"

DPI = 200


class PDFUtils:
    @classmethod
    def classify_pdf(cls):
        # TODO: Classify the PDF (i think its just a check to see whether or not the PDF has readable text)
        return

    @classmethod
    def debug_show_image(cls, image, window_name="test"):
        """
        Debug function to display an image.
        """

        cv2.imshow(window_name, image)
        cv2.waitKey(0)

    @classmethod
    def load_pdf_pages(cls, path, dpi=200):
        images = pdf2image.convert_from_path(path, dpi=dpi)
        return [cv2.cvtColor(np.array(img), COLOR_RGB2BGR) for img in images]

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

        mask = cls.create_mser_mask(blur, mser, kernel=(7, 5), iterations=5)
        edges = cv2.Canny(blur, 50, 200)
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
        mask = np.zeros_like(image, dtype=np.uint8)

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

        # emphasize edges in the mask
        gradient_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel)
        gradient = cv2.morphologyEx(mask, cv2.MORPH_GRADIENT, gradient_kernel)

        combined = cv2.bitwise_or(mask, gradient)

        # fill gaps within connected regions
        close_kernel = cv2.getStructuringElement(
            cv2.MORPH_RECT, (int(kernel[0] * 1.5), int(kernel[1] * 1.5))
        )
        closed = cv2.morphologyEx(
            combined, cv2.MORPH_CLOSE, close_kernel, iterations=iterations
        )

        # remove small artifacts/noise
        opening_kernel = cv2.getStructuringElement(
            cv2.MORPH_RECT, (max(1, kernel[0] // 2), max(1, kernel[1] // 2))
        )
        final_mask = cv2.morphologyEx(
            closed, cv2.MORPH_OPEN, opening_kernel, iterations=1
        )
        return final_mask

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
        clahe = cv2.createCLAHE(clipLimit=1.25, tileGridSize=(12, 12))
        enhanced = clahe.apply(blurred)
        # apply adaptive gamma correction
        mean_intensity = np.mean(enhanced)
        gamma = np.interp(mean_intensity, [50, 200], [0.8, 2.0])
        enhanced = (cv2.pow(enhanced / 255.0, gamma) * 255).astype(np.uint8)

        mask = cls.create_mser_mask(enhanced, mser, kernel=(7, 5), iterations=3)

        edges = cv2.Canny(enhanced, 50, 200, L2gradient=True)

        # refine text region detection with the MSER mask as well as Canny edges
        combined_mask = cv2.bitwise_and(mask, edges)

        # merge nearby text regions of the mask
        edge_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 7))
        dilated_combined_mask = cv2.dilate(combined_mask, edge_kernel, iterations=3)

        contours, _ = cv2.findContours(
            dilated_combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
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
            text_regions = cv2.bitwise_and(
                enhanced, enhanced, mask=dilated_combined_mask
            )  # type: ignore
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
        sr = dnn_superres.DnnSuperResImpl_create()  # type: ignore
        sr.readModel(MODEL_PATH)
        sr.setModel("lapsrn", 2)

        # TODO: Sharpen the image so that text characters are more well-defined
        image_lab = cv2.cvtColor(original_image, cv2.COLOR_BGR2LAB)

        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        image_lab[:, :, 0] = clahe.apply(image_lab[:, :, 0])
        enhanced_bgr = cv2.cvtColor(image_lab, cv2.COLOR_LAB2BGR)
        k = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(enhanced_bgr, -1, k)

        # cls.debug_show_image(cv2.hconcat([original_image, sharpened]))
        # return

        def preprocess_slice(slice):
            denoised = cv2.fastNlMeansDenoisingColored(slice, None, 30, 30, 7, 21)
            upsampled = sr.upsample(denoised)
            gray = cv2.cvtColor(upsampled, cv2.COLOR_BGR2GRAY)

            # TODO: Use morphology (erosion)
            _, binary = cv2.threshold(
                gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU
            )

            return binary

        # TODO: Use NLP to get rid of links, stopwords, garbage characters, etc that Tesseract may pick up.

        # TODO: Figure out a way to improve the quality of the sliced image (such as resolution).
        # OpenCV's DNN super resolution

        denoised_slices = [
            preprocess_slice(sharpened[y0:y1, x0:x1]) for x0, y0, x1, y1 in text_regions
        ]

        for slice in denoised_slices:
            cls.debug_show_image(slice)
        # for x0, y0, x1, y1 in text_regions:
        #     slice = original_image[y0:y1, x0:x1]
        #     upsampled = sr.upsample(slice)
        #
        #
        #
        #     print(pytesseract.image_to_string(upsampled).strip())

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
    pages = PDFUtils.load_pdf_pages(HARDCOPY_MULTI_PATH_2, dpi=DPI)
    print("Pages loaded")

    mser_deskew = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=20,
        max_area=2000,
        max_variation=0.12,
        max_evolution=1000,
    )

    mser_identify = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=100,
        max_area=1500,
        max_variation=0.09,
        max_evolution=1000,
    )
    for page in tqdm(pages, desc="Processing pages", unit="page"):
        rotated = PDFUtils.deskew_image(page, mser_deskew)
        if rotated is None:
            continue
        regions = PDFUtils.identify_text_regions(rotated, mser_identify)
        cleaned_regions = PDFUtils.filter_regions_shannon(regions, rotated)
        # PDFUtils.extract_text(cleaned_regions, rotated)

    cv2.destroyAllWindows()

    return


if __name__ == "__main__":
    main()
