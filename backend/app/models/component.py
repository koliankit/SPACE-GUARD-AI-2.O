import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from backend.app.database import Base, utc_now

class Component(Base):
    __tablename__ = "components"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    component_id = Column(String(100), unique=True, nullable=False, index=True)
    subsystem = Column(String(100), nullable=False, index=True)
    lot_id = Column(String(100), nullable=False, index=True)
    physical_model_id = Column(String(100), nullable=False)
    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    z = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)
