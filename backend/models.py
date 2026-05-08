from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class EmailRecord(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255))
    body = Column(Text)

    category = Column(String(100))
    assigned_team = Column(String(100))
    confidence = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())