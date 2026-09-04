import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base, utc_now

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    event = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=utc_now, index=True)
    metadata_json = Column(Text, nullable=True)

    analysis_run = relationship("AnalysisRun", back_populates="audit_logs")
