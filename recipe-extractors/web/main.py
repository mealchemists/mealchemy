from .scraper import Scraper
from .parse import parse_with_openai
import sys
import json
import requests
import validators
from time import perf_counter

DJANGO_URL = "http://localhost:8000/api/recipe-ingredients/"


def extract_recipe_data_url(url, user, token):
    if validators.url(url):
        scraper = Scraper(url)
        result = scraper.scrape_website(url)
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        start_time = perf_counter()
        result = parse_with_openai(cleaned_content)

        result_json = json.loads(result)

        print(f"Extracted text in {perf_counter() - start_time:.2f}s")

        headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.post(url=DJANGO_URL, json=result_json, headers=headers)

        # Check if the request was successful
        if response.status_code == 201:
            print("Successfully sent the recipe data.")
        else:
            print(f"Failed to send recipe data. Status Code: {response.status_code}")
