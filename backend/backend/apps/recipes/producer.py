# import pika
# params = pika.URLParameters("amqps://njslbjoh:sBepSHwzktvaxnpm9-5kcCAtJR63rzJ0@horse.lmq.cloudamqp.com/njslbjoh")

# connection = pika.BlockingConnection(params)

# channel = connection.channel()

def publish(body):
    pass
    # channel.basic_publish(exchange="", routing_key="admin",body=body)