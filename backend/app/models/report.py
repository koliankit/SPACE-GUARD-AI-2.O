import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base, utc_now

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    report_path = Column(String(500), nullable=False)
    report_type = Column(String(50), default="PDF")
    created_at = Column(DateTime, default=utc_now)

    analysis_run = relationship("AnalysisRun", back_populates="reports")
