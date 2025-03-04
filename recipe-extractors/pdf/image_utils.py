from logging import debug
import cv2
import numpy as np

# Implementation for image related utilities.
# TODO: (for utility) Implement a previewer (WSL2 should be fine with this)

# TODO: Implement PDF utilities (converting to image, working with multipage)

# TODO: Identify regions of structured text and segment them from the image.

# TODO: Apply a series of preprocessing operations to the image.
# When it comes to scans of recipe books:
#  - Denoising (bilateral or fastNlMeansDenoising)
#  - Adaptive thresholding (lighting)
#  - morphological closing (maybe some broken text?)
#  - deskewing
# When it comes to electronic printouts of websites:
#  - simple
#  - Use binary thresholding (this should be fine for most of the cases)
#  - maybe some sharpening to enhance contrast

DEBUG_PRINT = False
DEBUG_IDENTIFY = True


def debug_show_image(image, window_name="debug_image"):
    """
    Displays an image for debugging purposes.
    """
    cv2.imshow(window_name, image)

    cv2.waitKey(0)
    cv2.destroyAllWindows()


def threshold_image(image):
    """
    Applies adaptive thresholding to the given image, as
    electronic printouts / hardcopy scans are less complex, making
    Otsu's method a bit overkill (maybe).

    Should be used right before OCR.
    """

    # Adaptive threshold using a Gaussian-weighted sum
    binary = cv2.adaptiveThreshold(
        image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    return binary


def classify_image(image, threshold=500):
    """
    Classifies an image as an hardcopy scan or an electronic printout
    based on the background intensity variance.

    Usually electronic printouts have cleaner backgrounds.
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
    """
    Prepares an image given as an electronic printout into a thresholded image.
    Usually, electronic printouts are not very noisy to begin with.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # perform a bit of sharpening to help with contrast
    # since the image is an electronic printout, it should already be pretty clean to begin with
    sharpening_kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    sharpened = cv2.filter2D(gray, -1, sharpening_kernel)

    return threshold_image(sharpened)


def prepare_hardcopy_scan(image):
    """
    Prepares an image given as a hardcopy scan into a thresholded image.
    Some denoising is used here.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # h: strength of filtering
    # templateWindowSize: odd int defining the size of the region around a
    #                     pixel used for noise reduction
    # searchWindowSize: defines how far the algorithm looks to find similar
    #                   patches
    denoised = cv2.fastNlMeansDenoising(
        gray, dst=None, h=30, templateWindowSize=7, searchWindowSize=21
    )
    thresholded = threshold_image(denoised)
    # TODO: deskew the image

    return thresholded


def deskew_image(image):
    """
    Deskews a unprocessed image using Canny edge detection, and a Hough line transform.
    NOTE: might be better to dilate text blocks and then identify the largest contour, minarearect, ...
    """
    original = image.copy()
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)

    if lines is not None:
        angles = []
        for _, theta in lines[:, 0]:
            angle = (theta * (180 / np.pi)) - 90
            angles.append(angle)

        if angles:
            median_angle = np.median(angles, axis=0)
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)

            # INTER_CUBIC and INTER_LINEAR both enlarge the original image when we are enlarging it
            # note that INTER_CUBIC is more computationally expensive but has better quality
            image = cv2.warpAffine(original, M, (w, h), flags=cv2.INTER_LINEAR)

    return original


def preprocess_image(image):
    """
    Tesseract-OCR already performs a bit of image processing internally, but we can
    (at least try to) improve the quality of the output by a bit when we are performing
    the following operations.
    """

    is_hardcopy_scan = classify_image(image) == "hardcopy"

    if is_hardcopy_scan:
        prepare_hardcopy_scan(image)
    else:
        prepare_electronic_printout(image)

    return image


def identify_text_regions(image, dim=(320, 320), min_confidence=0.5):
    """
    Identifies regions of text from an image using OpenCV's
    (Efficient and Accurate Scene Text) detector.

    Implementation source: https://github.com/gifflet/opencv-text-detection
    Model source: https://github.com/oyyd/frozen_east_text_detection.pb
    """

    if any([d % 32 != 0 for d in dim]):
        raise (ValueError("Dimensions must be a given as a multiple of 32!"))

    original = image.copy()
    (H, W) = image.shape[:2]

    # The EAST model requires the input dimensions of the image to be a multiple of 32
    #  - larger sizes increase accuracy at the cost of speed
    # Use scaling factors to ensure aspect ratio preservation
    newW, newH = dim
    rW, rH = W / newW, H / newH

    model = cv2.dnn.readNet("models/frozen_east_text_detection.pb")

    # identify probability of text presence, as well as bounding box geometry
    layers = ["feature_fusion/Conv_7/Sigmoid", "feature_fusion/concat_3"]

    # the EAST model also requires that the image is in the correct format
    blob = cv2.dnn.blobFromImage(
        image,
        scalefactor=1.0,
        mean=(123.68, 116.78, 103.94),  # Mean RGB pixel values computed from ImageNet
        swapRB=True,
        crop=False,
    )
    model.setInput(blob)
    (scores, geometry) = model.forward(layers)

    rects = []
    confidences = []

    for y in range(0, geometry.shape[2]):
        scores_data = scores[0, 0, y]
        x_data0 = geometry[0, 0, y]
        x_data1 = geometry[0, 1, y]
        x_data2 = geometry[0, 2, y]
        x_data3 = geometry[0, 3, y]
        angles_data = geometry[0, 4, y]

        for x in range(0, geometry.shape[3]):
            if scores_data[x] <= min_confidence:
                continue

            offset_x, offset_y = (x * 4.0, y * 4.0)

            # obtain the cosines and sines of the rotation angles for prediction
            cos, sin = (np.cos(angles_data[x]), np.sin(angles_data[x]))

            w, h = (x_data0[x] + x_data2[x], x_data1[x] + x_data3[x])

            # bounding box
            end_x = int(offset_x + (cos * x_data1[x]) + (sin * x_data2[x]))
            end_y = int(offset_y + (sin * x_data1[x]) + (cos * x_data2[x]))
            start_x = int(end_x - w)
            start_y = int(end_y - h)

            rects.append((start_x, start_y, end_x, end_y))
            confidences.append(scores_data[x])

        # TODO: Non-max suppression for `rects` to suppress weak, overlapping bounding boxes

    # if DEBUG_IDENTIFY:
    #     for start_x, start_y, end_x, end_y in rects:
    #         start_x = int(start_x * rW)
    #         start_y = int(start_y * rH)
    #         end_x = int(end_x * rW)
    #         end_y = int(end_y * rH)
    #
    #         cv2.rectangle(original, (start_x, start_y), (end_x, end_y), (0, 255, 0), 2)
    #
    #         debug_show_image(original)

    return
