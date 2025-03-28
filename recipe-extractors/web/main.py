from .scraper import Scraper
from .parse import parse_with_openai
import sys
import json
import requests
import validators
import time

django_url = "http://localhost:8000/api/recipe-ingredients"


def extract_recipe_data_url(url, user, token):
    #
    if validators.url(url):
        scraper = Scraper(url)
        result = scraper.scrape_website(url)
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        with open("cleanedcontent.txt", "w") as f:
            f.write(cleaned_content)
        start_time = time.time()
        result = parse_with_openai(cleaned_content)
        print("--- %s seconds ---" % (time.time() - start_time))

        # NOTE: temporary; print the aisles found.
        AISLES_URL = "http://localhost:8000/api/aisles"
        temp_headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.get(url=f"{AISLES_URL}/{user}", headers=temp_headers)

        with open("output.json", "w") as f:
            response_json = json.loads(response.json())
            json.dump(response_json, f, indent=4)

            # result = dict()
            #
            # result["recipe"]["source_url"] = url
            # result["recipe"]["user"] = user

        headers = {
            "Authorization": f"Bearer {token}",  # Add the token in Authorization header
        }
        response = requests.post(url=django_url, json=result, headers=headers)

        # Check if the request was successful
        if response.status_code == 201:
            print("Successfully sent the recipe data.")
        else:
            print(
                f"Failed to send recipe data. Status Code: {response.status_code}, Response: {response.text}"
            )
