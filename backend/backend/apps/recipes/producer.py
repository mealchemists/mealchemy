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
    except Exception as _:
        channel = None


def publish(data):
    body = json.dumps(data).encode("utf-8")  # Serialize to JSON and convert to bytes
    if channel is not None:
        try:
            channel.basic_publish(exchange="", routing_key="admin", body=body)
        except Exception as e:
            print(e)


class Producer:
    def __init__(self):
        self.is_testing = os.environ.get("DJANGO_TEST", "FALSE").upper() == "TRUE"
        self.amqp_url = os.environ.get("PIKA_URL", "amqp://localhost:5672/")
        print(f"PARTIAL PIKA URL: {self.amqp_url[-24:]}")
        self.connection = None
        self.channel = None

        if not self.is_testing:
            self.connect()

    def connect(self):
        print("ATTEMPTED TO CONNECT")
        try:
            # We do not care about the producer consumer if we are testing.
            params = pika.URLParameters(
                os.environ.get("PIKA_URL", "amqp://localhost:5672/")
            )
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
        except Exception as _:
            self.channel = None

    def publish(self, data):
        if self.is_testing:
            return

        body = json.dumps(data).encode(
            "utf-8"
        )  # Serialize to JSON and convert to bytes

        # assert self.connection is not None

        try:
            if self.channel is None or self.connection.is_closed:
                print(
                    f"producer reconnecting before publishing: connection closed: {self.connection.is_closed} | channel: {self.channel is None}"
                )
                self.connect()

            assert self.channel is not None
            self.channel.basic_publish(exchange="", routing_key="admin", body=body)

        except (AMQPConnectionError, StreamLostError) as e:
            print("producer connection lost")
            self.connect()

            if self.channel:
                self.channel.basic_publish(exchange="", routing_key="admin", body=body)

        except Exception as e:
            print(f"failed to publish message: {e}")
