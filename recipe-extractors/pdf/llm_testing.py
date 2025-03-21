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

load_dotenv()

DPI = 200
USE_OPENAI = False
FILE_PATH = ""

PDF_SYSTEM_PROMPT = (
    "You are a text processing expert. Your task is to take as input a list of strings "
    '(named "content") that are the results of OCR applied to scanned recipe pages. These strings may contain various sections such as the recipe name, description, source URL, '
    "cook time, prep time, total time, ingredients, and recipe steps. Note that OCR may introduce minor spelling errors; please correct these errors as best as possible without "
    "changing the intended grammatical structure.\n\n"
    "Your output should be a JSON object formatted exactly as follows (with proper indentation, no markdown code block formatting, and no extra text):\n\n"
    "{{\n"
    '  "recipe": {{\n'
    '    "name": "<recipe name>",\n'
    '    "description": "<recipe description>",\n'
    '    "source_url": "<source URL or null>",\n'
    '    "cook_time": <cook time as an integer, in minutes>,\n'
    '    "prep_time": <prep time as an integer, in minutes>,\n'
    '    "total_time": <total time as an integer, in minutes>\n'
    "  }},\n"
    '  "ingredients": [\n'
    '    {{"name": "<ingredient name>", "quantity": <quantity as a number>, "unit": "<unit>"}},\n'
    "    ...\n"
    "  ],\n"
    '  "steps": [\n'
    '    {{"step": <step number as integer>, "description": "<step description>"}},\n'
    "    ...\n"
    "  ]\n"
    "}}\n\n"
    "**Important:**\n"
    "- Organize the OCR content into the appropriate fields (recipe metadata, ingredients list, and steps).\n"
    "- Correct any minor spelling errors due to OCR without changing the overall grammatical structure.\n"
    '- Ensure that numerical values (times, quantities) are represented as numbers. If times or quantities are not explicitly specified, then set them to "null".\n'
    '- For fields that are not available or are extraneous (such as URLs, dates, or links), set them to "null" or exclude them as appropriate.\n'
    "- **For the ingredients list:**\n"
    "  - Extract the ingredient names exactly as they appear.\n"
    "  - If an ingredient description includes a commonly used measurement phrase, parse it as follows:\n"
    '      - For example, if the text is "three cloves of garlic", then the ingredient\'s "name" should be "cloves of garlic", the "quantity" should be 3, and the "unit" should be "null" if no explicit unit is provided.\n'
    '      - For example, if the text is "1 cup milk", then the ingredient\'s "name" should be "milk", the "quantity" should be 1, and the "unit" should be "cup".\n'
    '      - For example, if the text is "1 can of olives", then the ingredient\'s "name" should be "can of olives", the "quantity" should be 1, and the "unit" should be "null".\n'
    "- Output the JSON exactly in the specified format with proper keys and data types.\n"
    "- Your response should consist solely of the structured, prettily printed JSON string without any additional Markdown formatting."
)

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
        max_tokens=2500,
        api_key=os.getenv("GEMINI_API_KEY"),  # type: ignore
    )


def main():
    # initialize LLM components
    human_template = "Content: {content}"
    human_message = HumanMessagePromptTemplate.from_template(human_template)
    system_message = SystemMessagePromptTemplate.from_template(PDF_SYSTEM_PROMPT)
    chat_prompt = ChatPromptTemplate.from_messages([system_message, human_message])

    chain = chat_prompt | llm

    print("Loading pages")
    tstart = perf_counter()
    pages = PDFUtils.load_pdf_pages(FILE_PATH, dpi=DPI)
    print(f"  Loaded {len(pages)} pages in {(perf_counter() - tstart):.2f}s")

    model_name = "gpt-4o-mini" if USE_OPENAI else "gemini-1.5-pro-latest"
    print(f"Using model: {model_name}")

    for i, page in enumerate(pages):
        print(f"---PAGE {i + 1} OF{len(pages)}---")

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
        formatted = chain.invoke({"content": "\n".join(content)})

        try:
            parsed = json.loads(str(formatted.content))
            # NOTE: At this point, you can idenify which fields were and were not successfully
            # extracted.
            print(json.dumps(parsed, indent=4))
        except json.JSONDecodeError:
            print("  Cannot convert to JSON!")

        _ = input("Press any key to continue\n")

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
