import pika
import json

params = pika.URLParameters("amqps://njslbjoh:sBepSHwzktvaxnpm9-5kcCAtJR63rzJ0@horse.lmq.cloudamqp.com/njslbjoh")

connection = pika.BlockingConnection(params)

channel = connection.channel()

def publish(data):
    body = json.dumps(data).encode('utf-8')  # Serialize to JSON and convert to bytes
    channel.basic_publish(exchange="", routing_key="admin", body=body)
