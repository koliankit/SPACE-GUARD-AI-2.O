import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "SPACEGUARD AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Real-Time Intelligent Reliability Monitoring for Spacecraft Components"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./spaceguard.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"))
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports"))
    
    # Configurable ML & Screening Thresholds
    RISK_SAFE_MAX: float = 35.0
    RISK_MONITOR_MAX: float = 70.0
    LOT_ZSCORE_THRESHOLD: float = 2.5
    ANOMALY_THRESHOLD: float = 0.65
    MIN_OBSERVATIONS_FOR_PREDICTION: int = 2
    PREDICTION_HORIZON_HOURS: float = 250.0
    DATA_QUALITY_MIN_SCORE: float = 70.0

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
