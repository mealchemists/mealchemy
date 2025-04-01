from llm import setup_llm_chain
from .pdf_utils import PDFUtils
import requests
import os
import sys
import json
from pathlib import Path

# allow relative import
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()


RECIPE_INGREDIENTS_URL = "http://localhost:8000/api/recipe-ingredients"
AISLES_URL = "http://localhost:8000/api/aisles"


def extract_recipe_data_pdf(pdf_api_url, user, token):
    # TODO: get PDF data from server (or via messages)
    # NOTE: for testing, use a temporary hardcoded path...

    # TEMP_PATH = "./pdf/source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"
    TEMP_PATH = "./pdf/source_material/hardcopy_scans/single/Crunchy Orange Chicken.pdf"

    # load and extract
    pages = PDFUtils.load_pdf_pages_path(TEMP_PATH)
    raw_texts = PDFUtils.extract_raw_text_hardcopy(pages, verbose=True)

    # TODO: Get aisles using the token and then pass it into the chain.
    headers = {
        "Authorization": f"Bearer {token}",
    }
    aisles = requests.get(f"{AISLES_URL}/{user}", headers=headers)
    print(aisles)

    # LLM?
    chain = setup_llm_chain(mode="pdf", api_key=os.getenv("OPENAI_ECE493_G06_KEY"))
    for text in raw_texts:
        concatenated = "\n".join(text)
        recipe_data_str = str(chain.invoke({"input": concatenated}).content)
        recipe_data = json.loads(recipe_data_str)

        print(recipe_data)

        # post to server
        # it might be a good idea a post multiple endpoint
        # result["recipe"]["source_url"] = url
        # result["recipe"]["user"] = user
        #
        # headers = {
        #     "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        # }
        # response = requests.post(url=django_url, json=result, headers=headers)
        #
        # # Check if the request was successful
        # if response.status_code == 201:
        #     print("Successfully sent the recipe data.")
        # else:
        #     print(
        #         f"Failed to send recipe data. Status Code: {response.status_code}, Response: {response.text}"
        #     )
    return

