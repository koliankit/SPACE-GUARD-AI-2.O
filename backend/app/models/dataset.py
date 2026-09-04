import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base, utc_now

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)
    upload_timestamp = Column(DateTime, default=utc_now, index=True)
    row_count = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    missing_rows = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    status = Column(String(50), default="uploaded")

    measurements = relationship("Measurement", back_populates="dataset", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="dataset", cascade="all, delete-orphan")
