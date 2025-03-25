import os
import json
import threading
import pika
from pathlib import Path

from dotenv import load_dotenv

from pdf.main import extract_recipe_data_pdf
from web.main import get_recipe_data

load_dotenv()
PIKA_URL = os.environ["PIKA_URL"]


def start_consumer(
    rabbitmq_url: str = PIKA_URL,
    queue_name: str = "admin",
):
    """
    Start a RabbitMQ consumer for a given queue, with a dynamic callback function.
    """

    params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue=queue_name)  # queue with "admin"

    def callback(ch, method, properties, body):
        """
        Process a received message and perform the given callback function
        `callback_function`.
        """
        callback_function = None
        args = ()
        data = json.loads(body.decode("utf-8"))

        user = data.get("user")
        token = data.get(
            "token"
        )  # pass a JWT token to the consumer to upload the extracted data
        task_type = data.get("task_type")  # "web" | "pdf"
        payload = data.get("payload")

        # define callback function and payload from arguments
        # the consumer will POST to the server once finished
        if task_type == "web":
            callback_function = get_recipe_data
            url = payload.get("url")
            args = (url, user, token)
        elif task_type == "pdf":
            callback_function = extract_recipe_data_pdf

            # use an additional API call to retrieve the uploaded PDF
            # TODO: Implement file retrieval, server-side
            api_path = payload.get("api_path")
            args = (api_path, user, token)
        else:
            raise ValueError("Invalid task type!")

        task_thread = threading.Thread(target=callback_function, args=args)
        task_thread.start()

        ch.basic_ack(delivery_tag=method.delivery_tag)

    # Consume with manual acknowledgment
    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=False
    )

    # Start consuming messages
    channel.start_consuming()

    print(f"Started consuming on queue: {queue_name}")

    return
