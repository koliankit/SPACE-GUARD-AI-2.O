from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.component import Component
from backend.app.models.measurement import Measurement
from backend.app.models.analysis import AnalysisResult, AnalysisRun
from backend.app.schemas.component import (
    ComponentSummary, 
    ComponentDetail, 
    StageMeasurement,
    PredictionResponse
)
from backend.app.schemas.analysis import ComponentResultSchema
from backend.app.services.ml.drift_predictor import predict_component_drift
from backend.app.config import settings

router = APIRouter(prefix="", tags=["Components"])

@router.get("/components", response_model=List[ComponentSummary])
def list_components(
    decision: Optional[str] = Query(None, description="Filter by decision: SAFE, MONITOR, REJECT"),
    subsystem: Optional[str] = Query(None, description="Filter by subsystem"),
    search: Optional[str] = Query(None, description="Search by component_id or lot_id"),
    db: Session = Depends(get_db)
):
    """Lists components with current reliability screening status, risk, and 3D physical model ID."""
    query = db.query(Component)
    if subsystem:
        query = query.filter(Component.subsystem.ilike(f"%{subsystem}%"))
    if search:
        query = query.filter(
            (Component.component_id.ilike(f"%{search}%")) |
            (Component.lot_id.ilike(f"%{search}%"))
        )
    comps = query.all()

    # Get latest analysis results
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.status == "completed").order_by(AnalysisRun.completed_at.desc()).first()
    res_map = {}
    if latest_run:
        results = db.query(AnalysisResult).filter(AnalysisResult.analysis_run_id == latest_run.id).all()
        for r in results:
            res_map[r.component_id] = r

    summaries = []
    for c in comps:
        r = res_map.get(c.component_id)
        c_decision = r.decision if r else "SAFE"
        c_risk = r.risk_score if r else 10.0
        c_anom = r.anomaly_score if r else 0.05
        param = r.parameter if r else "Standard Parameter"
        c_val = r.current_value if r else 20.0
        limit = r.datasheet_limit if r else 50.0

        if decision and c_decision.upper() != decision.upper():
            continue

        summaries.append(ComponentSummary(
            component_id=c.component_id,
            subsystem=c.subsystem,
            lot_id=c.lot_id,
            risk_score=c_risk,
            decision=c_decision,
            anomaly_score=c_anom,
            physical_model_id=c.physical_model_id,
            parameter=param,
            current_value=c_val,
            datasheet_limit=limit
        ))

    return summaries

@router.get("/components/{component_id}", response_model=ComponentDetail)
def get_component_detail(component_id: str, db: Session = Depends(get_db)):
    """Retrieves component spatial coordinates, burn-in measurement history, and latest screening intelligence."""
    comp = db.query(Component).filter(Component.component_id == component_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Component not found.")

    measurements = db.query(Measurement).filter(Measurement.component_id == component_id).order_by(Measurement.stage).all()
    stage_measurements = [
        StageMeasurement(
            stage=m.stage,
            value=m.value,
            datasheet_limit=m.datasheet_limit
        )
        for m in measurements
    ]

    latest_res = db.query(AnalysisResult).filter(AnalysisResult.component_id == component_id).order_by(AnalysisResult.id.desc()).first()
    res_schema = None
    if latest_res:
        res_schema = ComponentResultSchema(
            component_id=latest_res.component_id,
            subsystem=latest_res.subsystem,
            lot_id=latest_res.lot_id,
            parameter=latest_res.parameter,
            current_value=latest_res.current_value,
            datasheet_limit=latest_res.datasheet_limit,
            anomaly_score=latest_res.anomaly_score,
            lot_relative_score=latest_res.lot_relative_score,
            drift_rate=latest_res.drift_rate,
            predicted_value=latest_res.predicted_value,
            risk_score=latest_res.risk_score,
            decision=latest_res.decision,
            explanation=latest_res.explanation,
            physical_model_id=latest_res.physical_model_id,
            prediction_confidence=latest_res.prediction_confidence
        )

    return ComponentDetail(
        component_id=comp.component_id,
        subsystem=comp.subsystem,
        lot_id=comp.lot_id,
        physical_model_id=comp.physical_model_id,
        coordinates=[comp.x, comp.y, comp.z],
        measurements=stage_measurements,
        latest_result=res_schema
    )

@router.get("/anomalies", response_model=List[ComponentSummary])
def get_anomalies(db: Session = Depends(get_db)):
    """Returns only anomalous/monitored components (decision = REJECT or MONITOR)."""
    latest_run = db.query(AnalysisRun).filter(AnalysisRun.status == "completed").order_by(AnalysisRun.completed_at.desc()).first()
    if not latest_run:
        return []

    results = db.query(AnalysisResult).filter(
        AnalysisResult.analysis_run_id == latest_run.id,
        AnalysisResult.decision.in_(["REJECT", "MONITOR"])
    ).all()

    return [
        ComponentSummary(
            component_id=r.component_id,
            subsystem=r.subsystem,
            lot_id=r.lot_id,
            risk_score=r.risk_score,
            decision=r.decision,
            anomaly_score=r.anomaly_score,
            physical_model_id=r.physical_model_id,
            parameter=r.parameter,
            current_value=r.current_value,
            datasheet_limit=r.datasheet_limit
        )
        for r in results
    ]

@router.get("/lots")
def get_lots_summary(db: Session = Depends(get_db)):
    """Returns production lots and summary counts."""
    comps = db.query(Component).all()
    lot_map = {}
    for c in comps:
        if c.lot_id not in lot_map:
            lot_map[c.lot_id] = {"lot_id": c.lot_id, "components": 0, "subsystems": set()}
        lot_map[c.lot_id]["components"] += 1
        lot_map[c.lot_id]["subsystems"].add(c.subsystem)

    return [
        {"lot_id": k, "component_count": v["components"], "subsystems": list(v["subsystems"])}
        for k, v in lot_map.items()
    ]

@router.get("/prediction/{component_id}", response_model=PredictionResponse)
def get_component_prediction(component_id: str, db: Session = Depends(get_db)):
    """Computes regression trajectory and projected future burn-in values for a specific component."""
    measurements = db.query(Measurement).filter(Measurement.component_id == component_id).all()
    if not measurements:
        raise HTTPException(status_code=404, detail="No measurements found for this component.")

    param = measurements[0].parameter
    limit = measurements[0].datasheet_limit

    data_series = [{"stage": m.stage, "value": m.value} for m in measurements]
    
    pred_res = predict_component_drift(
        data_series, 
        datasheet_limit=limit, 
        horizon_hours=settings.PREDICTION_HORIZON_HOURS
    )

    return PredictionResponse(
        component_id=component_id,
        parameter=param,
        observed_stages=data_series,
        drift_rate=pred_res["drift_rate"],
        predicted_value=pred_res["predicted_value"],
        prediction_horizon_hours=pred_res["prediction_horizon_hours"],
        datasheet_limit=limit,
        time_to_limit_hours=pred_res["time_to_limit_hours"],
        prediction_confidence=pred_res["prediction_confidence"],
        message=pred_res["message"]
    )
