import json
import os
import sys
from time import perf_counter, time

import requests
import validators
from dotenv import load_dotenv

from .parse import parse_with_openai
from .scraper import Scraper

load_dotenv()

EXTRACT_URL = os.environ.get(
    "EXTRACT_URL", "http://localhost:8000/api/save-scraped-data/"
)


# TODO: Error handling
def extract_recipe_data_url(url, user, token):
    if validators.url(url):
        scraper = Scraper(url)
        result = scraper.scrape_website(url)
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        start_time = perf_counter()
        result = parse_with_openai(cleaned_content)

        assert result is not None
        if result["recipe"].get("source_url", None) is None:
            result["recipe"]["source_url"] = url

        result["added_by_extractor"] = True

        print(f"Extracted text in {perf_counter() - start_time:.2f}s")

        headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.post(url=EXTRACT_URL, json=result, headers=headers)

        # Check if the request was successful
        if response.status_code == 201:
            print("Successfully sent the recipe data.")
        else:
            print(f"Failed to send recipe data. Status Code: {response.status_code}")
