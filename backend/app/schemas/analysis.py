from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalysisSummary(BaseModel):
    total_components: int
    safe: int
    monitor: int
    reject: int
    anomalies: int

class ComponentResultSchema(BaseModel):
    component_id: str
    subsystem: str
    lot_id: str
    parameter: str
    current_value: float
    datasheet_limit: float
    anomaly_score: float
    lot_relative_score: float
    drift_rate: float
    predicted_value: Optional[float] = None
    risk_score: float
    decision: str  # SAFE, MONITOR, REJECT
    explanation: str
    physical_model_id: str
    prediction_confidence: Optional[str] = "High"

class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    dataset_id: str
    summary: AnalysisSummary
    results: List[ComponentResultSchema]
    model_version: str = "v1.0.0-isoforest-lotrobust"
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class AnalysisStartRequest(BaseModel):
    dataset_id: str
    model_config_override: Optional[Dict[str, Any]] = None
