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
    print("RAW PARSED RESULTS")
    print(parsed_results[0])
    data = "\n".join(parsed_results)
    return clean_answer(data)


def clean_answer(raw_data):
    start_idx = raw_data.find("{")
    end_idx = raw_data.rfind("}") + 1

    # Extract the JSON substring
    json_string = raw_data[start_idx:end_idx]
    json_string = json_string.lower()
    return json_string

    # # Load the JSON data into a Python dictionary
    # json_data = json.loads(json_string)
    # json_data = transform_dict_keys(json_data)
    # json_data = join_steps(json_data)
    # print("parse 2:")
    # print(json_data)
    # return json_data


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
