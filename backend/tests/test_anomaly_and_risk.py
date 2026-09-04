import os
import sys
from pathlib import Path

# Ensure project root is in sys.path when running this script directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
import pandas as pd
from backend.app.services.ml.feature_engineering import engineer_component_features
from backend.app.services.ml.lot_analysis import compute_lot_relative_metrics
from backend.app.services.ml.anomaly_detector import SpacecraftAnomalyDetector
from backend.app.services.ml.drift_predictor import predict_component_drift
from backend.app.services.ml.risk_engine import compute_component_risk_score
from backend.app.services.ml.decision_engine import evaluate_screening_decision
from backend.app.services.ml.satellite_mapper import resolve_component_mapping


def test_anomaly_detection_reproducibility():
    # Setup dataset
    rows = []
    for c in ["COMP-FC-01", "COMP-FC-02", "COMP-FC-04", "COMP-FC-05"]:
        rows.extend([
            {"component_id": c, "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "0h", "value": 20.0, "datasheet_limit": 50.0},
            {"component_id": c, "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "168h", "value": 20.5, "datasheet_limit": 50.0}
        ])
    rows.extend([
        {"component_id": "COMP-FC-03", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "0h", "value": 22.0, "datasheet_limit": 50.0},
        {"component_id": "COMP-FC-03", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "168h", "value": 38.4, "datasheet_limit": 50.0}
    ])
    df = pd.DataFrame(rows)
    feat_df = engineer_component_features(df)
    lot_df = compute_lot_relative_metrics(feat_df)

    detector1 = SpacecraftAnomalyDetector(random_state=42)
    res1 = detector1.fit_predict(lot_df)

    detector2 = SpacecraftAnomalyDetector(random_state=42)
    res2 = detector2.fit_predict(lot_df)

    # Scores must be 100% reproducible
    assert list(res1["anomaly_score"]) == list(res2["anomaly_score"])
    
    # COMP-FC-03 should have the highest anomaly score
    fc03_score = res1[res1["component_id"] == "COMP-FC-03"]["anomaly_score"].iloc[0]
    fc01_score = res1[res1["component_id"] == "COMP-FC-01"]["anomaly_score"].iloc[0]
    assert fc03_score > fc01_score

def test_drift_predictor_and_insufficient_data():
    # 4 points
    points = [{"stage": "0h", "value": 20.0}, {"stage": "24h", "value": 22.0}, {"stage": "96h", "value": 30.0}, {"stage": "168h", "value": 38.0}]
    pred = predict_component_drift(points, datasheet_limit=50.0, horizon_hours=250.0)
    assert pred["predicted_value"] is not None
    assert pred["predicted_value"] > 38.0
    assert pred["prediction_confidence"] != "Insufficient Data"

    # Only 1 point -> insufficient data
    pred_sparse = predict_component_drift([{"stage": "0h", "value": 20.0}], datasheet_limit=50.0)
    assert pred_sparse["predicted_value"] is None
    assert "Insufficient data" in pred_sparse["message"]

def test_risk_and_decision_engine_latent_anomaly():
    # COMP-FC-03 at 38.4 µA (datasheet limit 50.0 µA), lot_z = 3.4, predicted value = 54.8 µA
    risk_info = compute_component_risk_score(
        anomaly_score=0.85,
        lot_robust_zscore=3.4,
        drift_rate=0.10,
        drift_acceleration=0.01,
        datasheet_utilization=(38.4 / 50.0) * 100.0,
        predicted_value=54.8,
        datasheet_limit=50.0
    )
    assert risk_info["risk_score"] >= 70.0

    dec_info = evaluate_screening_decision(
        risk_score=risk_info["risk_score"],
        current_value=38.4,
        datasheet_limit=50.0,
        predicted_value=54.8,
        lot_robust_zscore=3.4,
        lot_mean=21.0,
        drift_rate=0.10,
        parameter="Leakage Current",
        lot_id="LOT-12"
    )
    assert dec_info["decision"] == "REJECT"
    assert dec_info["traditional_decision"] == "PASS"
    assert dec_info["within_limit_not_healthy"] is True

def test_component_to_3d_mapping():
    mapping = resolve_component_mapping("COMP-FC-03", "Flight Computer")
    assert mapping["physical_model_id"] == "flightComputer"
    assert len(mapping["position"]) == 3
    assert mapping["subsystem"] == "Flight Computer"


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print(" >>> RUNNING TEST: backend/tests/test_anomaly_and_risk.py")
    print("=" * 70 + "\n")
    sys.exit(pytest.main([__file__, "-v", "-s"]))

