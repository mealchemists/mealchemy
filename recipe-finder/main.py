import json
import re
import sys
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from website_scrappers.all_recipe import AllRecipeScrapper
from website_scrappers.lookup import lookup_data

def extract_base_domain(url):
    parsed_url = urlparse(url)
    temp = parsed_url.netloc.lstrip('www.')
    return temp.rstrip('.com')
        
if len(sys.argv) == 1:
    print("Supply a URL")
    exit(1)
    
url = sys.argv[1]
location = extract_base_domain(url)


s = AllRecipeScrapper(url, lookup_data[location]["parent-tag"], lookup_data[location]["child-tag"])
s.configure_page()
matches = s.find_tags(regex=None)
s.process_ingredents(matches)

output_file = "output.json"

# Write the list of dictionaries to the file in a pretty format
with open(output_file, "w") as f:
    json.dump(s.ingredents, f, indent=4)  # Use indent for pretty printing
