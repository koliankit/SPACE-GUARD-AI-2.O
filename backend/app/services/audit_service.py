import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog
from backend.app.database import utc_now

def log_audit_event(
    db: Session,
    analysis_run_id: str,
    event: str,
    metadata: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """Logs a persistent audit event into the database."""
    entry = AuditLog(
        analysis_run_id=analysis_run_id,
        event=event,
        timestamp=utc_now(),
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
