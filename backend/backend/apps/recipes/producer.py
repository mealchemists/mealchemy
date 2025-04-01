import pika
import json
import os

from dotenv import load_dotenv

load_dotenv()

params = pika.URLParameters(os.environ["PIKA_URL"])
connection = pika.BlockingConnection(params)
channel = connection.channel()


def publish(data):
    body = json.dumps(data).encode("utf-8")  # Serialize to JSON and convert to bytes
    channel.basic_publish(exchange="", routing_key="admin", body=body)
