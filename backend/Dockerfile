FROM python:3.12
ENV PYTHONUNBUFFERED 1
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . /app

EXPOSE 8000

# Run migrations and start the server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000