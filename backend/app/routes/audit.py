import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.audit import AuditLog
from backend.app.schemas.mission import AuditLogSchema

router = APIRouter(prefix="", tags=["Audit"])

@router.get("/audit-log/{analysis_id}", response_model=List[AuditLogSchema])
def get_audit_log(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves chronological persistent audit trail for a specific analysis run."""
    logs = db.query(AuditLog).filter(AuditLog.analysis_run_id == analysis_id).order_by(AuditLog.timestamp.asc()).all()
    if not logs:
        # If none for this run, check if any exists
        return []

    return [
        AuditLogSchema(
            id=log.id,
            analysis_run_id=log.analysis_run_id,
            event=log.event,
            timestamp=log.timestamp.strftime("%H:%M:%S UTC"),
            metadata=json.loads(log.metadata_json) if log.metadata_json else None
        )
        for log in logs
    ]
