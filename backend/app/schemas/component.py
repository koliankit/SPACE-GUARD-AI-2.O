from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.app.schemas.analysis import ComponentResultSchema

class StageMeasurement(BaseModel):
    stage: str
    value: float
    datasheet_limit: float

class ComponentSummary(BaseModel):
    component_id: str
    subsystem: str
    lot_id: str
    risk_score: float
    decision: str
    anomaly_score: float
    physical_model_id: str
    parameter: Optional[str] = None
    current_value: Optional[float] = None
    datasheet_limit: Optional[float] = None

class ComponentDetail(BaseModel):
    component_id: str
    subsystem: str
    lot_id: str
    physical_model_id: str
    coordinates: List[float]
    measurements: List[StageMeasurement]
    latest_result: Optional[ComponentResultSchema] = None

class PredictionResponse(BaseModel):
    component_id: str
    parameter: str
    observed_stages: List[Dict[str, Any]]
    drift_rate: float
    predicted_value: Optional[float] = None
    prediction_horizon_hours: float
    datasheet_limit: float
    time_to_limit_hours: Optional[float] = None
    prediction_confidence: str
    message: Optional[str] = None
