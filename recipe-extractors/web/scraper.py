from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from .lookup import lookup_data
from .util import extract_base_domain
import tempfile
import shutil


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
        user_data_dir = tempfile.mkdtemp()
        # Set up Chrome options if needed
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")  # Run in headless mode (no GUI)
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(f"--user-data-dir={user_data_dir}") 

        # Launch the Chrome browser with the automatically downloaded ChromeDriver
        driver = webdriver.Chrome(service=Service(chrome_driver_path), options=options)

        try:
            driver.get(website)
            print("Page loaded")
            html = driver.page_source
            return html
        finally:
            driver.quit()
             # Clean up the temp user data dir
            shutil.rmtree(user_data_dir, ignore_errors=True)

    def extract_body_content(self, html_content):
        return self.preprocess(html_content)

        # website_lookup = lookup_data[self.base_domain]

        # ingredient = website_lookup['ingredient']
        # recipe_step = website_lookup['recipe_step']
        # recipe_detail = website_lookup['recipe_details']
        # nutrition_detail = website_lookup['nutrition_details']

        # ingredient_tags = soup.find(ingredient['tag'], attrs=ingredient['attrs'])
        # recipe_step_tags = soup.find(recipe_step['tag'], attrs=recipe_step['attrs'])
        # recipe_detail_tags = soup.find(recipe_detail['tag'], attrs=recipe_detail['attrs'])
        # nutrition_detail_tags = soup.find(nutrition_detail['tag'], attrs=nutrition_detail['attrs'])

        # if ingredient_tags:
        #     return str("\n\ningredients\n" + ingredient_tags.text + "\n\nsteps\n" + recipe_step_tags.text + "\n\nrecipe_details\n" + recipe_detail_tags.text + "\n\nnutrition\n" + nutrition_detail_tags.text)
        # return ""

    def clean_body_content(self, body_content):
        soup = BeautifulSoup(body_content, "html.parser")

        for script_or_style in soup(["script", "style"]):
            script_or_style.extract()

        cleaned_content = soup.get_text(separator="\n")
        cleaned_content = "\n".join(
            line.strip() for line in cleaned_content.splitlines() if line.strip()
        )

        return cleaned_content

    def split_dom_content(self, dom_content, max_length=6000):
        return [
            dom_content[i : 1 + max_length]
            for i in range(0, len(dom_content), max_length)
        ]

    def preprocess(self, html_content):
        soup = BeautifulSoup(html_content, "html.parser")

        for script_or_style in soup(
            [
                "script",
                "style",
                "noscript",
                "header",
                "footer",
                "aside",
                "nav",
                "img",
                "button",
                "input",
                "figcaption",
                "use",
                "meta",
            ]
        ):
            script_or_style.decompose()  # Remove them from the tree

        # Extract body content
        body_content = soup.find("body")
        if body_content:
            # Extract the text and use separator='\n' to get line breaks where appropriate
            text = body_content.get_text(separator="\n").strip()

            # Remove extra newlines (multiple newlines are replaced with a single space)
            clean_text = "\n".join(
                [line.strip() for line in text.splitlines() if line.strip()]
            )

            # Optionally, you can save it to a file
            with open("detail.html", "w") as f:
                f.write(clean_text)

            return clean_text

        return ""
