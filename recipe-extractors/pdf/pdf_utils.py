import pypdfium2
import cv2
import numpy as np
import argparse
import warnings
import multiprocessing as mp

from time import perf_counter
from cv2 import dnn_superres  # type: ignore
from pdf2image.exceptions import PopplerNotInstalledError
from pytesseract import TesseractNotFoundError

try:
    import pytesseract

    _ = pytesseract.get_tesseract_version()
except TesseractNotFoundError as e:
    print(e)
    exit(-1)
try:
    import pdf2image

except PopplerNotInstalledError as e:
    print(e)
    exit(-1)

DEBUG_DISPLAY_OCR_PRECURSOR = False
DEBUG_SHOW_DESKEW = False
DEBUG_SHOW_IDENTIFY = False
DEBUG_SHOW_CLEAN = False

# https://github.com/fannymonori/TF-LapSRN/tree/master/export
MODEL_PATH = "./models/LapSRN_x2.pb"

MIN_ASPECT_RATIO = 0.1
MAX_ASPECT_RATIO = 10

# Allow only alphanumeric charaacters, as well as common punctuation that would be found in recipes.
# page segmentation mode of 6 assumes the that the input image should give as a single uniform block of text
# NOTE: Tesseract-OCR is not good at reading vulgar fractions; this is a known issue.
TESSERACT_CONFIG = r'--psm 6 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()[]%°/-\'•⅛¼⅜½⅝¾⅞ "'
DPI = 200


class PDFUtils:
    @classmethod
    def classify_pdf(cls, page):
        # TODO: Classify the PDF (i think its just a check to see whether or not the PDF has readable text)

        return

    @classmethod
    def debug_show_image(cls, images, window_name="Press 'SPACE' to continue"):
        """
        Debug function to display one (or more) images side by side.
        """

        cv2.imshow(window_name, cv2.hconcat(images))
        while True:
            key = cv2.waitKey(1) & 0xFF
            if key == ord(" "):
                break

    @classmethod
    def load_pdf_pages(cls, path, dpi=DPI):
        n_threads = mp.cpu_count()
        images = pdf2image.convert_from_path(path, dpi=dpi, thread_count=n_threads)
        return [cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR) for img in images]

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
    def deskew_image(cls, image):
        """
        Corrects the rotation of an image based on the Hough lines transform.
        This should be done before we perform any text identification.
        """

        mser = cv2.MSER_create(  # type: ignore
            delta=4,
            min_area=20,
            max_area=2000,
            max_variation=0.12,
            max_evolution=1000,
        )

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

                cls.debug_show_image([padded_display, padded_rotated])

            return rotated, median_angle

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
    def extract_text(cls, original_image, text_regions):
        """
        Performs OCR on each slice and extracts the raw text from.
        """

        def preprocess_slice(slice):
            # Tessseract works best with binarized, deskewed, and denoised images
            # with an appropriate resolution (~300 DPI is recommended).
            denoised = cv2.fastNlMeansDenoisingColored(slice, None, 30, 30, 7, 21)
            upsampled = sr.upsample(denoised)
            gray = cv2.cvtColor(upsampled, cv2.COLOR_BGR2GRAY)

            # use Sauvola thresholding to handle slices that have non-uniform lighting
            binary = cv2.ximgproc.niBlackThreshold(
                gray,
                255,
                cv2.THRESH_BINARY_INV,
                blockSize=31,
                k=0.08,
                binarizationMethod=cv2.ximgproc.BINARIZATION_SAUVOLA,
            )

            return binary

        sr = dnn_superres.DnnSuperResImpl_create()  # type: ignore
        sr.readModel(MODEL_PATH)
        sr.setModel("lapsrn", 2)

        # sharpen the image a little bit
        k = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(original_image, -1, k)

        prepared_slices = [
            preprocess_slice(sharpened[y0:y1, x0:x1]) for x0, y0, x1, y1 in text_regions
        ]

        content = []
        for prepared in prepared_slices:
            text = pytesseract.image_to_string(
                prepared, config=TESSERACT_CONFIG
            ).strip()

            if text == "":
                continue

            if DEBUG_DISPLAY_OCR_PRECURSOR:
                print(text)
                cls.debug_show_image([cv2.cvtColor(prepared, cv2.COLOR_GRAY2BGR)])

            content.append(text)

        return content

    @classmethod
    def identify_text_regions(cls, original_image, pad_amount=(7, 3)):
        """
        Identifies blocks of text using Tesseract in a possibly unordered fashion.

        NOTE: The order at which blocks will appear can depend on the
        orientation of the text (organized by columns or rows).
        """

        denoised = cv2.fastNlMeansDenoisingColored(
            original_image,
            None,
            h=10,
            hColor=5,
            templateWindowSize=7,
            searchWindowSize=21,
        )

        # enhance image contrast for faded text
        gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.1, tileGridSize=(16, 16))
        enhanced = clahe.apply(gray)

        # get boxes first of all using tesseract, then combine to obtain blocks of text
        data = pytesseract.image_to_data(enhanced, config=f"--dpi {DPI}")
        h, w = original_image.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)

        word_data = data.splitlines().copy()
        for i, d in enumerate(word_data):
            # first entry is the header of the data of the format:
            # level, page_num, block_num, par_num, line_num, word_num, left, top, width, height, confidence, text
            if i == 0:
                continue

            # left, top, width, height, confidence, text
            data = d.split("\t")[6:12]
            confidence = float(data[4])
            word = data[-1]

            # filter out regions of the image that are most likely not text
            if confidence < 0:
                continue
            if word.strip() == "":
                continue

            # NOTE: Tessearct uses the following measurements (left, top, width, height) for the coordinates.
            # The coordinate system should still be the same as OpenCV.
            x0 = int(data[0])
            y0 = int(data[1])
            x1 = int(data[0]) + int(data[2])
            y1 = int(data[1]) + int(data[3])

            # pad around each of the regions
            x0_pad = max(x0 - pad_amount[0], 0)
            y0_pad = max(y0 - pad_amount[1], 0)
            x1_pad = min(w, x1 + pad_amount[0])
            y1_pad = min(h, y1 + pad_amount[1])

            b_width = x1_pad - x0_pad
            b_height = y1_pad - y0_pad
            if b_height == 0:
                continue

            # filter out horizontal/vertical lines (extreme aspect ratios)
            aspect_ratio = b_width / b_height
            if aspect_ratio <= MIN_ASPECT_RATIO or aspect_ratio >= MAX_ASPECT_RATIO:
                continue

            # focus on the regions of the image where there is likely text
            mask = cv2.rectangle(mask, (x0_pad, y0_pad), (x1_pad, y1_pad), 255, -1)

        # connect regions together in terms of connected components
        # this helps if Tesseract misses some words in a sentence
        close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, close_kernel, iterations=4)

        dilate_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 3))
        mask = cv2.dilate(mask, dilate_kernel, iterations=5)

        # identify and collect the blocks of text from the mask (obtain bounding boxes)
        regions = []
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in reversed(contours):
            x, y, w, h = cv2.boundingRect(contour)
            x0, y0, x1, y1 = x, y, x + w, y + h
            regions.append([x0, y0, x1, y1])

        if DEBUG_SHOW_IDENTIFY:
            region_no = 1
            masked_regions = cv2.bitwise_and(enhanced, enhanced, mask=mask)

            # draw rectangles and number them
            for x0, y0, x1, y1 in regions:
                cv2.rectangle(original_image, (x0, y0), (x1, y1), (0, 255, 0), 2)
                cv2.putText(
                    original_image,
                    f"{region_no}",
                    (x0, y0 + 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.75,
                    (0, 255, 0),
                    2,
                    cv2.LINE_AA,
                )

                region_no += 1

            PDFUtils.debug_show_image(
                [original_image, cv2.cvtColor(masked_regions, cv2.COLOR_GRAY2BGR)]
            )

        return regions

    @classmethod
    def load_extract_text_hardcopy(cls, path, dpi=DPI, verbose=False):
        """
        Pipeline to load a PDF from a path and extract raw text in a (possibly) unordered fashion.
        """
        start_time = 0
        extracted_raw_texts = []

        # TODO: Look into debug logging, warnings, etc.
        # Also look into potential performance improvements.

        if verbose:
            start_time = perf_counter()
        pages = cls.load_pdf_pages(path, dpi)
        if verbose:
            print(f"loaded {len(pages)} in {perf_counter() - start_time:.2f} s")

        for i, page in enumerate(pages):
            # 1. rotate the page.
            if verbose:
                start_time = perf_counter()
            rotated, angle = cls.deskew_image(page)  # type: ignore
            if verbose:
                print(
                    f"deskewed page by {angle:.2f} degrees in {perf_counter() - start_time} s"
                )
            if rotated is None:
                warnings.warn(
                    f"Could not deskew PDF page {i + 1}, using original page as fallback"
                )
                rotated = page
                continue

            # 2. identify groups of structured text from the page.
            if verbose:
                start_time = perf_counter()
            regions = cls.identify_text_regions(rotated)
            if verbose:
                print(
                    f"identfied {len(regions)} in {perf_counter() - start_time:.2f} s"
                )
            if len(regions) <= 1:
                warnings.warn(f"Unable to extract page {i + 1}")
                continue

            # 3. extract the text from each of the identified groups.
            if verbose:
                start_time = perf_counter()
            raw_text_sections = cls.extract_text(rotated, regions)
            if verbose:
                print(f"extracted text in {(perf_counter() - start_time):.2f} s")

            extracted_raw_texts.append(raw_text_sections)

        return extracted_raw_texts


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

    for i, page in enumerate(pages):
        print(f"---PAGE {i + 1} of {len(pages)}---")
        rotated, _ = PDFUtils.deskew_image(page)  # type: ignore
        if rotated is None:
            print("Unable to rotate!")
            rotated = page

        print("Identifying text regions")
        regions = PDFUtils.identify_text_regions(rotated)
        print(f"{len(regions)} regions identified")

        print("Extracting text")
        text = PDFUtils.extract_text(rotated, regions)

        if not DEBUG_DISPLAY_OCR_PRECURSOR:
            print("")
            print(*text, sep="\n")

    cv2.destroyAllWindows()

    return


def parse_args():
    global \
        DEBUG_DISPLAY_OCR_PRECURSOR, \
        DEBUG_SHOW_DESKEW, \
        DEBUG_SHOW_IDENTIFY, \
        DEBUG_SHOW_CLEAN

    parser = argparse.ArgumentParser()
    parser.add_argument("-d", action="store_true", help="Show deskewing")
    parser.add_argument("-i", action="store_true", help="Show identification")
    parser.add_argument("-c", action="store_true", help="Show text region cleaning")
    parser.add_argument("-o", action="store_true", help="Show preprocessed OCR images")

    args = parser.parse_args()

    if args.d:
        DEBUG_SHOW_DESKEW = True
    if args.i:
        DEBUG_SHOW_IDENTIFY = True
    if args.c:
        DEBUG_SHOW_CLEAN = True
    if args.o:
        DEBUG_DISPLAY_OCR_PRECURSOR = True

    return


if __name__ == "__main__":
    parse_args()
    main()
