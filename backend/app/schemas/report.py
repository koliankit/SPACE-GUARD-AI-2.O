from typing import Optional
from pydantic import BaseModel

class ReportSummary(BaseModel):
    id: str
    analysis_run_id: str
    report_path: str
    report_type: str
    created_at: str
    total_components: int = 0
    anomaly_count: int = 0
    status: str = "completed"

class ReportGenerateResponse(BaseModel):
    report_id: str
    report_url: str
    filename: str
    message: str
