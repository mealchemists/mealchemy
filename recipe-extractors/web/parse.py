from llm import setup_llm_chain
import json
import re

import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()


def parse_with_openai(dom_chunks):
    chain = setup_llm_chain(mode="web", api_key=os.getenv("OPENAI_ECE493_G06_KEY"))

    parsed_results = []
    response = chain.invoke({"input": dom_chunks})
    parsed_results.append(response.content)
    data = "\n".join(parsed_results)
    return clean_answer(data)


def clean_answer(raw_data):
    start_idx = raw_data.find("{")
    end_idx = raw_data.rfind("}") + 1

    # Extract the JSON substring
    json_string = raw_data[start_idx:end_idx]
    # json_string = json_string.lower()

    return json.loads(json_string)

def replace_separators_with_underscore(input_string):
    # Replace spaces, hyphens, commas, and quotes with an underscore
    return re.sub(r'[ ,"-]', "_", input_string)

def ensure_keys(data, schema):
    if isinstance(schema, dict):
        if not isinstance(data, dict):
            data = {}
        for key, default in schema.items():
            if key not in data:
                data[key] = default
            else:
                data[key] = ensure_keys(data[key], default)
    elif isinstance(schema, list):
        if not isinstance(data, list):
            data = schema
        elif len(schema) > 0:
            # Assume all list items follow the schema of the first item
            data = [ensure_keys(item, schema[0]) for item in data]
    return data

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
    
def process_data(dom_chunks, schema):
    # Step 1: Parse the DOM chunks with OpenAI
    parsed_data = parse_with_openai(dom_chunks)
    
    # Step 3: Ensure required keys based on the provided schema
    ensured_data = ensure_keys(parsed_data, schema)
    
    # Step 4: Transform the dictionary keys (e.g., replace separators with underscores)
    transformed_data = transform_dict_keys(ensured_data)
    
    return transformed_data
