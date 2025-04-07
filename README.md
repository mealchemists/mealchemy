# mealchemy

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

- Docker (for Docker and Docker Compose options)

### Local 

- Python 3.12
- tesseract 
- Node.js and npm
- Chrome 

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

