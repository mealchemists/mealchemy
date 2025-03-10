import pypdfium2
import cv2
import numpy as np

import glob
import os
import math

# TODO: Apply deskewing if necessary to the PDF before we identify any regions of text.

# TODO: Identify and extract text regions of the PDF using OCR.
# If we are dealing with a printed PDF, then there is most likely highlightable text.

DEBUG_PERFORM_OCR = True


def debug_show_image(image, window_name="test"):
    cv2.imshow(window_name, image)
    cv2.waitKey(0)


def load_pdf_pages(path, scale_factor=1.75):
    """
    Loads the pages of a PDF to numpy format.
    Some additional upscaling is performed to help with text identification.
    """
    pdf = pypdfium2.PdfDocument(path)
    return [p.render(scale=scale_factor).to_numpy() for p in pdf]  # type: ignore


def load_pdf_text(path):
    pdf = pypdfium2.PdfDocument(path)

    extracted_text = []

    for page in pdf:
        text_page = page.get_textpage()
        text = text_page.get_text_range()
        extracted_text.append(text)

    return extracted_text


# this should be done before we do any text recognition
def deskew_image(image):
    # TODO: Use morphological operations to dilate text regions and then
    # use minAreaRect to obtain the rotation angle of a bounding box.
    return


# TODO: Identify regions of text. (either via contour detection with morphological operations, SWT or MSER)
def identify_text_regions_mser(image, pad_amount=7):
    display_image = image.copy()
    original_image = image.copy()

    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    blur_kernel = (7, 7)
    sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    image = cv2.GaussianBlur(image, blur_kernel, 0)
    image = cv2.filter2D(image, -1, sharpen_kernel)

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
    #   - larger value reduces redudancy by favoring more diverse regions

    mser = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=40,
        max_area=2000,
        max_variation=0.3,
        min_diversity=0.2,
        max_evolution=500,
    )
    regions, _ = mser.detectRegions(image)

    mask = np.zeros_like(image)

    for region in regions:
        # each contour that is drawn is a likely region of text (such as a word) from MSER
        hull = cv2.convexHull(region.reshape(-1, 1, 2))
        cv2.drawContours(mask, [hull], -1, (255, 255, 255), -1)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 3))  # (width, height)
    mask = cv2.morphologyEx(
        mask, cv2.MORPH_CLOSE, kernel, iterations=5
    )  # connect identified regions of text

    # NOTE: you can find contours from the closed mask and then obtain the bounding boxes
    # that we can slice from the image, and perform OCR on. OCR will perform better on more specific
    # regions of text.
    # TODO: Handle nested regions from findContours.
    #       Handle the order on which contours are recognized (columnwise/rowwise read order)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    rects = []

    height, width, _ = original_image.shape

    min_area = 150
    region_no = 1
    for contour in reversed(contours):
        x, y, w, h = cv2.boundingRect(contour)

        area = w * h
        if area > min_area:
            x0_pad = max(x - pad_amount, 0)
            y0_pad = max(y - pad_amount, 0)
            x1_pad = min(width, x + w + pad_amount)
            y1_pad = min(height, y + h + pad_amount)
            cv2.rectangle(
                display_image, (x0_pad, y0_pad), (x1_pad, y1_pad), (0, 255, 0), 2
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

    # debug: show the original image side by side with the masked out text
    text_regions = cv2.bitwise_and(image, image, mask=mask)
    debug_show_image(
        cv2.hconcat([display_image, cv2.cvtColor(text_regions, cv2.COLOR_GRAY2RGB)])
    )

    return rects


if __name__ == "__main__":
    HARDCOPY_MULTI_PATH_1 = (
        "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    )
    HARDCOPY_MULTI_PATH_2 = (
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf"
    )
    ELECTRONIC_SINGLE_PATH = "./source_material/electronic_printouts/single/Slow Cooker Pineapple Pork Chops.pdf"

    print("Loading pages")
    pages = load_pdf_pages(HARDCOPY_MULTI_PATH_1)
    print("Pages loaded")
    for page in pages:
        identify_text_regions_mser(page)

    cv2.destroyAllWindows()
