import cv2
import numpy as np

# Implementation for image related utilities.
# TODO: (for utility) Implement a previewer (WSL2 should be fine with this)

# TODO: Implement PDF utilities (converting to image, working with multipage)

# TODO: Identify regions of structured text and segment them from the image.

# TODO: Apply a series of preprocessing operations to the image.
# We should handle whether or not the image is given as a hardcopy scan or an electronic printout.
#  - Noisy images (denoising, morphology)
#  - Uneven lighting (adaptive thresholding)
#  - Faint or low contrast text (CLAHE + sharpening)
#  - Rotated text (deskewing)
#  - Small text gaps (morphological text closing)
#  - Non-text areas present (contour filtering)

# When it comes to scans of recipe books:
#  - Denoising (bilateral or fastNlMeansDenoising)
#  - Adaptive thresholding (lighting)
#  - morphological closing (maybe some broken text?)
#  - deskewing

# When it comes to electronic printouts of websites:
#  - simple
#  - Use binary thresholding (this should be fine for most of the cases)
#  - maybe some sharpening to enhance contrast


def classify_image(image, threshold=500):
    """
    Classifies an image as an hardcopy scan or an electronic printout
    based on the background intensity variance.
    """

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Variance represents background noise and background
    # scans have higher variance
    if np.var(blurred) > threshold:
        return "hardcopy"
    else:
        return "printout"


def prepare_electronic_printout(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

    # perform a little bit of sharpening
    # the image should already be given as a clean printout
    sharpening_kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])

    return cv2.filter2D(binary, -1, sharpening_kernel)


def prepare_hardcopy_scan(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # h: strength of filtering
    # templateWindowSize: odd int defining the size of the region around a
    #                     pixel used for noise reduction
    # searchWindowSize: defines how far the algorithm looks to find similar
    #                   patches
    denoised = cv2.fastNlMeansDenoising(
        gray, dst=None, h=30, templateWindowSize=7, searchWindowSize=21
    )
    binary = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return binary


def preprocess_image(image):
    """
    Tesseract-OCR already performs a bit of image processing interanally, but we can
    (at least try to) improve the quality of the output by a bit when we are performing
    the following operations.
    """

    is_hardcopy_scan = classify_image(image) == "hardcopy"

    if is_hardcopy_scan:
        prepare_hardcopy_scan(image)
    else:
        prepare_electronic_printout(image)

    return image
