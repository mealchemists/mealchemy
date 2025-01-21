from scrapper import scrape_website, split_dom_content, clean_body_content, extract_body_content
# from parse import parse_with_ollame
import sys

url = "https://www.allrecipes.com/recipe/228823/quick-beef-stir-fry/"
# url = "https://pinchofyum.com/vegan-crunchwrap"
# url = "https://techwithtim.net"
if len(sys.argv) > 1:
    url = sys.argv[1]
    
result = scrape_website(url)
# print(result)
body_content = extract_body_content(result)
# print(body_content)
cleaned_content = clean_body_content(body_content)
print(cleaned_content)

# dom_chunks = split_dom_content(cleaned_content)
# result = parse_with_ollame(dom_chunks)

# print(result)

