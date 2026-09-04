from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class DataQualityReport(BaseModel):
    total_rows: int
    valid_rows: int
    missing_rows: int
    duplicate_rows: int
    component_count: int
    lot_count: int
    parameter_count: int
    available_stages: List[str]
    quality_score: float
    issues: List[str] = []

class ColumnMappingPreview(BaseModel):
    detected_columns: Dict[str, str]  # standard_key -> raw_header
    available_headers: List[str]
    confidence: float
    sample_rows: List[Dict[str, Any]]

class UploadResponse(BaseModel):
    dataset_id: str
    filename: str
    status: str
    data_quality: DataQualityReport
    mapping_preview: ColumnMappingPreview
    requires_manual_mapping: bool

class ColumnMappingSubmit(BaseModel):
    dataset_id: str
    mapping: Dict[str, str]  # standard_field -> original_header
