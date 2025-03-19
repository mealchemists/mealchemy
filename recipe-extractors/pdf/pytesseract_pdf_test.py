from pdf_utils import parse_args
from pdf_utils import PDFUtils
import cv2
import pytesseract
from tqdm import tqdm

import numpy as np

DPI = 200
# filter regions only with extreme aspect ratios
MIN_ASPECT_RATIO = 0.1
MAX_ASPECT_RATIO = 10


def test_identify_text_regions(original_image, pad_amount=(7, 3)):
    denoised = cv2.fastNlMeansDenoisingColored(
        original_image, None, h=10, hColor=5, templateWindowSize=7, searchWindowSize=21
    )

    gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.1, tileGridSize=(16, 16))
    enhanced = clahe.apply(gray)

    # adaptive gamma correction based on grayscale image intensity
    mean_intensity = np.mean(enhanced)
    gamma = np.interp(mean_intensity, [50, 200], [0.8, 2.0])
    enhanced = (cv2.pow(enhanced / 255.0, gamma) * 255).astype(np.uint8)

    # get boxes
    # dilate and then perform some closing
    data = pytesseract.image_to_data(enhanced)
    h, w = original_image.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 5))

    regions = []
    word_data = data.splitlines().copy()
    for i, d in enumerate(word_data):
        color = (0, 255, 0)
        # first entry is the header of the data
        if i == 0:
            continue

        # level, page_num, block_num, par_num, line_num, word_num, left, top, width, height, confidence, text
        # left, top, width, height, confidence
        data = d.split("\t")[6:12]
        confidence = float(data[4])
        word = data[-1]

        if confidence < 0:
            color = (0, 0, 255)
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

        aspect_ratio = b_width / b_height

        if aspect_ratio <= MIN_ASPECT_RATIO or aspect_ratio >= MAX_ASPECT_RATIO:
            continue

        original_image = cv2.rectangle(
            original_image,
            (x0_pad, y0_pad),
            (x1_pad, y1_pad),
            color,
            2,
        )

        mask = cv2.rectangle(mask, (x0_pad, y0_pad), (x1_pad, y1_pad), 255, -1)

    # remove noisy regions
    # open_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    # mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, open_kernel, iterations=1)

    # connect regions together
    # mask = cv2.dilate(mask, kernel, iterations=3)

    erode_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    mask = cv2.erode(mask, erode_kernel, iterations=3)
    # mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    regions = cv2.bitwise_and(enhanced, enhanced, mask=mask)
    PDFUtils.debug_show_image(
        [original_image, cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)]
    )

    return regions


def main():
    HARDCOPY_MULTI_PATH_1 = (
        "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    )
    HARDCOPY_MULTI_PATH_2 = (
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf"
    )
    ELECTRONIC_SINGLE_PATH = "./source_material/electronic_printouts/single/Slow Cooker Pineapple Pork Chops.pdf"

    print("Loading pages")
    pages = PDFUtils.load_pdf_pages(HARDCOPY_MULTI_PATH_1, dpi=DPI)
    print("Pages loaded")

    mser_deskew = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=20,
        max_area=2000,
        max_variation=0.12,
        max_evolution=1000,
    )

    for page in tqdm(pages, desc="Processing pages", unit="page"):
        rotated = PDFUtils.deskew_image(page, mser_deskew)
        if rotated is None:
            continue
        # regions = PDFUtils.identify_text_regions(rotated, mser_identify)
        regions = test_identify_text_regions(rotated)
        # cleaned_regions = PDFUtils.filter_regions_shannon(regions, rotated)

    cv2.destroyAllWindows()

    return


if __name__ == "__main__":
    parse_args()
    main()
