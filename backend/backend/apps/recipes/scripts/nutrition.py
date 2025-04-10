import os
import re
import sys
import django
from pathlib import Path

import requests
import importlib
import subprocess
from dotenv import load_dotenv

import spacy


def load_spacy_model(model_name="en_core_web_sm"):
    if importlib.util.find_spec(model_name) is None:
        print(f"Downloading missing spaCy model '{model_name}'...")
        subprocess.run(
            [sys.executable, "-m", "spacy", "download", model_name], check=True
        )
    return spacy.load(model_name)


nlp = load_spacy_model()

# load API key
load_dotenv()

API_KEY_USDA = os.getenv("USDA_FDC_API_KEY")
BASE_URL = "https://api.nal.usda.gov/fdc/v1"


# USDA FoodData Central (FDC) nutrient IDs as defined by Appendix K.
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
    "CHOLESTROL_ID": 1253,
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

# names = [i.name for i in Ingredient.objects.all()]


# def preprocess_food_name(ingredient_name):
#     # TODO: use named entity recognition to extract food names, and use FDC's search operators...
#     ingredient_name = ingredient_name.lower()
#     ingredient_name = re.sub(
#         PHYSICAL_DESCRIPTOR_PATTERN,
#         "",
#         ingredient_name,
#     )


def search_fdc(query):
    # USDA FDC's API does not support sorting by multiple fields, so we will
    # perform an API call on the 'Foundation' dataset first, and then 'Branded'
    # if not available, to try and save some performance.
    #  - We will not use the 'SR Legacy' dataset as we want more recent results.

    # NOTE: `query` can also be provided a FDC ID.

    query = query.lower()

    params = {
        "api_key": API_KEY_USDA,  # USDA FDC API does not support passing API keys via headers.
        "query": query,
        # "sortBy": "publishedDate",
        # "sortOrder": "desc",
        # Survey (FNDDS) is the only dataset where I can retrieve portion information.
        "dataType": ["Foundation", "Survey (FNDDS)"],
        "pageSize": 10,
    }

    # Search FDC under the 'Foundation' database first. If we are unable to find a result,
    # then it is most likely under a brand.
    # results = query_fdc_api(params)
    results = cosine_similarity_search(query, params)

    # if len(results) == 0:
    #     print("Retry with branded!")
    #     params["dataType"] = ["Branded"]
    #     results.append(query_fdc_api(params))

    return results


def extract_core_ingredient(text):
    # extract core ingredient using spaCy noun chunk extraction
    doc = nlp(text)
    noun_chunks = list(doc.noun_chunks)
    if noun_chunks:
        # return the first noun chunk's text in lowercase
        return noun_chunks[0].text.lower().strip()
    else:
        return text.lower().strip()


def cosine_similarity_search(raw_query, params):
    response = requests.get(url=f"{BASE_URL}/foods/search", params=params, timeout=5)
    data = response.json()

    candidates = data.get("foods", [])
    if not candidates:
        return None

    query_doc = nlp(raw_query)
    best_candidate = None
    best_score = -1.0

    # get the closest match
    for candidate in candidates:
        description = candidate.get("description", "").lower().strip()
        candidate_doc = nlp(description)
        semantic_score = query_doc.similarity(candidate_doc)

        # if the raw query is in the description or if any token lemma equals the raw query, then
        # give a boost to its similarity score
        contains_query = raw_query in description

        query_in_candidate = any(raw_query == token.lemma_ for token in candidate_doc)

        keyword_boost = 0.3 if contains_query or query_in_candidate else 0.0

        # if we have a partial match, we increase the score
        extracted_core = extract_core_ingredient(description)
        # if the query is a substring of the core or vice versa, also boost
        core_boost = (
            0.4 if raw_query in extracted_core or extracted_core in raw_query else 0.0
        )

        total_score = semantic_score + keyword_boost + core_boost

        if total_score > best_score:
            best_score = total_score
            best_candidate = candidate

    closest_match = best_candidate.get("description")
    food = next(x for x in data["foods"] if x["description"] == closest_match)

    # get the nutrients
    food_name = food.get("description", "Unknown food name")
    food_fdc_id = food.get("fdcId", "Unknown FDC ID")
    food_dtype = food.get("dataType", "Unknown data type")
    food_nutrients = food.get("foodNutrients")
    food_nutrient_data = {}
    results = []

    if food_nutrients is not None:
        for internal_name, nutrient_id in FDC_NUTRITION_IDS.items():
            # Look for the specified nutrients in food_nutrients
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

                # Store the nutrient info in the dictionary
                food_nutrient_data[nutrient_id] = {
                    "nutrient_id": nutrient_id,
                    "nutrient_name": nutrient_name,
                    "value": nutrient_value,
                    "unit": nutrient_unit,
                }
            else:
                # If nutrient is missing, store a 'Not Available' entry
                food_nutrient_data[nutrient_id] = {
                    "nutrient_id": nutrient_id,
                    "nutrient_name": internal_name,
                    "value": "N/A",
                    "unit": "N/A",
                }

        # Add the nutrient data to the results list
        results.append(
            {
                "food_name": food_name,
                "fdc_id": food_fdc_id,
                "data_type": food_dtype,
                "nutrients": food_nutrient_data,
            }
        )
    else:
        print(f"Warning: No nutrients found for {food_name} (FDC ID: {food_fdc_id})")

    return results


def query_fdc_api(params):
    # probably better to use a try catch block on when this function is called
    request = requests.get(url=f"{BASE_URL}/foods/search", params=params, timeout=5)
    data = request.json()

    results = []

    for i, food in enumerate(data.get("foods")):
        # Better error handling to ensure data is present.
        food_name = food.get("description", "Unknown food name")
        food_fdc_id = food.get("fdcId", "Unknown FDC ID")
        food_dtype = food.get("dataType", "Unknown data type")

        print(
            f"({i + 1}/{len(data.get('foods'))}): {food_name} ({food_fdc_id}, {food_dtype})"
        )
        print("\t--Nutrients per 100g--")

        food_nutrients = food.get("foodNutrients", None)
        food_nutrient_data = {}

        if food_nutrients is not None:
            for internal_name, nutrient_id in FDC_NUTRITION_IDS.items():
                # Look for the specified nutrients in food_nutrients
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

                    # Store the nutrient info in the dictionary
                    food_nutrient_data[nutrient_id] = {
                        "nutrient_id": nutrient_id,
                        "nutrient_name": nutrient_name,
                        "value": nutrient_value,
                        "unit": nutrient_unit,
                    }
                else:
                    # If nutrient is missing, store a 'Not Available' entry
                    food_nutrient_data[nutrient_id] = {
                        "nutrient_id": nutrient_id,
                        "nutrient_name": internal_name,
                        "value": "N/A",
                        "unit": "N/A",
                    }

            # Add the nutrient data to the results list
            results.append(
                {
                    "food_name": food_name,
                    "fdc_id": food_fdc_id,
                    "data_type": food_dtype,
                    "nutrients": food_nutrient_data,
                }
            )
        else:
            print(
                f"Warning: No nutrients found for {food_name} (FDC ID: {food_fdc_id})"
            )
        print(results)
        print()  # for better readability
    return results


if __name__ == "__main__":
    while True:
        search_term = input("Search up something: ")
        # preprocess_food_name(search_term)

        try:
            search_fdc(search_term)
        except Exception as e:
            print(e)
