from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.app.schemas.analysis import AnalysisSummary, ComponentResultSchema

class AuditLogSchema(BaseModel):
    id: str
    analysis_run_id: str
    event: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

class MissionStatusResponse(BaseModel):
    system_online: bool
    ai_engine_online: bool
    database_online: bool
    data_stream_active: bool
    mission_health_score: float
    summary: AnalysisSummary
    active_analysis_id: Optional[str] = None
    active_dataset_id: Optional[str] = None
    critical_components: List[ComponentResultSchema] = []
    last_updated: str
