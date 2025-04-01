from .scraper import Scraper
from .parse import parse_with_openai
import sys
import json
import requests
import validators
from time import perf_counter

EXTRACT_URL = "http://localhost:8000/api/save-scraped-data/"


result = {
    "recipe": {
        "name": "Roasted New Red Potatoes",
        "description": "Roasted red potatoes at their best \u2014 plain and simple. Red potatoes are tossed with olive oil, salt, and pepper, then roasted to perfection.",
        "main_ingredient": "red potatoes",
        "source_url": "",
        "cook_time": 20,
        "prep_time": 5,
        "total_time": 25,
    },
    "ingredients": [
        {"name": "small red new potatoes", "quantity": 3, "unit": "pounds"},
        {"name": "olive oil", "quantity": 0.25, "unit": "cup"},
        {"name": "salt", "quantity": 1, "unit": "teaspoon"},
        {"name": "freshly ground black pepper", "quantity": 1, "unit": "teaspoon"},
    ],
    "steps": [
        {
            "step": 1,
            "description": "Gather all ingredients. Preheat the oven to 400 degrees F (200 degrees C) and adjust the oven rack to the lowest position.",
        },
        {
            "step": 2,
            "description": "Toss potatoes with oil, salt, and pepper in a bowl. Arrange, cut-side down, on a rimmed cookie sheet or jellyroll pan.",
        },
        {
            "step": 3,
            "description": "Roast potatoes in the preheated oven until tender and golden brown, 20 to 30 minutes. Transfer to a serving dish.",
        },
        {"step": 4, "description": "Serve and enjoy!"},
    ],
}


# TODO: Error handling
def extract_recipe_data_url(url, user, token):
    if validators.url(url):
        scraper = Scraper(url)
        result = scraper.scrape_website(url)
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        start_time = perf_counter()
        result = parse_with_openai(cleaned_content)

        if result["recipe"].get("source_url", None) is None:
            result["recipe"]["source_url"] = url

        print(json.dumps(result, indent=4))

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
