from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

from redis_queue import push_email_to_queue, is_redis_connected
from database import SessionLocal
from models import EmailRecord

app = FastAPI()

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailInput(BaseModel):
    subject: str
    body: str


@app.get("/")
def home():
    return {"message": "InboxIQ Backend Running"}


@app.get("/health")
def health():
    return {
        "status": "running",
        "redis_connected": is_redis_connected()
    }


@app.post("/webhook")
def webhook(email: EmailInput):
    email_data = {
        "subject": email.subject,
        "body": email.body,
        "received_at": datetime.utcnow().isoformat()
    }

    push_email_to_queue(email_data)

    return {
        "message": "Email queued successfully"
    }


@app.get("/emails")
def get_emails():
    db = SessionLocal()

    records = db.query(EmailRecord).order_by(EmailRecord.id.desc()).all()

    result = []

    for row in records:
        result.append({
            "id": row.id,
            "subject": row.subject,
            "body": row.body,
            "category": row.category,
            "confidence": row.confidence,
            "created_at": row.created_at
        })

    db.close()

    return result