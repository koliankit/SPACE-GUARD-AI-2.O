import numpy as np
import pandas as pd
from typing import Dict, Any

def compute_component_risk_score(
    anomaly_score: float,
    lot_robust_zscore: float,
    drift_rate: float,
    drift_acceleration: float,
    datasheet_utilization: float,
    predicted_value: float,
    datasheet_limit: float,
    data_quality_score: float = 100.0
) -> Dict[str, Any]:
    """
    Computes deterministic aerospace reliability risk score [0.0 - 100.0].
    
    Weights:
    1. Anomaly Severity (30%): from Isolation Forest + statistical score [0 - 100]
    2. Lot Deviation (25%): robust z-score magnitude vs peer lot components
    3. Drift Kinetics (20%): drift slope & acceleration per hour
    4. Datasheet Proximity & Future Limit Breach (25%): current utilization + predicted breach
    
    Data quality multiplier applies a slight uncertainty risk adjustment.
    """
    # 1. Anomaly Severity sub-score (0 - 100)
    s_anomaly = min(100.0, anomaly_score * 100.0)

    # 2. Lot Deviation sub-score (0 - 100)
    # A z-score of 3.0+ represents extreme lot divergence
    abs_z = abs(lot_robust_zscore)
    s_lot = min(100.0, (abs_z / 3.0) * 100.0)

    # 3. Drift Kinetics sub-score (0 - 100)
    # A drift rate >= 0.10 unit/hour is significant in burn-in
    abs_drift = abs(drift_rate)
    s_drift = min(100.0, (abs_drift / 0.10) * 80.0 + min(20.0, abs(drift_acceleration) * 200.0))

    # 4. Datasheet Proximity & Future Crossing (0 - 100)
    s_proximity = min(100.0, datasheet_utilization)
    
    # Check if predicted future value crosses datasheet limit
    limit_breach_penalty = 0.0
    if predicted_value is not None and datasheet_limit > 0:
        if predicted_value >= datasheet_limit:
            limit_breach_penalty = 35.0  # Heavy penalty for future limit breach
        elif (predicted_value / datasheet_limit) > 0.90:
            limit_breach_penalty = 20.0

    s_proximity_combined = min(100.0, s_proximity * 0.65 + limit_breach_penalty)

    # Weighted Composite Score
    raw_risk = (
        0.30 * s_anomaly +
        0.25 * s_lot +
        0.20 * s_drift +
        0.25 * s_proximity_combined
    )

    # Apply data quality penalty if data quality is degraded
    if data_quality_score < 70.0:
        raw_risk += (70.0 - data_quality_score) * 0.2

    final_risk = round(float(np.clip(raw_risk, 0.0, 100.0)), 1)

    return {
        "risk_score": final_risk,
        "breakdown": {
            "anomaly_component": round(s_anomaly, 1),
            "lot_component": round(s_lot, 1),
            "drift_component": round(s_drift, 1),
            "proximity_component": round(s_proximity_combined, 1)
        }
    }
