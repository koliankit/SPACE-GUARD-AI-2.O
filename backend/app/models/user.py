import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from backend.app.database import Base, utc_now

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="ENGINEER")  # ADMIN, ENGINEER, VIEWER
    created_at = Column(DateTime, default=utc_now)
