import os
import json
import argparse

from dotenv import load_dotenv
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from pdf_utils import PDFUtils
from time import perf_counter

import sys
from pathlib import Path

# allow relative imports (for testing)
sys.path.append(str(Path(__file__).parent.parent))

from llm import PDF_SYSTEM_PROMPT

load_dotenv()

DPI = 200
USE_OPENAI = False
FILE_PATH = ""


if USE_OPENAI:
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
        max_completion_tokens=3000,
        api_key=os.getenv("OPENAI_ECE493_G06_KEY"),  # type: ignore
    )
else:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-pro-latest",
        temperature=0.3,
        max_tokens=3000,
        api_key=os.getenv("GEMINI_API_KEY"),  # type: ignore
    )


def main():
    # initialize LLM components
    human_message = HumanMessagePromptTemplate.from_template("{input}")
    system_message = SystemMessagePromptTemplate.from_template(PDF_SYSTEM_PROMPT)
    chat_prompt = ChatPromptTemplate.from_messages([system_message, human_message])

    chain = chat_prompt | llm

    print("Loading pages")
    tstart = perf_counter()
    pages = PDFUtils.load_pdf_pages_path(FILE_PATH, dpi=DPI)
    print(f"  Loaded {len(pages)} pages in {(perf_counter() - tstart):.2f}s")

    model_name = "gpt-4o-mini" if USE_OPENAI else "gemini-1.5-pro-latest"
    print(f"Using model: {model_name}")

    for i, page in enumerate(pages):
        print(f"---PAGE {i + 1} OF {len(pages)}---")

        # 1. deskew
        tstart = perf_counter()
        deskewed, rotation_angle = PDFUtils.deskew_image(page)  # type: ignore
        if deskewed is None:
            print()
            continue
        print(
            f"  Deskewed page by {rotation_angle:.2f} degrees in {(perf_counter() - tstart):.2f}s"
        )

        # 2. identify groups of structured text from the page.
        tstart = perf_counter()
        regions = PDFUtils.identify_text_regions(deskewed)
        if len(regions) <= 1:
            print("  Unable to extract!")
            continue
        print(
            f"  Identified {len(regions)} regions in {(perf_counter() - tstart):.2f}s"
        )

        # 3. extract the text from each of the identified texts.
        tstart = perf_counter()
        content = PDFUtils.extract_text(deskewed, regions)
        print(f"  Extracted content in {(perf_counter() - tstart):.2f}s")
        formatted = chain.invoke({"input": "\n".join(content)})

        try:
            parsed = json.loads(str(formatted.content))
            # NOTE: At this point, you can identify which fields were and were not successfully
            # extracted.
            print(json.dumps(parsed, indent=4))
        except json.JSONDecodeError:
            print("  Cannot convert to JSON!")

        _ = input("Press ENTER to continue\n")

    return


def parse_args():
    global USE_OPENAI, FILE_PATH

    def check_valid_path(path):
        if os.path.isfile(path) and path.endswith(".pdf"):
            return path
        return argparse.ArgumentTypeError(f"{path} is not a PDF file.")

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path",
        type=check_valid_path,
        required=True,
        help="Path to the source PDF",
    )
    parser.add_argument(
        "-o",
        action="store_true",
        help="Use GPT-4o-mini (otherwise gemini-1.5 pro-latest)",
    )

    args = parser.parse_args()

    if args.o:
        USE_OPENAI = True
    if args.path:
        FILE_PATH = args.path

    return


if __name__ == "__main__":
    parse_args()
    main()
