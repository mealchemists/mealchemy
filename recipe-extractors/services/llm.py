from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

WEB_PROMPT = """
    You are a JSON data generation assistant. Your task is to generate strictly formatted JSON data based on the provided requirements. The generated JSON must:"

    Follow proper JSON syntax: All keys and values must be enclosed in double quotes (e.g., "key": "value").
    Have no trailing commas: Avoid trailing commas at the end of arrays or objects.
    Ensure correct data types: Use appropriate data types (strings, numbers, arrays, objects, booleans, or null).
    Maintain object and array structure: JSON objects must be enclosed in curly braces \'{{}}\', and arrays in square brackets [].
    Handle nested structures properly: If nesting objects or arrays, maintain the correct hierarchy.
    No undefined or null keys: Do not include keys with undefined or null values unless explicitly required.
    Validate each key-value pair: Ensure that each key is unique within its object and no key is repeated."
    Ensure readability and consistency: Maintain proper indentation (typically 2 or 4 spaces) for nested objects.
    
    Example output:"
    \'{{
        "recipe": \'{{
            "name": "stirfry,"
            "description": "recipe description\","
            "source_url": "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485\","
            "cook_time": 10,
            "prep_time": 15,
            "total_time": 25
        }}\',
        "ingredients": [
            \'{{"name": "vegetable oil", "quantity": 2, "unit": "tablespoons"}}\',
            \'{{"name": "beef sirloin", "quantity": 1, "unit": "pound"}}\',
            \'{{"name": "broccoli florets", "quantity": 1.5, "unit": "cups"}}\',
            \'{{"name": "red bell pepper", "quantity": 1, "unit": ""}}\',
            \'{{"name": "carrots", "quantity": 2, "unit": ""}}\',
            \'{{"name": "green onion", "quantity": 1, "unit": ""}}\',
            \'{{"name": "garlic", "quantity": 1, "unit": "teaspoon"}}\',
            \'{{"name": "soy sauce", "quantity": 2, "unit": "tablespoons"}}\',
            \'{{"name": "sesame seeds", "quantity": 2, "unit": "tablespoons"}}\'
        ],
        "steps": [
            \'{{"step": 1, "descrion":"Beat eggs and sugar in a bowl with an electric mixer on medium speed until well blended. Slowly mix in flour mixture; batter will thicken rather quickly. Slowly blend in milk, then vanilla extract." }}\',
            \'{{"step": 2, "descrion":"Lightly oil a griddle and heat over medium-high heat. Working in batches as necessary, drop batter by large spoonfuls onto the griddle and cook until bubbles form and the edges are dry, 3 to 4 minutes. Flip and cook until browned on the other side, 2 to 3 minutes." }}\',
        ],
    }}\'

    Note that there is extrenous info, the json blob should look exactly like that example with the data below inputted as values, remove any redudndant info
    Please generate a valid JSON structure based on the following requirements:

    Recipe with a valid name, url, cook_time, prep_time, total_time
    List of ingredients
    name quanity and unit

    The text is {dom_content}
"""


model = OllamaLLM(model="llama3")


def ollama_parse_chunks(dom_chunks):
    print("\nStarted ollama...\n")
    prompt = ChatPromptTemplate.from_template(WEB_PROMPT)
    chain = prompt | model

    parsed_results = []

    response = chain.invoke({"dom_content": dom_chunks})
    parsed_results.append(response)

    return "\n".join(parsed_results)


def ollama_parse_pdf(text):
    print("\nStarted ollama...\n")
    prompt = ChatPromptTemplate.from_template(PDF_PROMPT)
    chain = prompt | model

    response = chain.invoke({"text": text})

    return response
