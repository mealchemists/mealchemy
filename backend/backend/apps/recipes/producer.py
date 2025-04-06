import pika
import json
import os

from dotenv import load_dotenv

load_dotenv()


def publish_message(data, queue_name="admin"):
    # Publish a message to to the queue with a temporary connection.

    # prevent pipeline errors; we aren't testing producer/consumer here.
    is_testing = os.environ.get("DJANGO_TEST", "FALSE").upper() == "TRUE"
    amqp_url = os.environ["PIKA_URL"] if not is_testing else "amqp://localhost:5672/"

    try:
        params = pika.URLParameters(amqp_url)
        params.heartbeat = 120
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.queue_declare(queue=queue_name)
        channel.confirm_delivery()

        channel.basic_publish(
            exchange="",
            routing_key=queue_name,
            body=json.dumps(data).encode("utf-8"),
            # 1 minute should be more than enough for messages to live in the queue.
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent, expiration=60000
            ),
            mandatory=True,
        )

        print("Published message.")

        channel.close()
        return True

    except Exception as e:
        print(f"Error publishing message!\n{e}")
        return False
