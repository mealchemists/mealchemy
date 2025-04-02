from llm import setup_llm_chain
from .pdf_utils import PDFUtils
import requests
import os
import shutil
import sys
import json
from pathlib import Path
from time import perf_counter

# allow relative import
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

EXTRACT_URL = "http://localhost:8000/api/save-scraped-data/"


def extract_recipe_data_pdf(temp_path, user, token):
    # load and extract
    pages = PDFUtils.load_pdf_pages_path(temp_path)

    # purge the temporary directory
    if os.path.exists(temp_path):
        shutil.rmtree(os.path.dirname(temp_path))
        print(f"REMOVED TEMP PATH: {temp_path}")

    raw_texts = PDFUtils.extract_raw_text_hardcopy(pages, verbose=True)

    # # TODO: Get aisles using the token and then pass it into the chain.
    # headers = {
    #     "Authorization": f"Bearer {token}",
    # }
    # aisles = requests.get(f"{AISLES_URL}/{user}", headers=headers)
    # print(aisles)

    chain = setup_llm_chain(mode="pdf", api_key=os.getenv("OPENAI_ECE493_G06_KEY"))
    for text in raw_texts:
        concatenated = "\n".join(text)
        recipe_data_str = str(chain.invoke({"input": concatenated}).content)
        result = json.loads(recipe_data_str)

        assert result is not None
        if result["recipe"].get("source_url", None) is None:
            result["recipe"]["source_url"] = ""

        headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.post(url=EXTRACT_URL, json=result, headers=headers)

        # Check if the request was successful
        if response.status_code == 201:
            print("Successfully sent the recipe data.")
        else:
            print(
                f"Failed to send recipe data. Status Code: {response.status_code}, Response: {response.text}"
            )
    return
