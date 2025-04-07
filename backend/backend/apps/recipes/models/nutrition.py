import os
import re
from pathlib import Path

import requests
from dotenv import load_dotenv
from units import Unit, Quantity

# load API key
load_dotenv()
API_KEY_USDA = os.getenv("USDA_FDC_API_KEY")

BASE_URL = "https://api.nal.usda.gov/fdc/v1"

# USDA FoodData Central (FDC) nutrient IDs
# https://www.ars.usda.gov/ARSUserFiles/80400530/pdf/fndds/2021_2023_FNDDS_Doc.pdf
FDC_NUTRITION_IDS = {
    "CALORIES_ID_ATWATER": 2047,  # Atwater general factors
    "CALORIES_ID_ENERGY": 1008,  # figure out
    "PROTEIN_ID": 1003,
    "CARBOHYDRATE_ID": 1005,
    "SUGAR_ID_2": 2000,  # figure out
    "SUGAR_ID": 1063,  # Total sugars
    "FAT_ID": 1004,
    "FIBER_ID": 1079,  # Total dietary - not used in calculation
    "SODIUM_ID": 1093,
}

# Remove all physical recipe preparation descriptors - as they don't
# affect nutrition information very much and it will make things easier to
# search up.
PHYSICAL_DESCRIPTOR_PATTERN = (
    r"\b("
    r"chopped|sliced|diced|shredded|grated|minced|crushed|mashed|"
    r"julienned|cubed|quartered|halved|peeled|cored|pitted|trimmed|"
    r"stemmed|deveined|zested|rinsed|washed|pre-washed|unpeeled|"
    r"untrimmed|destemmed|skinned|cut|smashed|torn|broken|separated|"
    r"cracked|split|scraped|shelled|snapped|chipped|ground|slivered|"
    r"spiralized"
    r")\b"
)


def preprocess_food_name(ingredient_name):
    # TODO: use named entity recognition to extract food names, and use FDC's search operators...
    ingredient_name = ingredient_name.lower()
    ingredient_name = re.sub(
        PHYSICAL_DESCRIPTOR_PATTERN,
        "",
        ingredient_name,
    )


def search_fdc(query):
    # USDA FDC's API does not support sorting by multiple fields, so we will
    # perform an API call on the 'Foundation' dataset first, and then 'Branded'
    # if not available, to try and save some performance.
    #  - We will not use the 'SR Legacy' dataset as we want more recent results.

    # TODO: make use of the search operators.
    # NOTE: `query` can also be provided a FDC ID.

    params = {
        "api_key": API_KEY_USDA,  # USDA FDC API does not support passing API keys via headers.
        "query": query,
        # "sortBy": "publishedDate",
        # "sortOrder": "desc",
        # Survey (FNDDS) is the only dataset where I can retrieve portion information.
        "dataType": ["Survey (FNDDS)"],
        "pageSize": 10,
    }

    # Search FDC under the 'Foundation' database first. If we are unable to find a result,
    # then it is most likely under a brand.
    results = query_fdc_api(params)

    if len(results) == 0:
        print("Retry with branded!")
        params["dataType"] = ["Branded"]
        results.append(query_fdc_api(params))

    return


def query_fdc_api(params):
    # probably better to use a try catch block on when this function is called
    request = requests.get(url=f"{BASE_URL}/foods/search", params=params, timeout=5)
    data = request.json()

    results = []

    for i, food in enumerate(data.get("foods")):
        # TODO: Better error handling....
        food_name = food.get("description", ValueError("Food has no name!"))
        food_fdc_id = food.get("fdcId", ValueError("Food does has no FDC ID!"))
        food_dtype = food.get("dataType", ValueError("Food does not have a data type!"))

        print(
            f"({i + 1}/{len(data.get('foods'))}): {food_name} ({food_fdc_id}, {food_dtype})"
        )
        print("\t--Nutrients per 100g--")

        food_nutrients = food.get("foodNutrients", None)
        if food_nutrients is not None:
            for internal_name, nutrient_id in FDC_NUTRITION_IDS.items():
                # Print only the nutritions specified in FDC_NUTRITION_IDS as
                # we are not interested in all of them.
                nutrient = next(
                    (
                        nutrient
                        for nutrient in food_nutrients
                        if nutrient["nutrientId"] == nutrient_id
                    ),
                    None,
                )

                if nutrient is not None:
                    nutrient_name = nutrient.get("nutrientName", None)
                    nutrient_value = nutrient.get("value", None)
                    nutrient_unit = nutrient.get("unitName", None)

                    print(f"\t{nutrient_name}: {nutrient_value} {nutrient_unit}")
                else:
                    print(f"\t[{internal_name} N/A]")

        else:
            raise ValueError("No nutrients found!")

        print()
        results.append(food)

    return results


if __name__ == "__main__":
    while True:
        search_term = input("Search up something: ")
        preprocess_food_name(search_term)

        try:
            search_fdc(search_term)
        except Exception as e:
            print(e)
