from urllib.parse import urlparse


def extract_base_domain(url):
    parsed_url = urlparse(url)
    temp = parsed_url.netloc.lstrip("www.")
    print(f"Website: {temp.rstrip('.com')}")
    return temp.replace(".com", "")
