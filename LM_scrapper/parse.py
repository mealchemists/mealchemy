from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

template = (
    "You are an AI model designed to extract recipe information from the this: {dom_content}. Your task is to identify and extract the key details related to the recipe from the HTML structure. The information you should extract includes:"

    "Recipe Title – The name or title of the recipe."
    "Ingredients – A list of ingredients required for the recipe, including their amounts and units."
    "Instructions – Step-by-step cooking or preparation instructions."
    "Cooking Time – Total time required to prepare and cook the dish, including prep and cook times if available."
    "Serving Size – The number of servings the recipe yields."
    "Nutrition Information (if available) – Nutritional details such as calories, fat, protein, carbohydrates, etc."
    "Additional Notes – Any other relevant details such as tips, variations, or dietary information (e.g., vegan, gluten-free)."
    "Instructions:"

    "Ensure the extracted information is organized in a structured format such as JSON or plain text."
    "If an item is not found, leave it blank or indicate it is unavailable."
    "Handle edge cases like missing ingredient amounts, unclear instructions, or missing categories."
)


model = OllamaLLM(model="llama3")

def parse_with_ollame(dom_chunks):
    prompt = ChatPromptTemplate.from_template(template)
    chain = prompt | model
    
    parsed_results = []
    
    for i, chunk in enumerate(dom_chunks, start=1):
        print(chunk)
        response = chain.invoke({"dom_content": chunk})
        print(f"Parsed batch {i} of {len(dom_chunks)}")
        parsed_results.append(response)
        
    return "\n".join(parsed_results)