import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text
from app.db.base import Base


class AdminNotification(Base):
    __tablename__ = "admin_notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String(50), nullable=False)  # "user_registration", "scan_update", "job_metrics", "expired_alert"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data_json = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
