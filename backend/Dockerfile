FROM python:3.12

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Set working directory inside the container
WORKDIR /app

# Copy the requirements.txt and install dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy all project files into the container
COPY . /app

# Run database migrations (for when the container starts)
RUN python manage.py migrate

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port that the app will run on
EXPOSE 8000

# Start the application with Gunicorn (recommended for production)
CMD [gunicorn backend.wsgi:application --bind 0.0.0.0:8000]
