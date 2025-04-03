import requests
import json

# URLs
login_url = "http://localhost:8000/api/login"
csrf_url = "http://localhost:8000/api/csrf-token/"
recipe_ingredient_url = "http://localhost:8000/api/recipe-ingredients/"
file = "malformed_recipe_data.json"

# Load the malformed recipe data
with open(file, 'r') as f:
    data = json.load(f)

# Step 1: Login to get authentication (e.g., session cookie or token)
login_data = {
    'username': 'demo@email.com',   # Replace with your actual username
    'password': 'password$'    # Replace with your actual password
}

session = requests.Session()  # We use a session to maintain cookies

# Login request
login_response = session.post(login_url, json=login_data)

if login_response.status_code != 200:
    print(f"Login failed with status code {login_response.status_code}")
    exit()

print("Login successful!")

# Step 2: Get CSRF token
csrf_response = session.get(csrf_url)

if csrf_response.status_code != 200:
    print(f"Failed to retrieve CSRF token: {csrf_response.status_code}")
    exit()

csrf_token = csrf_response.json().get('csrf_token')

if not csrf_token:
    print("CSRF token not found!")
    exit()

print("CSRF token retrieved successfully.")

# Step 3: Send the POST request to the recipe ingredients endpoint
headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrf_token  # Include the CSRF token in the headers
}

# Send POST request with the data from the file
response = session.post(recipe_ingredient_url, json=data, headers=headers)

if response.status_code == 200:
    print("Request successful!")
    print("Response:", response.json())  # or response.text
else:
    print(f"Failed with status code {response.status_code}")
    print("Response:", response.text)
