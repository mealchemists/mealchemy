import sys
import os
import json
import threading
import pika
import traceback
import time
import logging

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
        self.start_keepalive()

    def on_queue_declared(self, frame):
        logger.info(f"Queue '{self.queue_name}' declared")
        self.channel.basic_consume(  # type: ignore
            queue=self.queue_name, on_message_callback=self.callback, auto_ack=False
        )

    def on_connection_closed(self, connection, reason):
        # Callback function for when the connection is closed
        logger.warning(f"connection closed: {reason}")
        # to break out of run(), stop the ioloop
        if self.connection:
            try:
                connection.ioloop.stop()
                logger.info("ioloop stopped successfully")
            except Exception as e:
                logger.error(f"error stopping ioloop: {e}")
        # reset
        self.channel = None
        self.connection = None

        logger.info("restarting:")
        time.sleep(3)
        self.run()

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
                # TODO: Get PDF data retrieval from the server working
                callback_function = extract_recipe_data_pdf
                temp_file_path = payload.get("temp_path", None)
                args = (temp_file_path, user, token)
            else:
                raise ValueError("Invalid task type!")

            worker = threading.Thread(target=callback_function, args=args).start()
            threads.append(worker)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception:
            self.channel.queue_purge(f"{self.queue_name}")  # type: ignore
            traceback.print_exc()
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    # def start_keepalive(self):
    #     # Schedule the first keepalive callback after 10 seconds
    #     self.connection.ioloop.call_later(10, self.keepalive)  # type: ignore
    #
    # def keepalive(self):
    #     # This function is called periodically by the ioloop.
    #     if self.connection and self.connection.is_open:
    #         print("Keep-alive check: Connection is open")
    #
    #     else:
    #         print("Keep-alive check: Connection is closed or None")
    #     # Schedule the next keepalive check
    #     self.connection.ioloop.call_later(10, self.keepalive)  # type: ignore
    #
    # def run(self):
    #     params = pika.URLParameters(f"{self.amqp_url}?heartbeat=10")
    #
    #     self.connection = pika.SelectConnection(
    #         params, on_open_callback=self.on_connection_open
    #     )
    #     print(f"Now consuming on queue {self.queue_name}")
    #     try:
    #         self.connection.ioloop.start()
    #     except KeyboardInterrupt:
    #         print("Consumer stopped!")
    #         self.connection.close()

    def start_keepalive(self):
        if self.connection:
            self.connection.ioloop.call_later(10, self.keepalive)

    def keepalive(self):
        if self.connection and self.connection.is_open:
            logger.info("keep-alive check: Connection is open")
            self.connection.ioloop.call_later(10, self.keepalive)
        else:
            logger.info("Keep-alive check: Connection is closed. Triggering reconnect.")
            # Stop the current ioloop if it's still running.
            try:
                if self.connection:
                    self.connection.ioloop.stop()
            except Exception as e:
                logger.error(f"Error stopping ioloop in keepalive: {e}")

    def run(self):
        params = pika.URLParameters(f"{self.amqp_url}?heartbeat=10")
        self.connection = pika.SelectConnection(
            params,
            on_open_callback=self.on_connection_open,
            on_close_callback=self.on_connection_closed,
        )

        logger.info(f"Now consuming on queue '{self.queue_name}'")
        try:
            self.connection.ioloop.start()
        except KeyboardInterrupt:
            logger.info("Consumer stopped!")
            if self.connection and self.connection.is_open:
                self.connection.close()

    def run_forever(self):
        """Continuously run the consumer, reconnecting on connection closure."""
        while True:
            try:
                self.run()
            except Exception as e:
                logger.error(f"Consumer encountered an error: {e}")
            time.sleep(5)


if __name__ == "__main__":
    consumer = Consumer(PIKA_URL, queue_name="admin")
    consumer.run()
