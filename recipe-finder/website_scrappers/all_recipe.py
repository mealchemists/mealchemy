from scrapper import Scrapper
from bs4 import BeautifulSoup
import requests

class AllRecipeScrapper(Scrapper):
    def __init__(self, url, parent_tag, child_tag):
        self.ingredents = []
        self.soup = None
        super().__init__(url, parent_tag, child_tag)
    
    def configure_page(self):
        response = requests.get(self.url, headers=self.header)
        self.soup = BeautifulSoup(response.content, "html.parser")


    def find_tags(self, regex=None):
        if regex:
            return self.soup.find_all(self.has_child_tag, regex)
        return self.soup.find_all(self.has_child_tag)

    def process_ingredents(self, matches):
        
        for child in matches:
            ingredent = {}
            ingredent_tags = child.findChildren("span")
            for tag in ingredent_tags:
                
                if (list(tag.attrs.keys())[0] == 'class'):
                    ingredent[tag['class'][0]] = tag.text
                else:
                    ingredent[list(tag.attrs.keys())[0]] = tag.text
            self.ingredents.append(ingredent)
        return self.ingredents