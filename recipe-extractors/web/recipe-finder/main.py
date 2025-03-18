# import json
# import re
# import sys
# from urllib.parse import urlparse
# import validators 
# import requests
# from bs4 import BeautifulSoup
# from website_scrappers.all_recipe import AllRecipeScrapper
# from website_scrappers.lookup import lookup_data

# def extract_base_domain(url):
#     parsed_url = urlparse(url)
#     temp = parsed_url.netloc.lstrip('www.')
#     print(temp.rstrip('.com'))
#     return temp.replace('.com', "")

# def get_recipe_data(url, consume=True):
#     if validators.url(url):
#         location = extract_base_domain(url)
#         print(location)
#         s = AllRecipeScrapper(url, lookup_data[location]["parent-tag"], lookup_data[location]["child-tag"])
#         s.configure_page()
#         matches = s.find_tags(regex=lookup_data[location]["regex"])

#         # data = json.dumps(s.process_ingredents(matches))
#         if consume:
#             with open('output.json', 'r') as file:
#                 data = json.load(file)
#                 response = requests.post(url=django_url, json=data)
#         else:
#             with open('test.json', 'w') as f:
#                     json.dumps(s.process_ingredents(matches), f)



# url = "https://www.recipetineats.com/my-very-best-vanilla-cake/"

# django_url = "http://localhost:8001/api/save-scraped-data/"

# if len(sys.argv) > 1:
#     url = sys.argv[1]
#     get_recipe_data(url)
    
# location = extract_base_domain(url)



