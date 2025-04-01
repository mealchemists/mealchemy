import pika
import json
import os

from dotenv import load_dotenv

load_dotenv()

is_testing = os.environ.get("DJANGO_TEST", "FALSE").upper() == "TRUE"

if not is_testing:
    try:
        params = pika.URLParameters(
            os.environ.get("PIKA_URL", "amqp://localhost:5672/")
        )
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
    except Exception as _:
        channel = None


def publish(data):
    body = json.dumps(data).encode("utf-8")  # Serialize to JSON and convert to bytes
    if channel is not None:
        try:
            channel.basic_publish(exchange="", routing_key="admin", body=body)
        except Exception as e:
            print(e)
