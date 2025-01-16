from im import Scrapper
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
        for p in matches:
            ingredent = {}
            for child in p.children:
                if child.name != self.child_tag
                for sub_child in child.children:
                if (hasattr(child, "attrs")):
                    if (list(child.attrs.keys())[0] == 'class'):
                        ingredent[child['class'][0]] = child.text
                    else:
                        ingredent[list(child.attrs.keys())[0]] = child.text
            self.ingredents.append(ingredent)
        return self.ingredents