import json
import time

from redis_queue import redis_client, QUEUE_NAME
from classifier import predict_category

from database import SessionLocal
from models import EmailRecord

# Category -> Team Routing
routing_map = {
    "Payment Problem": "Finance",
    "Refund Request": "Finance",
    "Subscription Cancellation": "Finance",

    "Login Issue": "Support",
    "Account Suspension": "Support",

    "Bug Report": "Engineering",
    "Performance Issue": "Engineering",
    "Data Sync Issue": "Engineering",

    "Feature Request": "Product",

    "Security Concern": "Security"
}

print("Worker started. Waiting for emails...\n")

while True:
    try:
        data = redis_client.rpop(QUEUE_NAME)

        if data:
            email = json.loads(data)

            subject = email["subject"]
            body = email["body"]

            category, confidence = predict_category(subject, body)

            assigned_team = routing_map.get(category, "Support")

            db = SessionLocal()

            new_record = EmailRecord(
                subject=subject,
                body=body,
                category=category,
                assigned_team=assigned_team,
                confidence=confidence
            )

            db.add(new_record)
            db.commit()
            db.close()

            print("====== EMAIL PROCESSED ======")
            print("Subject:", subject)
            print("Category:", category)
            print("Assigned Team:", assigned_team)
            print("Confidence:", confidence)
            print("=============================\n")

        else:
            time.sleep(1)

    except Exception as e:
        print("Worker Error:", e)
        time.sleep(2)