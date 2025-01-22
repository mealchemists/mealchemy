from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from lookup import lookup_data
from util import extract_base_domain
class Scraper:
    def __init__(self, url):
        self.url = url
        self.lookupdata = lookup_data

        if url:
            self.base_domain = extract_base_domain(url)

    
    def scrape_website(self, website):
        print("Launching Chrome...")
        
        # Automatically download and install the correct ChromeDriver
        chrome_driver_path = ChromeDriverManager().install()
        
        # Set up Chrome options if needed
        options = webdriver.ChromeOptions()
        
        # Launch the Chrome browser with the automatically downloaded ChromeDriver
        driver = webdriver.Chrome(service=Service(chrome_driver_path), options=options)
        
        try:
            driver.get(website)
            print("Page loaded")
            html = driver.page_source
            return html
        finally:
            driver.quit()
            
    def extract_body_content(self, html_content):
        soup = BeautifulSoup(html_content, "html.parser")

        website_lookup = lookup_data[self.base_domain]

        ingredient = website_lookup['ingredient']  
        recipe_step = website_lookup['recipe_step']  
        recipe_detail = website_lookup['recipe_details']  
        nutrition_detail = website_lookup['nutrition_details'] 

        ingredient_tags = soup.find(ingredient['tag'], attrs=ingredient['attrs'])
        recipe_step_tags = soup.find(recipe_step['tag'], attrs=recipe_step['attrs'])
        recipe_detail_tags = soup.find(recipe_detail['tag'], attrs=recipe_detail['attrs'])
        nutrition_detail_tags = soup.find(nutrition_detail['tag'], attrs=nutrition_detail['attrs'])

        # body_content = soup.find("ul", attrs={"class": "mm-recipes-structured-ingredients__list"})
        # step_content = soup.find("div", attrs={"id": "mm-recipes-steps_1-0"})
        # recipe_details = soup.find("div", attrs={"id": "mm-recipes-details_1-0"})
        # nutrition_details = soup.find("div", attrs={"id": "mm-recipes-nutrition-facts-summary_1-0"})
        if ingredient_tags:
            return str("\n\ningredients\n" + ingredient_tags.text + "\n\nsteps\n" + recipe_step_tags.text + "\n\nrecipe_details\n" + recipe_detail_tags.text + "\n\nnutrition\n" + nutrition_detail_tags.text)
        return ""

    def clean_body_content(self, body_content):
        soup = BeautifulSoup(body_content, "html.parser")
        
        for script_or_style in soup(['script','style']):
            script_or_style.extract()
            
        cleaned_content = soup.get_text(separator="\n")
        cleaned_content = "\n".join(
            line.strip() for line in cleaned_content.splitlines() if line.strip()
        )
        
        return cleaned_content

    def split_dom_content(self, dom_content, max_length=6000):
        return[
            dom_content[i: 1+max_length] for i in range(0, len(dom_content), max_length)
        ]
        
