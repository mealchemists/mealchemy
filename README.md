# mealchemy

<!--toc:start-->
- [mealchemy](#mealchemy)
  - [Overview](#overview)
  - [Requirements](#requirements)
    - [Cloud](#cloud)
    - [Docker](#docker)
    - [Local](#local)
  - [Running Options](#running-options)
    - [1. Cloud Deployment](#1-cloud-deployment)
    - [2. Docker Deployment](#2-docker-deployment)
    - [3. Local Development](#3-local-development)
      - [Backend (Django)](#backend-django)
      - [Frontend (React)](#frontend-react)
      - [Recipe Extractor (Custom Python Service)](#recipe-extractor-cust  om-python-service)
  - [Environment Variables](#environment-variables)
    - [CloudAMQP URL](#cloudamqp-url)
    - [USDA FDC API Key](#usda-fdc-api-key)
    - [OpenAI API Key](#openai-api-key)
    - [Docker configuration](#docker-configuration)
    - [Local run](#local-run)
<!--toc:end-->

<div align="center">

<img src="frontend/public/mealchemy-logo.png" alt="Mealchemy Logo" style="width: 200px; height: auto; padding: 10px;" />
</div>

Smart meal planning & shopping app for ECE 493 W2025, group 6.

## Overview

This is a micro-service application that consists of the following components:

- **Backend**: A Django-based API service.
- **Frontend**: A React-based frontend application.
- **Recipe Extractor**: A custom Python service for scraping and processing recipe data.
- **Database**: Database for sotring user information

The application can be used/ran in different environments using the following methods:

- **Google Cloud Platform**
- **Docker** 
- **Local Development** (Very Manual setup)

---

## Requirements

### Cloud 

- None!

### Docker 
Installation of docker can be found here:  https://docs.docker.com/engine/install/
#### Operating System:
- WSL2
- Linux

####


### Local 

#### Dependencies
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

#### Virtual Environment
Create a Python virtual environment
```
python -m venv .mealchemyEnv
```

Start environemnt
```
source .mealchemyEnv/bin/activate
```

## Running Options

### 1. Cloud Deployment

To see the fully deployed application visit [mealchemy.app](https://www.mealchemy.app)

   
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
     ```
     python manage.py makemigrations && python manage.py migrate
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
   - Start the extractor service:
     ```bash
     python consumer.py
     ```

---

## Environment Variables

If you're using Docker or local development, you might need to set up environment variables. These should be placed in a `.env` file in the root of your project.

### Docker configuration

If you would like to run the project locally under a Docker container, create a `.env` file at the root of this repository:

- Make sure that `DOCKER=True` under 'Docker settings' below.

```env
## Global
OPENAI_ECE493_G06_KEY="my_openai_key"
USDA_FDC_API_KEY="my_fdc_api_key"
PIKA_URL="my_cloudamqp_url"
SECRET_KEY="my_django_secretkey"

# Email (for sending forgot password emails)
EMAIL_PASSWORD="my_email_password"
EMAIL_USER="my_email_user"
DEFAULT_EMAIL="my_default_email"

## Docker settings
DOCKER="True"
POSTGRES_DB="db"
POSTGRES_USER="my_postgres_user"
POSTGRES_PASSWORD="my_postgres_password"
EXTRACT_URL="http://backend:8080"
DATABASE_URL="postgres://postgres:root@db:5432/db" # you can directly use this as its defined in the docker container
```

### Local run

If you are running locally, you need to have your postgres installation and point the url to your database and user credentials. If this is too difficult you can also directly use a sqlite3 instance with the. Simply unset the databse url environment variable using `unset DATABASE_URL` and comment it out in your .env. This will use a sqlite3 instance instead.

make sure to set `DOCKER="False"` like in the example below:

```env
## Global
OPENAI_ECE493_G06_KEY="my_openai_key"
USDA_FDC_API_KEY="my_fdc_api_key"
PIKA_URL="my_cloudamqp_url"
SECRET_KEY="my_django_secretkey"

# Email (for sending forgot password emails)
EMAIL_PASSWORD="my_email_password"
EMAIL_USER="my_email_user"
DEFAULT_EMAIL="my_default_email"

## Local settings
DOCKER="False"
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database_name>"

# Or if you want to just use sqlite
DOCKER="False"
# DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<database_name>" #keep this uncommented to use default sqlite3

```

