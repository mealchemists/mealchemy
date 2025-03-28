import os
import json
import threading
import pika
import traceback

from dotenv import load_dotenv

from pdf.main import extract_recipe_data_pdf  # type: ignore
from web.main import extract_recipe_data_url

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
        Process a received message and perform a runtime-defined
        callback function.
        """
        callback_function = None
        args = ()

        # unpack pub/sub message
        # should contain the following:
        # - user ID
        # - JWT token
        # - task type
        # - payload

        try:
            data = json.loads(body.decode("utf-8"))
            print(json.dumps(data, indent=4))
            user = data.get("user")
            token = data.get(
                "token"
            )  # pass a JWT token to the consumer to upload the extracted data
            task_type = data.get("task_type")  # "web" | "pdf"
            payload = data.get(
                "payload", None
            )  # contains either the URL or the PDF API link...?

            # define callback function and payload from arguments
            # the consumer will POST to the server once finished
            # for PDF extraction, use an additional API call to retrieve the uploaded PDF
            if task_type == "web":
                callback_function = extract_recipe_data_url
                url = payload.get("url", None)
                args = (url, user, token)
            elif task_type == "pdf":
                # TODO: Implement file retrieval, server-side
                callback_function = extract_recipe_data_pdf
                pdf_api_path = payload.get("api_path", None)
                args = (pdf_api_path, user, token)
            else:
                raise ValueError("Invalid task type!")

            task_thread = threading.Thread(target=callback_function, args=args)
            task_thread.start()

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except AttributeError:
            traceback.print_exc()
            channel.queue_purge(queue_name)
            print("Purging queue!")

    # Consume with manual acknowledgment
    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=False
    )

    # Start consuming messages
    print(f"Started consuming on queue: {queue_name}")
    channel.start_consuming()

    return


if __name__ == "__main__":
    start_consumer()
    # extract_recipe_data_pdf(None, None, None)
