from scrapper import Scraper
from parse import parse_with_ollame
import sys
import json
import requests
import validators 

django_url = "http://localhost:8001/api/save-scraped-data/"

def get_recipe_data(url):
    if validators.url(url):
        scraper = Scraper(url) 
        result = scraper.scrape_website(url)
        body_content = scraper.extract_body_content(result)
        cleaned_content = scraper.clean_body_content(body_content)
        result = parse_with_ollame(cleaned_content)
        start = "```"
        print(f"{result}\n\n\n")
        
        start_idx = result.find("{")
        end_idx = result.rfind("}") + 1

        # Extract the JSON substring
        json_data = result[start_idx:end_idx]

        # Load the JSON data into a Python dictionary
        data = json.loads(json_data)
        response = requests.post(url=django_url, json=data)

        print(data)

# url = "https://www.allrecipes.com/recipe/228823/quick-beef-stir-fry/"
# url = "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485"
# url = "https://pinchofyum.com/vegan-crunchwrap"
# url = "https://techwithtim.net"
if len(sys.argv) > 1:
    url = sys.argv[1]
    get_recipe_data(url)
    
json_string = """
{
    "recipe": {
        "name": "",
        "description": "",
        "source_url": "",
        "cook_time": 10,
        "prep_time": 15,
        "total_time": 25
    },
    "ingredients": [
        {"name": "vegetable oil", "quantity": 2, "unit": "tablespoons"},
        {"name": "beef sirloin", "quantity": 1, "unit": "pound"},
        {"name": "broccoli florets", "quantity": 1.5, "unit": "cups"},
        {"name": "red bell pepper", "quantity": 1, "unit": ""},
        {"name": "carrots", "quantity": 2, "unit": ""},
        {"name": "green onion", "quantity": 1, "unit": ""},
        {"name": "garlic", "quantity": 1, "unit": "teaspoon"},
        {"name": "soy sauce", "quantity": 2, "unit": "tablespoons"},
        {"name": "sesame seeds", "quantity": 2, "unit": "tablespoons"}
    ]
}
"""

data = json.loads(json_string)
print(data)
    
