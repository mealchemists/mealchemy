import pika
from typing import Callable

RABBITMQ_URL = (
    "amqps://njslbjoh:qSWAVgxBywu6oIRcn5IS4LkCihc8LwHS@horse.lmq.cloudamqp.com/njslbjoh"
)


def start_consumer(
    rabbitmq_url: str,
    callback_function: Callable[[str], None],
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
        message = body.decode("utf-8")
        print(f"Queue {queue_name}: received {message}")

        callback_function(message)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    # Consume with manual acknowledgment
    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=False
    )

    # Start consuming messages
    channel.start_consuming()

    print(f"Started consuming on queue: {queue_name}")

    return
