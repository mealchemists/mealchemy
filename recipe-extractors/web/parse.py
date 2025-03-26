from llm import setup_llm_chain

# from langchain_ollama import OllamaLLM
# from langchain_core.prompts import ChatPromptTemplate
import json
import re

import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

# template = """
# You are a JSON data generation assistant. Your task is to generate strictly formatted JSON data based on the following requirements. The generated JSON must:
#
# 1. Follow proper JSON syntax: All keys and values must be enclosed in double quotes (e.g., "key": "value").
# 2. Have no trailing commas: Avoid trailing commas at the end of arrays or objects.
# 3. Ensure correct data types: Use appropriate data types (strings, numbers, arrays, objects, booleans, or null).
# 4. Maintain proper structure: JSON objects must be enclosed in curly braces \'{{}}\', and arrays in square brackets `[]`.
# 5. Handle nested structures properly: If nesting objects or arrays, maintain the correct hierarchy.
# 6. No undefined or null keys: Do not include keys with undefined or null values unless explicitly required.
# 7. Ensure readability and consistency: Maintain proper indentation (typically 2 or 4 spaces) for nested objects.
# 8. Ensure unique keys: Each key in an object must be unique and not repeated.
#
# Here is an example of the expected output format:
#
# \'{{
#     "recipe": \'{{
#         "name": "stirfry",
#         "description": "recipe description",
#         "main_ingredient": "chicken",
#         "source_url": "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485",
#         "cook_time": 10,
#         "prep_time": 15,
#         "total_time": 25
#     }}\',
#     "nutrition": \'{{
#         "calories": "145",
#         "fat": "6g",
#         "carbs": "6g",
#         "protein": "45g",
#         "sugar": "25g",
#         "fiber": "78g"
#     }}\',
#     "ingredients": [
#         \'{{"name": "vegetable oil", "quantity": "2", "unit": "tablespoons"}}\',
#         \'{{"name": "beef sirloin", "quantity": "1", "unit": "pound"}}\',
#         \'{{"name": "broccoli florets", "quantity": "1.5", "unit": "cups"}}\',
#         \'{{"name": "red bell pepper", "quantity": "1", "unit": ""}}\',
#         \'{{"name": "carrots", "quantity": "2", "unit": ""}}\',
#         \'{{"name": "green onion", "quantity": "1"," "unit": ""}}\',
#         \'{{"name": "garlic", "quantity": "1", "unit": "teaspoon"}}\',
#         \'{{"name": "soy sauce", "quantity": "2", "unit": "tablespoons"}}\',
#         \'{{"name": "sesame seeds", "quantity": "2", "unit": "tablespoons"}}\'
#     ],
#     "steps": [
#         \'{{"step": 1, "description": "Beat eggs and sugar in a bowl with an electric mixer on medium speed until well blended. Slowly mix in flour mixture; batter will thicken rather quickly. Slowly blend in milk, then vanilla extract." }}\',
#         \'{{"step": 2, "description": "Lightly oil a griddle and heat over medium-high heat. Working in batches as necessary, drop batter by large spoonfuls onto the griddle and cook until bubbles form and the edges are dry, 3 to 4 minutes. Flip and cook until browned on the other side, 2 to 3 minutes." }}\'
#     ]
# }}\'
#
# Now, based on the provided text {dom_content}, generate the following fields in the JSON:
#
# 1. **Recipe:**
#    - Name
#    - Description (use context from the text)
#    - Main ingredient (infer from context)
#    - Source URL (if provided)
#    - Cook time (in minutes)
#    - Prep time (in minutes)
#    - Total time (in minutes)
#
# 2. **Ingredients:**
#    - For each ingredient, include:
#      - Name
#      - Quantity (if specified)
#      - Unit (if specified)
#
# 3. **Steps:**
#    - A list of steps, each containing:
#      - Step number
#      - Description of the step
#
# Please ensure that the structure strictly follows the example provided, and avoid adding any redundant information. The generated JSON must be valid and properly formatted.
# """
#
#
# model = OllamaLLM(model="llama3")
#
#
# def parse_with_ollame(dom_chunks):
#     print("\nStarted ollama...\n")
#     prompt = ChatPromptTemplate.from_template(template)
#     chain = prompt | model
#
#     parsed_results = []
#
#     response = chain.invoke({"dom_content": dom_chunks})
#     parsed_results.append(response)
#     data = "\n".join(parsed_results)
#     return clean_answer(data)


def parse_with_openai(dom_chunks):
    chain = setup_llm_chain(mode="web", api_key=os.getenv("OPENAI_ECE493_G06_KEY"))

    parsed_results = []
    response = chain.invoke({"input": dom_chunks})
    parsed_results.append(response)
    data = "\n".join(parsed_results)
    return clean_answer(data)


def clean_answer(raw_data):
    start_idx = raw_data.find("{")
    end_idx = raw_data.rfind("}") + 1

    # Extract the JSON substring
    json_string = raw_data[start_idx:end_idx]
    json_string = json_string.lower()
    print(json_string)
    # Load the JSON data into a Python dictionary
    json_data = json.loads(json_string)
    json_data = transform_dict_keys(json_data)
    json_data = join_steps(json_data)
    print(json_data)
    return json_data


def join_steps(data):
    # Check if 'steps' key exists in the data
    if "steps" in data:
        # Join all the step descriptions into a single string, with a separator (e.g., newline)
        joined_steps = "\n".join(step["description"] for step in data["steps"])
        data["recipe"]["steps"] = (
            joined_steps  # Replace the list of steps with the joined string
        )
        del data["steps"]
    return data


def replace_separators_with_underscore(input_string):
    # Replace spaces, hyphens, commas, and quotes with an underscore
    return re.sub(r'[ ,"-]', "_", input_string)


def transform_dict_keys(data):
    if isinstance(data, dict):  # If the data is a dictionary
        return {
            replace_separators_with_underscore(key): transform_dict_keys(value)
            for key, value in data.items()
        }
    elif isinstance(data, list):  # If the data is a list
        return [transform_dict_keys(item) for item in data]
    else:
        return data
