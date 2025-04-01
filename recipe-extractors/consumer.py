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

threads = []


# def start_consumer(
#     rabbitmq_url: str = PIKA_URL,
#     queue_name: str = "admin",
# ):
#     """
#     Start a RabbitMQ consumer for a given queue, with a dynamic callback function.
#     """
#
#     params = pika.URLParameters(rabbitmq_url)
#     # connection_params = pika.ConnectionParameters(heartbeat=5)
#     connection = pika.BlockingConnection(params)
#     channel = connection.channel()
#
#     channel.queue_declare(queue=queue_name)  # queue with "admin"
#
#     def callback(ch, method, properties, body):
#         """
#         Process a received message and perform a runtime-defined
#         callback function.
#         """
#         callback_function = None
#         args = ()
#
#         # unpack pub/sub message
#         # should contain the following:
#         # - user ID
#         # - JWT token
#         # - task type
#         # - payload
#
#         try:
#             data = json.loads(body.decode("utf-8"))
#             print(json.dumps(data, indent=4))
#             user = data.get("user")
#             token = data.get(
#                 "token"
#             )  # pass a JWT token to the consumer to upload the extracted data
#             task_type = data.get("task_type")  # "web" | "pdf"
#             payload = data.get(
#                 "payload", None
#             )  # contains either the URL or the PDF API link...?
#
#             # define callback function and payload from arguments
#             # the consumer will POST to the server once finished
#             # for PDF extraction, use an additional API call to retrieve the uploaded PDF
#             if task_type == "web":
#                 callback_function = extract_recipe_data_url
#                 url = payload.get("url", None).strip()
#                 args = (url, user, token)
#             elif task_type == "pdf":
#                 # TODO: Implement file retrieval, server-side
#                 callback_function = extract_recipe_data_pdf
#                 pdf_api_path = payload.get("api_path", None)
#                 args = (pdf_api_path, user, token)
#             else:
#                 raise ValueError("Invalid task type!")
#
#             task_thread = threading.Thread(target=callback_function, args=args)
#             task_thread.start()
#             threads.append(task_thread)
#
#             ch.basic_ack(delivery_tag=method.delivery_tag)
#
#         except AttributeError:
#             traceback.print_exc()
#             channel.queue_purge(queue_name)
#             print("Purging queue!")
#
#     # Consume with manual acknowledgment
#     channel.basic_consume(
#         queue=queue_name, on_message_callback=callback, auto_ack=False
#     )
#
#     # Start consuming messages
#     try:
#         print(f"Started consuming on queue: {queue_name}")
#         channel.start_consuming()
#     except KeyboardInterrupt:
#         print("Stopped consuming!")
#         channel.stop_consuming()
#
#         for thread in threads:
#             thread.join()
#
#     return
#
#
# if __name__ == "__main__":
#     start_consumer()


class Consumer:
    def __init__(self, amqp_url, queue_name):
        self.amqp_url = amqp_url
        self.queue_name = queue_name
        self.connection = None
        self.channel = None

    def on_connection_open(self, connection):
        self.connection = connection
        self.connection.channel(on_open_callback=self.on_channel_open)

    def on_channel_open(self, channel):
        self.channel = channel
        self.channel.queue_declare(
            queue=self.queue_name, callback=self.on_queue_declared
        )

    def on_queue_declared(self, frame):
        print(f"Consuming on queue {self.queue_name}")
        self.channel.basic_consume(  # type: ignore
            queue=self.queue_name, on_message_callback=self.callback, auto_ack=False
        )

    def callback(self, ch, method, properties, body):
        try:
            data = json.loads(body.decode("utf-8"))

            print(json.dumps(data, indent=4))
            user = data.get("user")
            token = data.get("token")
            task_type = data.get("task_type")

            payload = data.get("payload", None)

            if task_type == "web":
                callback_function = extract_recipe_data_url
                url = payload.get("url", "").strip()
                args = (url, user, token)
            elif task_type == "pdf":
                # TODO: Get PDF data extraction working
                callback_function = extract_recipe_data_pdf
                pdf_api_path = payload.get("api_path", None)
                args = (pdf_api_path, user, token)
            else:
                self.channel.queue_purge(self.queue_name)  # type: ignore
                raise ValueError("Invalid task type!")

            worker = threading.Thread(
                target=callback_function, args=args, daemon=True
            ).start()
            threads.append(worker)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            traceback.print_exc()
            # print("Error processing message:", e)

    def run(self):
        params = pika.URLParameters(f"{self.amqp_url}?heartbeat=10")

        self.connection = pika.SelectConnection(
            params, on_open_callback=self.on_connection_open
        )
        print(f"Now consuming on queue {self.queue_name}")
        try:
            self.connection.ioloop.start()
        except KeyboardInterrupt:
            print("Consumer stopped!")
            self.connection.close()


if __name__ == "__main__":
    consumer = Consumer(PIKA_URL, queue_name="admin")
    consumer.run()
