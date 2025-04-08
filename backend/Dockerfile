FROM python:3.12
ENV PYTHONUNBUFFERED 1
WORKDIR /app

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN python -m spacy download en_core_web_sm
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
