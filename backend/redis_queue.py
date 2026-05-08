import redis
import json

# Redis connection
redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)

QUEUE_NAME = "email_queue"


def push_email_to_queue(email_data):
    redis_client.lpush(QUEUE_NAME, json.dumps(email_data))


def is_redis_connected():
    try:
        redis_client.ping()
        return True
    except:
        return False