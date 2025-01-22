# amqps://njslbjoh:qSWAVgxBywu6oIRcn5IS4LkCihc8LwHS@horse.lmq.cloudamqp.com/njslbjoh
import pika
params = pika.URLParameters("amqps://njslbjoh:sBepSHwzktvaxnpm9-5kcCAtJR63rzJ0@horse.lmq.cloudamqp.com/njslbjoh")

connection = pika.BlockingConnection(params)

from main import get_recipe_data

channel = connection.channel()
channel.queue_declare(queue="admin")

def callback(ch, method, properties, body): 
    print(f"Received message: {body}")
    get_recipe_data(body.decode("utf-8"))
    
    # Acknowledge the message after processing
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Start consuming with manual acknowledgment
channel.basic_consume(queue="admin", on_message_callback=callback, auto_ack=False)

print("Started consuming")

# Start consuming messages
channel.start_consuming()