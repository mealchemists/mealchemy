from scraper import Scraper
from parse import parse_with_ollame
import sys
import json
import requests
import validators
import time

django_url = "http://localhost:8001/api/save-scraped-data/"

def get_recipe_data(url):
    if validators.url(url):
        scraper = Scraper(url)
        # result = scraper.scrape_website(url)
        with open("htmlcontent.html", "r") as f:
            result = f.read()
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        with open("cleanedcontent.txt", "w") as f:
            f.write(cleaned_content)
        start_time = time.time()
        result = parse_with_ollame(cleaned_content)
        print("--- %s seconds ---" % (time.time() - start_time))
        start_idx = result.find("{")
        end_idx = result.rfind("}") + 1

        # Extract the JSON substring
        json_data = result[start_idx:end_idx]
        json_data = json_data.lower()
        # Ensure all data is lowercased
        # json_data = {k.lower(): v for k, v in json_data.items()}
        # parse = json_data["ingredients"]
        # new_ingredients = []
        # for ingredient in parse:
        #     for k,v in ingredient.items():
        #         if k == "quantity" and v is not None:
        #             ingredient[k] = str(v)
        #             new_ingredients.append(ingredient)
        
        # json_data['ingredients'] = new_ingredients
                
        print(json_data)
        # Load the JSON data into a Python dictionary
        data = json.loads(json_data)
        data["recipe"]["source_url"] = url

        with open("output.json", "w") as f:
            json.dump(data, f)



base_url = "https://www.allrecipes.com/recipe/228823/quick-beef-stir-fry/"
# url = "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485"
# url = "https://pinchofyum.com/vegan-crunchwrap"
# url = "https://techwithtim.net"
if len(sys.argv) > 1:
    url = sys.argv[1]
    get_recipe_data( url)
else:
    get_recipe_data(base_url)
