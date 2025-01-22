from scrapper import Scraper
# from parse import parse_with_ollame
import sys

url = "https://www.allrecipes.com/recipe/228823/quick-beef-stir-fry/"
url = "https://www.simplyrecipes.com/million-dollar-ravioli-casserole-recipe-8774485"
# url = "https://pinchofyum.com/vegan-crunchwrap"
# url = "https://techwithtim.net"
if len(sys.argv) > 1:
    url = sys.argv[1]
    
scraper = Scraper(url)
result = scraper.scrape_website(url)
body_content = scraper.extract_body_content(result)
cleaned_content = scraper.clean_body_content(body_content)
print(cleaned_content)

# dom_chunks = split_dom_content(cleaned_content)
# result = parse_with_ollame(dom_chunks)

# print(result)

