import glob
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from time import perf_counter

import requests
from llm import setup_llm_chain

from .pdf_utils import PDFUtils

# allow relative import
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

import os

load_dotenv()


if os.getenv("DOCKER", "False").lower() == "true":
    EXTRACT_URL = os.getenv("EXTRACT_URL", "http://localhost:8000")
else:
    EXTRACT_URL = "http://localhost:8000"

EXTRACTOR_ENDPOINT = "/api/save-scraped-data/"

URL = EXTRACT_URL + EXTRACTOR_ENDPOINT


def extract_recipe_data_pdf(temp_path, user, token):
    # load and extract
    pages = PDFUtils.load_pdf_pages_path(temp_path)

    # purge all temporary files
    temp_dir = tempfile.gettempdir()
    pattern = os.path.join(temp_dir, "mealchemy_pdf_upload*")

    for item in glob.glob(pattern):
        shutil.rmtree(item)

    print("Purged temporary directory!")

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
        try:
            result = json.loads(recipe_data_str)
        except json.JSONDecodeError:
            print(recipe_data_str)

        result["added_by_extractor"] = True

        headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.post(url=URL, json=result, headers=headers)

        # Check if the request was successful
        if response.status_code == 201:
            print("Successfully sent the recipe data.")
        else:
            print(
                f"Failed to send recipe data. Status Code: {response.status_code}, Response: {response.text}"
            )
    return
