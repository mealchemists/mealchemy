import pypdfium2
import cv2
import numpy as np
import pytesseract


# TODO: Identify and extract text regions of the PDF using OCR.
# If we are dealing with a printed PDF, then there is most likely highlightable text.


DEBUG_PERFORM_OCR = False
DEBUG_DESKEW = False


def debug_show_image(image, window_name="test"):
    cv2.imshow(window_name, image)
    cv2.waitKey(0)


def load_pdf_pages(path, scale_factor=1.75):
    """
    Loads the pages of a PDF to numpy format.
    The pixmap from the PDF page is rendered at a larger size to help with
    OCR (higher PPI usually yields better results)
    """
    pdf = pypdfium2.PdfDocument(path)
    return [p.render(scale=scale_factor).to_numpy() for p in pdf]  # type: ignore


def load_pdf_text(path):
    pdf = pypdfium2.PdfDocument(path)

    extracted_text = []

    for page in pdf:
        text_page = page.get_textpage()
        text = text_page.get_text_range()
        extracted_text.append(text.strip())

    return extracted_text


# this should be done before we do any text segmentation
def deskew_image(image, mser):
    # preprocess image with MSER to help with identifying the Hough lines
    # which basically represent the orientation of the document
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)

    mask = create_mser_mask(blur, mser, kernel=(7, 3), iterations=5)
    edges = cv2.Canny(blur, 50, 150, apertureSize=3)
    masked_edges = cv2.bitwise_and(edges, edges, mask=mask)

    lines = cv2.HoughLinesP(
        masked_edges, 1, np.pi / 180, threshold=80, minLineLength=120, maxLineGap=20
    ).astype(float)

    angles = []
    if lines is not None:
        for line in lines:
            x0, y0, x1, y1 = line[0]
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
            borderMode=cv2.BORDER_REPLICATE,
        )

        if DEBUG_DESKEW:
            # debug test
            display_image = image.copy()
            for line in lines:
                x0, y0, x1, y1 = line[0]
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

            # debug_show_image(cv2.hconcat([display_image, rotated]))
            debug_show_image(cv2.hconcat([padded_display, padded_rotated]))

        return rotated


def create_mser_mask(image, mser, kernel=(5, 5), iterations=3):
    """
    Creates a mask from a grayscale image `image` that likely
    represents text using MSER.
    """

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

    regions, _ = mser.detectRegions(image)
    mask = np.zeros_like(image)
    for region in regions:
        hull = cv2.convexHull(region.reshape(-1, 1, 2))
        cv2.drawContours(mask, [hull], -1, (255, 255, 255), -1)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, kernel)
    mask = cv2.morphologyEx(
        mask, cv2.MORPH_CLOSE, kernel, iterations=iterations
    )  # connect likely regions of text (but not too much)

    return mask


def identify_text_regions(original_image, mser, pad_amount=3):
    display_image = original_image.copy()
    image = original_image.copy()

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    gamma = 1.7
    blur_kernel = (5, 5)
    blurred = cv2.GaussianBlur(gray, blur_kernel, 0)
    # Emphasize dark regions (such as text) more
    enhanced = (cv2.pow(blurred / 255.0, gamma) * 255).astype(np.uint8)
    mask = create_mser_mask(enhanced, mser, kernel=(5, 7), iterations=2)

    edges = cv2.Canny(enhanced, 10, 50, L2gradient=True)

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
        iterations=3,  # clean up
    )

    # TODO: Handle nested regions from findContours.
    #       Handle the order on which contours are recognized (columnwise/rowwise read order)
    contours, _ = cv2.findContours(
        detected_regions, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    rects = []

    # obtain and draw the regions to perform OCR on
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

            # highlight for debugging
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
    text_regions = cv2.bitwise_and(enhanced, enhanced, mask=detected_regions)  # type: ignore
    debug_show_image(
        # cv2.hconcat([display_image, cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)])
        cv2.hconcat(
            [
                display_image,
                cv2.cvtColor(text_regions, cv2.COLOR_GRAY2BGR),
            ]
        )
    )

    return rects


def extract_text(text_regions, original_image):
    # TODO: Use NLP to get rid of links, stopwords, garbage characters, etc that Tesseract may pick up.

    slices = [original_image[r[1] : r[3], r[0] : r[2]] for r in text_regions]

    # TODO: maybe get a RGB histogram of each of the slices and filter out the outliers
    # since histograms of RGB values for ideal slices are usually bimodal
    # - ignore bright backgrounds and try to ignore some of the values?
    # - apply Otsu thresholding on each of the slices?

    # TODO: API reference and usage - needs testing
    # slices_denoised = cv2.fastNlMeansDenoisingColoredMulti(slices, )

    return


if __name__ == "__main__":
    HARDCOPY_MULTI_PATH_1 = (
        "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    )
    HARDCOPY_MULTI_PATH_2 = (
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf"
    )
    ELECTRONIC_SINGLE_PATH = "./source_material/electronic_printouts/single/Slow Cooker Pineapple Pork Chops.pdf"

    print("Loading pages")
    pages = load_pdf_pages(HARDCOPY_MULTI_PATH_2)
    print("Pages loaded")

    mser = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=45,
        max_area=1000,
        max_variation=0.2,
        min_diversity=0.2,
        max_evolution=1000,
    )

    for page in pages:
        rotated = deskew_image(page, mser)
        identify_text_regions(rotated, mser)

    cv2.destroyAllWindows()
