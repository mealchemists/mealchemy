from pdf_utils import PDFUtils
import requests

django_url = "http://localhost:8000/api/recipe-ingredients"


def extract_recipe_data_pdf(rest_url, user, token):
    # get PDF data from server
    # NOTE: temp hardcoded path for now
    print(rest_url)
    TEMP_PATH = "./source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"

    # load and extract
    pages = PDFUtils.load_pdf_pages_path(TEMP_PATH)
    raw_texts = PDFUtils.extract_raw_text_hardcopy(pages, verbose=True)

    # LLM?

    # post to server
    return
