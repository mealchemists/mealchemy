# mealchemy

![](frontend/public/mealchemy-logo.png)

Smart meal planning & shopping app for ECE 493.

## Overview

This is a multi-service application that consists of the following components:

- **Backend**: A Django-based API service.
- **Frontend**: A React-based frontend application.
- **Recipe Extractor**: A custom Python service for scraping and processing recipe data.

The application can be deployed in different environments using the following methods:

- **Cloud** (Google Cloud, AWS, etc.)
- **Docker** (Local or Remote)
- **Local Development** (Manual setup)

---

## Requirements

### Cloud 

- None!

### Docker 


### Local 

- Python 3.12
- Tesseract-OCR
  - Ubuntu: `sudo apt install -y tesseract-ocr`
- poppler-utils
  - Ubuntu: `sudo apt install -y poppler-utils`
- Node.js and npm
  - Install node in any way that you want [here](https://nodejs.org/en/download/). In this case, get v22.14.0 (LTS) under Linux.
- Chrome
  - Ubuntu:
    - `wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb`
    - `dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install`

---

## Running Options

### 1. Cloud Deployment

To deploy this application on the cloud (e.g., Google Cloud, AWS, etc.), follow these steps:

1. **Set up cloud environment**:
   - Set up cloud services like cloud storage, managed databases, or container orchestration (e.g., Kubernetes, Cloud Run, or ECS).
   - Ensure your cloud environment has access to the necessary environment variables or a `.env` file for configuration.

2. **Build and deploy**:
   - Use the following command to deploy your services to the cloud:
     ```bash
     # Fill in your specific cloud deployment command
     ```

3. **Access the application**:
   - Once deployed, access the application via the provided cloud URLs or endpoints.

### 2. Docker Deployment

To run the application using Docker, follow these steps:

1. **Ensure Docker is installed**:
   - Make sure Docker and Docker Compose are installed on your machine. [Install Docker](https://www.docker.com/get-started).

2. **Build and run the containers**:
   - Navigate to the project directory where the `docker-compose.yml` file is located.
   - Run the following command to build and start the services:
     ```bash
     docker-compose up --build
     ```

3. **Initialize the database**:
   - In another terminal, navigate to the root of the repository, and type the following:
     ```bash
     docker-compose exec backend bash
     ```

     ```bash
     python manage.py migrate
     ```

   - Alternatively, from Docker Desktop, you can directly access the `backend` container's shell by clicking on 'Containers' -> 'backend' -> 'Exec', and type the following:

     ```bash
     python manage.py migrate
     ```

3. **Access the application**:
   - **Backend**: The Django backend will be available at `http://localhost:8000`.
   - **Frontend**: The React frontend will be available at `http://localhost:3000`.
   - **Recipe Extractor**: The extractor service will run in the background and listen for tasks from the backend.

4. **Stopping the services**:
   - To stop the services, run:
     ```bash
     docker-compose down
     ```

### 3. Local Development

If you prefer to run the application locally, follow these steps to set up each component:

#### Backend (Django)

1. **Install dependencies**:
   - Navigate to the `backend` directory and install the necessary dependencies using `pip`:
     ```bash
     cd backend
     pip install -r requirements.txt
     ```

2. **Apply migrations**:
   - Run Django migrations to set up the database:
     ```bash
     python manage.py migrate
     ```

3. **Run the backend**:
   - Start the Django development server:
     ```bash
     python manage.py runserver
     ```

   - The backend will be available at `http://localhost:8000`.

#### Frontend (React)

1. **Install dependencies**:
   - Navigate to the `frontend` directory and install the necessary dependencies using `npm` or `yarn`:
     ```bash
     cd frontend
     npm install
     ```

2. **Run the frontend**:
   - Start the React development server:
     ```bash
     npm start
     ```

   - The frontend will be available at `http://localhost:3000`.

#### Recipe Extractor (Custom Python Service)

1. **Install dependencies**:
   - Navigate to the `recipe-extractors` directory and install the required Python packages:
     ```bash
     cd recipe-extractors
     pip install -r requirements.txt
     ```

2. **Run the extractor**:
   - The recipe extractor is designed to run as a background service and listen for tasks from the backend.
   - Start the extractor service (fill in the specific command if needed):
     ```bash
     # Start the recipe extractor (fill in command)
     ```

---

## Environment Variables

If you're using Docker or local development, you might need to set up environment variables. These should be placed in a `.env` file in the root of your project. Here's an example of some common environment variables:

```env
# .env file

# Database settings (for Django)
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword

# Django settings
DJANGO_SECRET_KEY=mysecretkey
DJANGO_DEBUG=True

# Frontend settings
REACT_APP_API_URL=http://localhost:8000

# Any other custom settings you need...
```

### CloudAMQP URL

1. Create a CloudAMQP account.
2. Create a new instance with any name.
3. Select any region and data center. I used Azure in East US, but it shouldn't really matter.
4. Click 'Review' -> 'Create instance'.
5. Navigate to your instance, and under 'AMQP details', copy the URL and paste it into the `PIKA_URL` environment variable.

### USDA FDC API Key

You can get your own USDA FoodData Central API key [here](https://fdc.nal.usda.gov/api-key-signup).

### OpenAI API Key

Provide an API key from OpenAI, and assign it to the `OPENAI_ECE493_G06_KEY` variable. In this case, you can use the one provided that was provided to this group.

### Docker

If you would like to run the project locally under a Docker container, create a `.env` file at the root of this repository:

- Make sure that `DOCKER=True` under 'Docker settings' below.

```env
## Global
# Third-party
OPENAI_ECE493_G06_KEY="my_openai_key"
USDA_FDC_API_KEY="my_fdc_api_key"
PIKA_URL="my_cloudamqp_url"
# To generate your own secret key, paste this in your terminal:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY="my_django_secretkey"

# Email (for sending forgot password emails)
EMAIL_PASSWORD="my_email_password"
EMAIL_USER="my_email_user"
DEFAULT_EMAIL="my_default_email"

## Docker settings
DOCKER="True"
USE_SQLITE3="True" # Use if you want to make debugging a bit easier locally, as there are VSCode extensions that let you view SQLite3 databases.
POSTGRES_DB="db"
POSTGRES_USER="my_postgres_user"
POSTGRES_PASSWORD="my_postgres_password"
DATABASE_URL="my_postgres_url"
```

Create a `.env` file under the `backend/` directory:

```env
# This can be anything as we are not in a deployment environment.
GS_BUCKET_NAME="foobar"
```

Create a `.env` file under the `recipe-extractors/` directory:

```env
EXTRACT_URL="http://backend:8080"
```

### Local run

If you are running locally, make sure to set `DOCKER="False"` like in the example below:

```env
## Global
# Third-party
OPENAI_ECE493_G06_KEY="my_openai_key"
USDA_FDC_API_KEY="my_fdc_api_key"
# RabbitMQ connection string
PIKA_URL="my_cloudamqp_url"
# To generate your own secret key, paste this in your terminal:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY="my_django_secretkey"

# Email (for sending forgot password emails)
EMAIL_PASSWORD="my_email_password"
EMAIL_USER="my_email_user"
DEFAULT_EMAIL="my_default_email"

## Docker settings
DOCKER="False"
USE_SQLITE3="True" # Use if you want make debugging a bit easier locally, as there are VSCode extensions that let you view SQLite3 databases.
POSTGRES_DB="db"
POSTGRES_USER="my_postgres_user"
POSTGRES_PASSWORD="my_postgres_password"
DATABASE_URL="my_postgres_url"
```

Similarly to with Docker, create two `.env` files in the `backend/` and `recipe-extractors/` directories.

