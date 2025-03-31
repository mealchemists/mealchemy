import os
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)

# WEB_PROMPT = """
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
# Now, based on the provided text, generate the following fields in the JSON:
#
# 1. **Recipe:**
#    - Name
#    - Description (use context from the text)
#    - Main ingredient (if not specified, you will most likely need to infer from the context)
#    - Source URL (if provided)
#    - Cook time (in minutes)
#    - Prep time (in minutes)
#    - Total time (in minutes)
#
# 2. **Ingredients:**
#    - For each ingredient, include:
#      - Name
#         - Extract the ingredient names exactly as they appear.
#             - For example, if the text is "three cloves of garlic", then the ingredient's "name" should be "cloves of garlic", the "quantity" should be 3, and the "unit" should be "null" if no explicit unit is provided.\n'
#             - For example, if the text is "1 cup milk", then the ingredient's "name" should be "milk", the "quantity" should be 1, and the "unit" should be "cup".\n'
#             - For example, if the text is "1 can of olives", then the ingredient's "name" should be "can of olives", the "quantity" should be 1, and the "unit" should be "null".\n'
#      - Quantity (if specified)
#      - Unit (if specified)
#         - **All measurement units must be converted to their most common abbreviated forms:**
#             - tsp (teaspoon)\n"
#             - tbsp (tablespoon)\n"
#             - pt (pint)\n"
#             - qt (quart)\n"
#             - cup (cup)\n"
#             - gal (gallon)\n"
#             - oz (ounce)\n"
#             - fl oz (fluid ounce)\n"
#             - lb (pound)\n"
#             - mL (milliliter)\n"
#             - L (liter)\n"
#             - g (gram)\n"
#             - kg (kilogram)\n"
#             - If the ingredient quantity is based on a count unit (e.g., "1 can of coconut milk"), do not abbreviate.\n'
#
# 3. **Steps:**
#    - A list of steps, each containing:
#      - Step number
#      - Description of the step
#
# Please ensure that the structure strictly follows the example provided, and avoid adding any redundant information. The generated JSON must be valid and properly formatted.
# """

# Nutrition information removed
WEB_PROMPT = """
You are a JSON data generation assistant. Your task is to generate strictly formatted JSON data based on the following requirements. The generated JSON must:

1. Follow proper JSON syntax: All keys and values must be enclosed in double quotes (e.g., "key": "value").
2. Have no trailing commas: Avoid trailing commas at the end of arrays or objects.
3. Ensure correct data types: Use appropriate data types (strings, numbers, arrays, objects, booleans, or null).
4. Maintain proper structure: JSON objects must be enclosed in curly braces \'{{}}\', and arrays in square brackets `[]`.
5. Handle nested structures properly: If nesting objects or arrays, maintain the correct hierarchy.
6. No undefined or null keys: Do not include keys with undefined or null values unless explicitly required.
7. Ensure readability and consistency: Maintain proper indentation (typically 2 or 4 spaces) for nested objects.
8. Ensure unique keys: Each key in an object must be unique and not repeated.

Here is an example of the expected output format:

\'{{
    "recipe": \'{{
        "name": "stirfry",
        "description": "recipe description",
        "main_ingredient": "chicken",
        "source_url": "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485",
        "cook_time": 10,
        "prep_time": 15,
        "total_time": 25
    }}\',
    "ingredients": [
        \'{{"name": "vegetable oil", "quantity": "2", "unit": "tablespoons"}}\',
        \'{{"name": "beef sirloin", "quantity": "1", "unit": "pound"}}\',
        \'{{"name": "broccoli florets", "quantity": "1.5", "unit": "cups"}}\',
        \'{{"name": "red bell pepper", "quantity": "1", "unit": ""}}\',
        \'{{"name": "carrots", "quantity": "2", "unit": ""}}\',
        \'{{"name": "green onion", "quantity": "1"," "unit": ""}}\',
        \'{{"name": "garlic", "quantity": "1", "unit": "teaspoon"}}\',
        \'{{"name": "soy sauce", "quantity": "2", "unit": "tablespoons"}}\',
        \'{{"name": "sesame seeds", "quantity": "2", "unit": "tablespoons"}}\'
    ],
    "steps": [
        \'{{"step": 1, "description": "Beat eggs and sugar in a bowl with an electric mixer on medium speed until well blended. Slowly mix in flour mixture; batter will thicken rather quickly. Slowly blend in milk, then vanilla extract." }}\',
        \'{{"step": 2, "description": "Lightly oil a griddle and heat over medium-high heat. Working in batches as necessary, drop batter by large spoonfuls onto the griddle and cook until bubbles form and the edges are dry, 3 to 4 minutes. Flip and cook until browned on the other side, 2 to 3 minutes." }}\'
    ]
}}\'

Now, based on the provided text, generate the following fields in the JSON:

1. **Recipe:**
   - Name
   - Description (use context from the text)
   - Main ingredient (if not specified, you will most likely need to infer from the context)
   - Source URL (if provided)
   - Cook time (in minutes)
   - Prep time (in minutes)
   - Total time (in minutes)

2. **Ingredients:**
   - For each ingredient, include:
     - Name
        - Extract the ingredient names exactly as they appear.
            - For example, if the text is "three cloves of garlic", then the ingredient's "name" should be "cloves of garlic", the "quantity" should be 3, and the "unit" should be "null" if no explicit unit is provided.\n'
            - For example, if the text is "1 cup milk", then the ingredient's "name" should be "milk", the "quantity" should be 1, and the "unit" should be "cup".\n'
            - For example, if the text is "1 can of olives", then the ingredient's "name" should be "can of olives", the "quantity" should be 1, and the "unit" should be "null".\n'
     - Quantity (if specified)
     - Unit (if specified)
        - **All measurement units must be converted to their most common abbreviated forms:**
            - tsp (teaspoon)\n"
            - tbsp (tablespoon)\n"
            - pt (pint)\n"
            - qt (quart)\n"
            - cup (cup)\n"
            - gal (gallon)\n"
            - oz (ounce)\n"
            - fl oz (fluid ounce)\n"
            - lb (pound)\n"
            - mL (milliliter)\n"
            - L (liter)\n"
            - g (gram)\n"
            - kg (kilogram)\n"
            - If the ingredient quantity is based on a count unit (e.g., "1 can of coconut milk"), do not abbreviate.\n'

3. **Steps:**
   - A list of steps, each containing:
     - Step number
     - Description of the step

Please ensure that the structure strictly follows the example provided, and avoid adding any redundant information. The generated JSON must be valid and properly formatted.
"""
PDF_SYSTEM_PROMPT = (
    "You are a text processing expert. Your task is to take as input a series of strings "
    "that are the results of OCR applied to scanned recipe pages. These strings may contain various sections such as the recipe name, description, source URL, "
    "cook time, prep time, total time, ingredients, and recipe steps. Note that OCR may introduce minor spelling errors; please correct these errors as best as possible without "
    "changing the intended grammatical structure.\n\n"
    "Your output should be a JSON object formatted exactly as follows (with proper indentation, no markdown code block formatting, and no extra text):\n\n"
    "{{\n"
    '  "recipe": {{\n'
    '    "name": "<recipe name>",\n'
    '    "description": "<recipe description>",\n'
    '    "main_ingredient": "<main ingredient of the recipe>",\n'
    '    "source_url": "<source URL or null>",\n'
    '    "cook_time": <cook time as an integer, in minutes>,\n'
    '    "prep_time": <prep time as an integer, in minutes>,\n'
    '    "total_time": <total time as an integer, in minutes>\n'
    "  }},\n"
    '  "ingredients": [\n'
    '    {{"name": "<ingredient name>", "quantity": <quantity as a number>, "unit": "<unit>"}},\n'
    "    ...\n"
    "  ],\n"
    '  "steps": [\n'
    '    {{"step": <step number as integer>, "description": "<step description>"}},\n'
    "    ...\n"
    "  ]\n"
    "}}\n\n"
    "**Important:**\n"
    "- Organize the OCR content into the appropriate fields (recipe metadata, ingredients list, and steps).\n"
    "- Correct any minor spelling errors due to OCR without changing the overall grammatical structure.\n"
    "- If not specified, you will most likely have to infer the main ingredient from the context.\n"
    '- Ensure that numerical values (times, quantities) are represented as numbers. If times or quantities are not explicitly specified, then set them to "null".\n'
    '- For fields that are not available or are extraneous (such as URLs, dates, or links), set them to "null" or exclude them as appropriate.\n'
    "- **For the ingredients list:**\n"
    "  - Extract the ingredient names exactly as they appear.\n"
    "  - If an ingredient description includes a commonly used measurement phrase, parse it as follows:\n"
    '      - For example, if the text is "three cloves of garlic", then the ingredient\'s "name" should be "cloves of garlic", the "quantity" should be 3, and the "unit" should be "null" if no explicit unit is provided.\n'
    '      - For example, if the text is "1 cup milk", then the ingredient\'s "name" should be "milk", the "quantity" should be 1, and the "unit" should be "cup".\n'
    '      - For example, if the text is "1 can of olives", then the ingredient\'s "name" should be "can of olives", the "quantity" should be 1, and the "unit" should be "null".\n'
    "- **All measurement units must be converted to their most common abbreviated forms:**\n"
    "    - tsp (teaspoon)\n"
    "    - tbsp (tablespoon)\n"
    "    - pt (pint)\n"
    "    - qt (quart)\n"
    "    - cup (cup)\n"
    "    - gal (gallon)\n"
    "    - oz (ounce)\n"
    "    - fl oz (fluid ounce)\n"
    "    - lb (pound)\n"
    "    - mL (milliliter)\n"
    "    - L (liter)\n"
    "    - g (gram)\n"
    "    - kg (kilogram)\n"
    '- If the ingredient quantity is based on a count unit (e.g., "1 can of coconut milk"), do not abbreviate.\n'
    "- Output the JSON exactly in the specified format with proper keys and data types.\n"
    "- Your response should consist solely of the structured, prettily printed JSON string without any additional Markdown formatting."
)

# append to either of the prompts to automatically assign the aisle
# TODO: refine
AISLE_PROMPT = (
    "You are also given the following list of aisles. For each ingredient extracted, assign the most likely"
    "aisle that it belongs to in a typical grocery store. If the aisle that you found does not appear on the list",
    "feel free to create one.",
)


def setup_llm_chain(mode=None, api_key=None):
    """
    Sets up LLM postprocessing for URL or PDF recipe extraction. PDF/URL extraction should take
    place after setting up the chain.
    """

    if mode is None:
        raise ValueError("Provide a mode! 'pdf' or 'web'")

    if api_key is None:
        raise KeyError("API key not provided!")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
        max_completion_tokens=3000,
        api_key=api_key,  # type: ignore
    )

    # Chain should be invoked as `chain.invoke({"input": <USER_QUERY>, "aisles": "<AISLES_FROM_SERVER>"})`
    input_message = HumanMessagePromptTemplate.from_template("Input: {input}")
    aisles_message = HumanMessagePromptTemplate.from_template("Aisles: {aisles}")
    system_message = SystemMessagePromptTemplate.from_template(
        PDF_SYSTEM_PROMPT if mode == "pdf" else WEB_PROMPT
    )
    chat_prompt = ChatPromptTemplate.from_messages([system_message, input_message])

    chain = chat_prompt | llm

    return chain
