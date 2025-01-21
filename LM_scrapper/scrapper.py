from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def scrape_website(website):
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
        
def extract_body_content(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    body_content = soup.find("ul", attrs={"class": "mm-recipes-structured-ingredients__list"})
    step_content = soup.find("div", attrs={"id": "mm-recipes-steps_1-0"})
    recipe_details = soup.find("div", attrs={"id": "mm-recipes-details_1-0"})
    nutrition_details = soup.find("div", attrs={"id": "mm-recipes-nutrition-facts-summary_1-0"})
    if body_content:
        return str("ingredients\n" + body_content.text + "steps\n" + step_content.text + "recipe_details" + recipe_details + "nutrition" +nutrition_details)
    return ""

def clean_body_content(body_content):
    soup = BeautifulSoup(body_content, "html.parser")
    
    for script_or_style in soup(['script','style']):
        script_or_style.extract()
        
    cleaned_content = soup.get_text(separator="\n")
    cleaned_content = "\n".join(
        line.strip() for line in cleaned_content.splitlines() if line.strip()
    )
    
    return cleaned_content

def split_dom_content(dom_content, max_length=6000):
    return[
        dom_content[i: 1+max_length] for i in range(0, len(dom_content), max_length)
    ]
    
