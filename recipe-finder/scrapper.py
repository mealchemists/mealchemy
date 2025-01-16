from bs4 import BeautifulSoup
import requests
import re
from website_scrappers.all_recipe import AllRecipeScrapper

# url = "https://www.allrecipes.com/recipe/236110/baked-chicken-breasts-and-vegetables/"
url = "https://www.twopeasandtheirpod.com/beef-stir-fry/#wprm-recipe-container-50077"
# url "https://www.simplyrecipes.com/french-onion-pasta-recipe-8620821"
s = AllRecipeScrapper(url, 'li', 'span')
s.configure_page()
h = {"class" : re.compile(r".+recipe-ingredient+")}
matches = s.find_tags(regex=h)
print(s.process_ingredents(matches))




