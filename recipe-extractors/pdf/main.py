from .pdf_utils import PDFUtils
import requests

django_url = "http://localhost:8000/api/recipe-ingredients"


def extract_recipe_data_pdf(rest_url, user, token):
    # get PDF data from server
    # NOTE: temp hardcoded path for now
    TEMP_PATH = "./pdf/source_material/hardcopy_scans/multi/Healthy Family Week1.pdf"

    # load and extract
    pages = PDFUtils.load_pdf_pages_path(TEMP_PATH)
    raw_texts = PDFUtils.extract_raw_text_hardcopy(pages, verbose=True)

    # LLM?

    # post to server
    # result["recipe"]["source_url"] = url
    # result["recipe"]["user"] = user
    #
    # headers = {
    #     "Authorization": f"Bearer {token}",  # Add the token in Authorization header
    # }
    # response = requests.post(url=django_url, json=result, headers=headers)
    #
    # # Check if the request was successful
    # if response.status_code == 201:
    #     print("Successfully sent the recipe data.")
    # else:
    #     print(
    #         f"Failed to send recipe data. Status Code: {response.status_code}, Response: {response.text}"
    #     )
    return
