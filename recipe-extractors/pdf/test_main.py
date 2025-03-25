import pytesseract
from pytesseract import TesseractNotFoundError

import os
from pathlib import Path
import argparse

from pdf_utils import PDFUtils

TEST_SINGLE = False  # single-page PDFs
TEST_MULTI = False  # multi-page PDFs
TEST_HARDCOPY_SCANS = False
TEST_ELECTRONIC_PRINTOUTS = False

SRC_PATH = Path("./source_material/")

"""
Integration test suite for PDF extraction.

Criteria: All recipe data is extracted and complete from a single page of a hardcopy
PDF scan.
"""


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


if __name__ == "__main__":
    main()
