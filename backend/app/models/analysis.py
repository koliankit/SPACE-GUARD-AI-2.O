import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base, utc_now

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="queued", index=True)  # queued, running, completed, failed
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)
    model_version = Column(String(50), default="v1.0.0-isoforest-lotrobust")
    error_message = Column(Text, nullable=True)
    config_json = Column(Text, nullable=True)
    
    # Pre-calculated summary counts
    total_components = Column(Integer, default=0)
    safe_count = Column(Integer, default=0)
    monitor_count = Column(Integer, default=0)
    reject_count = Column(Integer, default=0)
    anomaly_count = Column(Integer, default=0)

    dataset = relationship("Dataset", back_populates="analysis_runs")
    results = relationship("AnalysisResult", back_populates="analysis_run", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="analysis_run", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis_run", cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_run_id = Column(String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(String(100), nullable=False, index=True)
    subsystem = Column(String(100), nullable=False, index=True)
    lot_id = Column(String(100), nullable=False, index=True)
    parameter = Column(String(100), nullable=False)
    current_value = Column(Float, nullable=False)
    datasheet_limit = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    lot_relative_score = Column(Float, nullable=False)  # robust z-score vs lot baseline
    drift_rate = Column(Float, nullable=False)          # slope / hr
    predicted_value = Column(Float, nullable=True)      # extrapolated 250h value
    risk_score = Column(Float, nullable=False)          # 0 - 100
    decision = Column(String(50), nullable=False, index=True)  # SAFE, MONITOR, REJECT
    explanation = Column(Text, nullable=False)
    physical_model_id = Column(String(100), nullable=False)
    prediction_confidence = Column(String(100), default="High")

    analysis_run = relationship("AnalysisRun", back_populates="results")

    __table_args__ = (
        Index("ix_analysis_result_comp", "analysis_run_id", "component_id"),
        Index("ix_analysis_result_decision", "analysis_run_id", "decision"),
    )
