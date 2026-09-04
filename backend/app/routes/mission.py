from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db, utc_now
from backend.app.models.dataset import Dataset
from backend.app.models.analysis import AnalysisRun, AnalysisResult
from backend.app.schemas.mission import MissionStatusResponse
from backend.app.schemas.analysis import AnalysisSummary, ComponentResultSchema

router = APIRouter(prefix="", tags=["Mission"])

@router.get("/mission-status", response_model=MissionStatusResponse)
def get_mission_status(db: Session = Depends(get_db)):
    """
    Returns real-time telemetry mission health and status.
    Calculates health dynamically from component risk scores (never hardcoded!).
    """
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.status == "completed").order_by(AnalysisRun.completed_at.desc()).first()
    
    if not latest_run:
        return MissionStatusResponse(
            system_online=True,
            ai_engine_online=True,
            database_online=True,
            data_stream_active=False,
            mission_health_score=100.0,
            summary=AnalysisSummary(
                total_components=0,
                safe=0,
                monitor=0,
                reject=0,
                anomalies=0
            ),
            active_analysis_id=None,
            active_dataset_id=None,
            critical_components=[],
            last_updated=utc_now().isoformat()
        )

    results = db.query(AnalysisResult).filter(AnalysisResult.analysis_run_id == latest_run.id).all()
    
    critical_comps = [
        ComponentResultSchema(
            component_id=r.component_id,
            subsystem=r.subsystem,
            lot_id=r.lot_id,
            parameter=r.parameter,
            current_value=r.current_value,
            datasheet_limit=r.datasheet_limit,
            anomaly_score=r.anomaly_score,
            lot_relative_score=r.lot_relative_score,
            drift_rate=r.drift_rate,
            predicted_value=r.predicted_value,
            risk_score=r.risk_score,
            decision=r.decision,
            explanation=r.explanation,
            physical_model_id=r.physical_model_id,
            prediction_confidence=r.prediction_confidence
        )
        for r in results if r.decision == "REJECT"
    ]

    total = latest_run.total_components or len(results)
    safe = latest_run.safe_count or len([r for r in results if r.decision == "SAFE"])
    monitor = latest_run.monitor_count or len([r for r in results if r.decision == "MONITOR"])
    reject = latest_run.reject_count or len(critical_comps)

    # Dynamic Mission Health Formula:
    # Starts at 100%, penalized by average risk and weighted reject/monitor counts
    if total > 0:
        avg_risk = sum(r.risk_score for r in results) / total
        health = max(0.0, 100.0 - (avg_risk * 0.5) - (reject * 4.0) - (monitor * 1.0))
    else:
        health = 100.0

    return MissionStatusResponse(
        system_online=True,
        ai_engine_online=True,
        database_online=True,
        data_stream_active=True,
        mission_health_score=round(health, 1),
        summary=AnalysisSummary(
            total_components=total,
            safe=safe,
            monitor=monitor,
            reject=reject,
            anomalies=reject
        ),
        active_analysis_id=latest_run.id,
        active_dataset_id=latest_run.dataset_id,
        critical_components=critical_comps,
        last_updated=utc_now().isoformat()
    )

@router.get("/datasets")
def list_datasets(db: Session = Depends(get_db)):
    """Lists all uploaded datasets."""
    datasets = db.query(Dataset).order_by(Dataset.upload_timestamp.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "upload_timestamp": d.upload_timestamp.isoformat() if d.upload_timestamp else None,
            "row_count": d.row_count,
            "valid_rows": d.valid_rows,
            "missing_rows": d.missing_rows,
            "quality_score": d.quality_score,
            "status": d.status
        }
        for d in datasets
    ]

@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieves a single dataset record."""
    d = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {
        "id": d.id,
        "filename": d.filename,
        "file_type": d.file_type,
        "upload_timestamp": d.upload_timestamp.isoformat() if d.upload_timestamp else None,
        "row_count": d.row_count,
        "valid_rows": d.valid_rows,
        "missing_rows": d.missing_rows,
        "quality_score": d.quality_score,
        "status": d.status
    }
