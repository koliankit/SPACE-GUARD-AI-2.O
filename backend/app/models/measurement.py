import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base, utc_now

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(String(100), nullable=False, index=True)
    lot_id = Column(String(100), nullable=False, index=True)
    parameter = Column(String(100), nullable=False, index=True)
    stage = Column(String(50), nullable=False, index=True)  # e.g., '0h', '24h', '96h', '168h'
    value = Column(Float, nullable=False)
    datasheet_limit = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=utc_now)

    dataset = relationship("Dataset", back_populates="measurements")

    __table_args__ = (
        Index("ix_measurement_comp_stage", "component_id", "parameter", "stage"),
        Index("ix_measurement_lot_param", "lot_id", "parameter", "stage"),
    )
