import pytesseract
from pytesseract import TesseractNotFoundError

import os
from pathlib import Path
import argparse

import image_utils

TEST_SINGLE = False  # single-page PDFs
TEST_MULTI = False  # multi-page PDFs
TEST_HARDCOPY_SCANS = False
TEST_ELECTRONIC_PRINTOUTS = False

SRC_PATH = Path("./source_material/")

# Local test suite for PDF extraction. Will convert this to cover the main funcitonality as a service.

# from the source_material/ directory (that contains some selected pdfs)
# grab all the text from each images and save them (do not postprocess just yet)
#
# use OpenCV to:
#  - preprocess the image (note that Tesseract already does some of this for you; research the existing options)
#    (https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)
#  - identify the regions of structured text and obtain slices of the original image for each region
#    - Bullet points most likely that contain recipe steps/ingredients
#    - Paragraphs (recipe steps / description)
#    - Short regions of text (cook time, preparation time, and sometimes ingredients)
#  - from each slice, obtain the textual content for tesseract to extract from, and then
#    perform some postprocessing (heuristics? LLM?). we are expecting that text will be in a lot of disconnected pieces.

# NOTE: We will need to handle multipage PDFs, as well as PDFs that can contain several recipes.
# I think that the LLM will likely handle this, as well as correct any mistakes.


def check_tesseract():
    try:
        _ = pytesseract.get_tesseract_version()
    except TesseractNotFoundError as e:
        print(e)
        exit(-1)


def main():
    parse_args()
    check_tesseract()

    return


def run_image_tests():
    # operations for testing single, multi, hardcopy, electronic printouts
    # hardcopy/electronic first and then single/multi

    return


def parse_args():
    global TEST_SINGLE, TEST_MULTI, TEST_HARDCOPY_SCANS, TEST_ELECTRONIC_PRINTOUTS

    parser = argparse.ArgumentParser()
    parser.add_argument("--multi", action="store_true", help="Run tests for multi-PDFs")
    parser.add_argument(
        "--single", action="store_true", help="Run tests for single PDFs"
    )
    parser.add_argument("--h", action="store_true", help="Run tests for hardcopy scans")
    parser.add_argument(
        "--e", action="store_true", help="Run tests for electronic printouts"
    )

    args = parser.parse_args()

    if args.single:
        TEST_SINGLE = True
    if args.multi:
        TEST_MULTI = True
    if args.h:
        TEST_HARDCOPY_SCANS = True
    if args.e:
        TEST_ELECTRONIC_PRINTOUTS = True

    return


def test_image_utils():
    # for now just test an electronic printout of a single image

    pages = image_utils.load_pdf_pages(
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf",
    )

    return


if __name__ == "__main__":
    test_image_utils()
    main()
