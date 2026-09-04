import uuid
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db, utc_now
from backend.app.models.dataset import Dataset
from backend.app.models.measurement import Measurement
from backend.app.models.component import Component
from backend.app.models.analysis import AnalysisRun, AnalysisResult
from backend.app.schemas.analysis import (
    AnalysisStartRequest, 
    AnalysisResponse, 
    AnalysisSummary, 
    ComponentResultSchema
)
from backend.app.services.ml.feature_engineering import engineer_component_features
from backend.app.services.ml.lot_analysis import compute_lot_relative_metrics
from backend.app.services.ml.anomaly_detector import SpacecraftAnomalyDetector
from backend.app.services.ml.drift_predictor import predict_component_drift
from backend.app.services.ml.risk_engine import compute_component_risk_score
from backend.app.services.ml.decision_engine import evaluate_screening_decision
from backend.app.services.ml.satellite_mapper import resolve_component_mapping
from backend.app.services.audit_service import log_audit_event
from backend.app.config import settings

router = APIRouter(prefix="", tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
def run_screening_analysis(
    payload: AnalysisStartRequest,
    db: Session = Depends(get_db)
):
    """
    Executes the complete end-to-end ML screening pipeline on a dataset:
    Ingestion -> Feature Engineering -> Lot Analysis -> Anomaly Detection ->
    Drift Prediction -> Risk Scoring -> Decision Engine -> 3D Mapping.
    """
    dataset = db.query(Dataset).filter(Dataset.id == payload.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    measurements = db.query(Measurement).filter(Measurement.dataset_id == payload.dataset_id).all()
    if not measurements:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No measurements found in this dataset to analyze."
        )

    # 1. Initialize Analysis Run record
    analysis_run_id = str(uuid.uuid4())
    analysis_run = AnalysisRun(
        id=analysis_run_id,
        dataset_id=dataset.id,
        status="running",
        started_at=utc_now(),
        model_version="v1.0.0-isoforest-lotrobust"
    )
    db.add(analysis_run)
    db.commit()

    # Log start audit event
    log_audit_event(db, analysis_run_id, "Analysis run initialized", {"dataset_id": dataset.id, "filename": dataset.filename})

    # 2. Build DataFrame from persistent database records
    data_records = []
    # Cache component subsystems
    comp_subsystem_map = {c.component_id: c.subsystem for c in db.query(Component).all()}

    for m in measurements:
        subsys = comp_subsystem_map.get(m.component_id, "Flight Computer")
        data_records.append({
            "component_id": m.component_id,
            "subsystem": subsys,
            "lot_id": m.lot_id,
            "parameter": m.parameter,
            "stage": m.stage,
            "value": m.value,
            "datasheet_limit": m.datasheet_limit
        })
    df_raw = pd.DataFrame(data_records)

    log_audit_event(
        db, analysis_run_id, 
        f"Ingested {len(df_raw)} measurements across {df_raw['component_id'].nunique()} components",
        {"component_count": int(df_raw['component_id'].nunique())}
    )

    # 3. Feature Engineering
    features_df = engineer_component_features(df_raw)
    log_audit_event(db, analysis_run_id, "Feature extraction and drift kinetics computed")

    # 4. Lot-Relative Statistical Analysis
    lot_df = compute_lot_relative_metrics(features_df)
    log_audit_event(
        db, analysis_run_id, 
        f"Lot-relative baseline comparison completed across {lot_df['lot_id'].nunique()} production lots"
    )

    # 5. Anomaly Detection (Isolation Forest + Statistical)
    detector = SpacecraftAnomalyDetector(random_state=42)
    analyzed_df = detector.fit_predict(lot_df)
    log_audit_event(db, analysis_run_id, "Isolation Forest and multi-criteria anomaly detection finished")

    # 6. Drift Prediction, Risk Engine, Decision Engine
    results_list = []
    safe_count = 0
    monitor_count = 0
    reject_count = 0
    anomaly_count = 0

    for _, row in analyzed_df.iterrows():
        comp_id = row["component_id"]
        param = row["parameter"]
        lot_id = row["lot_id"]
        subsys = row["subsystem"]
        c_val = float(row["current_value"])
        limit = float(row["datasheet_limit"])
        anom_score = float(row["anomaly_score"])
        lot_z = float(row["lot_robust_zscore"])
        lot_mean = float(row["lot_mean"])
        d_rate = float(row["drift_rate"])
        d_accel = float(row.get("drift_acceleration", 0.0))
        util = float(row["datasheet_utilization"])

        # Fetch component measurement series for regression
        comp_series = [
            {"stage": r["stage"], "value": r["value"]}
            for r in data_records 
            if r["component_id"] == comp_id and r["parameter"] == param
        ]
        
        # Predict future trajectory at 250h
        pred_result = predict_component_drift(
            comp_series, 
            datasheet_limit=limit, 
            horizon_hours=settings.PREDICTION_HORIZON_HOURS
        )
        pred_val = pred_result["predicted_value"]
        pred_conf = pred_result["prediction_confidence"]

        # Risk Score Calculation (0 - 100)
        risk_data = compute_component_risk_score(
            anomaly_score=anom_score,
            lot_robust_zscore=lot_z,
            drift_rate=d_rate,
            drift_acceleration=d_accel,
            datasheet_utilization=util,
            predicted_value=pred_val,
            datasheet_limit=limit,
            data_quality_score=dataset.quality_score or 100.0
        )
        risk_score = risk_data["risk_score"]

        # Decision Evaluation
        decision_data = evaluate_screening_decision(
            risk_score=risk_score,
            current_value=c_val,
            datasheet_limit=limit,
            predicted_value=pred_val,
            lot_robust_zscore=lot_z,
            lot_mean=lot_mean,
            drift_rate=d_rate,
            parameter=param,
            lot_id=lot_id
        )
        decision = decision_data["decision"]
        explanation = decision_data["explanation"]

        # Resolve 3D Physical Model ID
        mapping = resolve_component_mapping(comp_id, subsys)
        phys_model_id = mapping["physical_model_id"]

        # Tally summary
        if decision == "SAFE":
            safe_count += 1
        elif decision == "MONITOR":
            monitor_count += 1
        elif decision == "REJECT":
            reject_count += 1
            anomaly_count += 1
            log_audit_event(
                db, analysis_run_id,
                f"{comp_id} flagged as REJECT (Risk {risk_score:.0f}, {lot_z:+.1f}σ vs lot)",
                {"component_id": comp_id, "risk_score": risk_score, "decision": decision}
            )

        # Store in DB
        db_res = AnalysisResult(
            analysis_run_id=analysis_run_id,
            component_id=comp_id,
            subsystem=subsys,
            lot_id=lot_id,
            parameter=param,
            current_value=c_val,
            datasheet_limit=limit,
            anomaly_score=anom_score,
            lot_relative_score=round(lot_z, 2),
            drift_rate=round(d_rate, 4),
            predicted_value=pred_val,
            risk_score=risk_score,
            decision=decision,
            explanation=explanation,
            physical_model_id=phys_model_id,
            prediction_confidence=pred_conf
        )
        db.add(db_res)

        results_list.append(ComponentResultSchema(
            component_id=comp_id,
            subsystem=subsys,
            lot_id=lot_id,
            parameter=param,
            current_value=c_val,
            datasheet_limit=limit,
            anomaly_score=anom_score,
            lot_relative_score=round(lot_z, 2),
            drift_rate=round(d_rate, 4),
            predicted_value=pred_val,
            risk_score=risk_score,
            decision=decision,
            explanation=explanation,
            physical_model_id=phys_model_id,
            prediction_confidence=pred_conf
        ))

    # 7. Finalize Analysis Run in DB
    total_comps = len(results_list)
    analysis_run.status = "completed"
    analysis_run.completed_at = utc_now()
    analysis_run.total_components = total_comps
    analysis_run.safe_count = safe_count
    analysis_run.monitor_count = monitor_count
    analysis_run.reject_count = reject_count
    analysis_run.anomaly_count = anomaly_count
    db.commit()

    log_audit_event(
        db, analysis_run_id,
        f"Screening analysis complete: {safe_count} SAFE, {monitor_count} MONITOR, {reject_count} REJECT",
        {"safe": safe_count, "monitor": monitor_count, "reject": reject_count}
    )

    summary = AnalysisSummary(
        total_components=total_comps,
        safe=safe_count,
        monitor=monitor_count,
        reject=reject_count,
        anomalies=reject_count
    )

    return AnalysisResponse(
        analysis_id=analysis_run_id,
        status="completed",
        dataset_id=dataset.id,
        summary=summary,
        results=results_list,
        model_version=analysis_run.model_version,
        started_at=analysis_run.started_at.isoformat(),
        completed_at=analysis_run.completed_at.isoformat()
    )

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(analysis_id: str, db: Session = Depends(get_db)):
    """Retrieves an existing analysis run and its component results from the database."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found.")

    results = db.query(AnalysisResult).filter(AnalysisResult.analysis_run_id == analysis_id).all()
    
    comp_schemas = [
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
        for r in results
    ]

    summary = AnalysisSummary(
        total_components=run.total_components or len(comp_schemas),
        safe=run.safe_count or len([c for c in comp_schemas if c.decision == "SAFE"]),
        monitor=run.monitor_count or len([c for c in comp_schemas if c.decision == "MONITOR"]),
        reject=run.reject_count or len([c for c in comp_schemas if c.decision == "REJECT"]),
        anomalies=run.anomaly_count or len([c for c in comp_schemas if c.decision == "REJECT"])
    )

    return AnalysisResponse(
        analysis_id=run.id,
        status=run.status,
        dataset_id=run.dataset_id,
        summary=summary,
        results=comp_schemas,
        model_version=run.model_version,
        started_at=run.started_at.isoformat() if run.started_at else None,
        completed_at=run.completed_at.isoformat() if run.completed_at else None
    )
