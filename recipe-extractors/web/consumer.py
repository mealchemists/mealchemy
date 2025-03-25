import os
import json
import pika
from dotenv import load_dotenv
from main import get_recipe_data

load_dotenv()
params = pika.URLParameters(os.environ["PIKA_URL"])
print(params)

connection = pika.BlockingConnection(params)


channel = connection.channel()
channel.queue_declare(queue="admin")


def callback(ch, method, properties, body):
    print(f"Received message: {body}")
    data = json.loads(body.decode("utf-8"))
    url = data.get("url")
    user = data.get("user")
    token = data.get("token")
    get_recipe_data(url, user, token)

    # Acknowledge the message after processing
    ch.basic_ack(delivery_tag=method.delivery_tag)


# Start consuming with manual acknowledgment
channel.basic_consume(queue="admin", on_message_callback=callback, auto_ack=False)

print("Started consuming")

# Start consuming messages
channel.start_consuming()
