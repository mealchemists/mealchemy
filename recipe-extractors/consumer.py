import pika
import sys
import json
import os
import logging
import threading
from dotenv import load_dotenv

from pdf.main import extract_recipe_data_pdf  # type: ignore
from web.main import extract_recipe_data_url

logging.basicConfig(
    level=logging.INFO,  # Print DEBUG logs
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logging.getLogger("pika").setLevel(logging.WARNING)
logging.getLogger("django").setLevel(logging.WARNING)

load_dotenv()
PIKA_URL = os.environ["PIKA_URL"]
logger = logging.getLogger(__name__)

threads = []


class AsyncConsumer:
    def __init__(self) -> None:
        self.amqp_url = os.environ.get("PIKA_URL", "amqp://localhost:5672/")
        self.connection = None
        self.channel = None
        self._closing = False
        self.reconnect_delay = 3
        self.queue_name = "admin"

    def connect(self):
        params = pika.URLParameters(self.amqp_url)
        params.heartbeat = 120
        return pika.SelectConnection(
            parameters=params,
            on_open_callback=self.on_connection_open,
            on_open_error_callback=self.on_connection_open_error,
            on_close_callback=self.on_connection_closed,
        )

    def on_connection_open(self, connection):
        logging.info("Connection opened")
        self.connection = connection
        self.connection.channel(on_open_callback=self.on_channel_open)

    def on_connection_open_error(self, _connection, error):
        logging.error(f"Connection open failed: {error}")
        if not self._closing:
            self.connection.ioloop.call_later(self.reconnect_delay, self.reconnect)  # pyright: ignore

    def on_connection_closed(self, _connection, reason):
        logging.info(f"Connection closed: {reason}")
        if not self._closing:
            self.connection.ioloop.call_later(self.reconnect_delay, self.reconnect)  # pyright: ignore

    def on_channel_open(self, channel):
        logging.info("Channel opened")
        self.channel = channel
        self.channel.queue_declare(
            queue=self.queue_name, callback=self.on_queue_declared
        )

    def on_queue_declared(self, frame):
        logging.info("Queue declared. Listening for messages.")
        self.channel.basic_consume(  # pyright: ignore
            queue=self.queue_name, on_message_callback=self.callback, auto_ack=False
        )

    def callback(self, ch, method, properties, body):
        try:
            data = json.loads(body.decode("utf-8"))

            user = data.get("user")
            token = data.get("token")
            task_type = data.get("task_type")
            payload = data.get("payload", None)  # {"temp_path" | "url"}

            if task_type == "web":
                callback_function = extract_recipe_data_url
                url = payload.get("url", "").strip()
                args = (url, user, token)
            elif task_type == "pdf":
                callback_function = extract_recipe_data_pdf
                temp_file_path = payload.get("temp_path", None)
                args = (temp_file_path, user, token)
            else:
                raise ValueError("Invalid task type!")

            logging.info(f"Received message. Data: {args[0]}")

            worker_thread = threading.Thread(
                target=callback_function, args=args
            ).start()
            threads.append(worker_thread)

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            logging.error(
                f"Unexpected error {type(e).__name__} processing message!\n{e}"
            )
            self.channel.queue_purge(f"{self.queue_name}")  # type: ignore
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def reconnect(self):
        if not self._closing:
            self.connection = self.connect()
            self.connection.ioloop.start()

    def run(self):
        self.connection = self.connect()
        try:
            self.connection.ioloop.start()
        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        self._closing = True
        if self.channel:
            self.channel.close()
        if self.connection:
            self.connection.close()

        if len(threads) != 0:
            logging.info("Joining threads")
            for thread in threads:
                thread.join()

        logging.info("Consumer stopped.")


if __name__ == "__main__":
    consumer = AsyncConsumer()
    consumer.run()
