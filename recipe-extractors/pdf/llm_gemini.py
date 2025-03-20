import cv2
import os
from dotenv import load_dotenv

from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_google_genai import ChatGoogleGenerativeAI
from pdf_utils import PDFUtils
from time import perf_counter
import json

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DPI = 200

# TEMPORARY FOR TESTING
SYSTEM_PROMPT = (
    "You are a text processing expert. Your task is to take as input a list of strings "
    "(named 'content') that are the results of OCR applied to scanned recipe pages. These strings may contain various sections such as the recipe name, description, source URL, cook time, prep time, total time, ingredients, and recipe steps. Note that OCR may introduce minor spelling errors; please correct these errors as best as possible without changing the intended grammatical structure.\n\n"
    "Your output should be a JSON object formatted exactly as follows:\n\n"
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
    "Follow these guidelines:\n"
    "- Organize the OCR content into the appropriate fields (recipe metadata, ingredients list, and steps).\n"
    "- Correct any minor spelling mistakes that occurred due to OCR without changing the overall grammatical structure.\n"
    "- Ensure that numerical values (times, quantities) are represented as numbers.\n"
    '- For fields that are not available or are extraneous (such as URLs, dates, or links), set them to "null" or exclude them as appropriate.\n'
    "- Output the JSON exactly in the specified format with proper keys and data types.\n\n"
    "Your response should consist solely of the prettily printed JSON string without any Markdown formatting."
)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro-latest",
    temperature=0.7,
    max_tokens=2500,
    api_key=GEMINI_API_KEY,
)  # type: ignore


def main():
    human_template = "Content: {content}"
    human_message = HumanMessagePromptTemplate.from_template(human_template)
    system_message = SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT)
    chat_prompt = ChatPromptTemplate.from_messages([system_message, human_message])

    chain = chat_prompt | llm

    HARDCOPY_MULTI_PATH_1 = (
        "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    )
    HARDCOPY_MULTI_PATH_2 = (
        "./source_material/hardcopy_scans/multi/White Binder Recipes.pdf"
    )
    ELECTRONIC_SINGLE_PATH = "./source_material/electronic_printouts/single/Slow Cooker Pineapple Pork Chops.pdf"

    print("Loading pages")
    tstart = perf_counter()
    pages = PDFUtils.load_pdf_pages(HARDCOPY_MULTI_PATH_2, dpi=DPI)
    print(f"loaded {len(pages)} pages in {(perf_counter() - tstart):.2f}s")

    mser_deskew = cv2.MSER_create(  # type: ignore
        delta=4,
        min_area=20,
        max_area=2000,
        max_variation=0.12,
        max_evolution=1000,
    )

    for i, page in enumerate(pages):
        print(f"PAGE {i + 1}")

        tstart = perf_counter()
        deskewed, rotation_angle = PDFUtils.deskew_image(page, mser_deskew)
        if deskewed is None:
            continue
        print(f"deskewed page by {rotation_angle} in {(perf_counter() - tstart):.2f}s")

        tstart = perf_counter()
        regions = PDFUtils.identify_text_regions(deskewed)
        if len(regions) <= 1:
            print("Unable to extract!")
            continue
        print(f"identified {len(regions)} regions in {(perf_counter() - tstart):.2f}s")

        tstart = perf_counter()
        content = PDFUtils.extract_text(deskewed, regions)
        print(f"extracted content in {(perf_counter() - tstart):.2f}s")
        formatted = chain.invoke({"content": "\n".join(content)})

        try:
            parsed = json.loads(formatted.text())
            print(json.dumps(parsed, indent=4))
        except json.JSONDecodeError:
            print("Cannot JSON!")

        _ = input("Press any key to continue\n")

    return


if __name__ == "__main__":
    main()
