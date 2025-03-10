from scraper import Scraper
from parse import parse_with_ollame
import sys
import json
import requests
import validators

django_url = "http://localhost:8001/api/save-scraped-data/"

def get_recipe_data(url):
    if validators.url(url):
        # scraper = Scraper(url)
        # result = scraper.scrape_website(url)
        # body_content = scraper.extract_body_content(result)
        # cleaned_content = scraper.clean_body_content(body_content)
        # with open("cleanedcontent.txt", "w") as f:
            # f.write(cleaned_content)
        with open("cleanedcontent1.txt", "r") as f:
            cleaned_content = f.read()
        result = parse_with_ollame(cleaned_content)
        start_idx = result.find("{")
        end_idx = result.rfind("}") + 1

        # Extract the JSON substring
        json_data = result[start_idx:end_idx]
        print(json_data)
        # Load the JSON data into a Python dictionary
        data = json.loads(json_data)
        data["recipe"]["source_url"] = url

        # auto categorize ingredients

        # response = requests.post(url=django_url, json=data)
        # print(response)

        with open("output.json", "w") as f:
            json.dump(data, f)


# url = "https://www.allrecipes.com/recipe/228823/quick-beef-stir-fry/"
# url = "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485"
# url = "https://pinchofyum.com/vegan-crunchwrap"
# url = "https://techwithtim.net"
if len(sys.argv) > 1:
    url = sys.argv[1]
    get_recipe_data( url)
