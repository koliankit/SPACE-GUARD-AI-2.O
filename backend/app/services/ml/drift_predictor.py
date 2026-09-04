import re
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sklearn.linear_model import HuberRegressor, LinearRegression

def parse_stage_hours(stage_str: str) -> float:
    match = re.search(r"(\d+(\.\d+)?)", str(stage_str))
    return float(match.group(1)) if match else 0.0

def predict_component_drift(
    comp_measurements: List[Dict[str, Any]], 
    datasheet_limit: float,
    horizon_hours: float = 250.0
) -> Dict[str, Any]:
    """
    Predicts future component parameter trajectory using regression over burn-in stages.
    Inputs:
        comp_measurements: list of {'stage': str, 'value': float}
        datasheet_limit: float
        horizon_hours: target mission/operational hour for extrapolation (default 250.0h)
    Returns:
        Dict with predicted_value, drift_rate, confidence, time_to_limit, message
    """
    valid_points = []
    for m in comp_measurements:
        val = m.get("value")
        if val is not None and not np.isnan(val):
            valid_points.append((parse_stage_hours(m.get("stage", "0")), float(val)))
            
    # Sort chronologically by stage hour
    valid_points = sorted(valid_points, key=lambda x: x[0])
    
    # Check data sufficiency
    if len(valid_points) < 2:
        return {
            "predicted_value": None,
            "drift_rate": 0.0,
            "prediction_horizon_hours": horizon_hours,
            "datasheet_limit": datasheet_limit,
            "time_to_limit_hours": None,
            "prediction_confidence": "Insufficient Data",
            "message": "Insufficient data for reliable prediction."
        }

    X = np.array([p[0] for p in valid_points]).reshape(-1, 1)
    y = np.array([p[1] for p in valid_points])
    
    # Fit regression model
    # If 4 or more points, use robust HuberRegressor to minimize outlier distortion
    if len(valid_points) >= 4:
        try:
            model = HuberRegressor(epsilon=1.35)
            model.fit(X, y)
            slope = float(model.coef_[0])
            intercept = float(model.intercept_)
            confidence = "High (Robust Regression)"
        except Exception:
            model = LinearRegression()
            model.fit(X, y)
            slope = float(model.coef_[0])
            intercept = float(model.intercept_)
            confidence = "Medium (Linear Fit)"
    else:
        model = LinearRegression()
        model.fit(X, y)
        slope = float(model.coef_[0])
        intercept = float(model.intercept_)
        confidence = "Moderate (2-3 Data Points)"

    # Predict value at horizon_hours (e.g. 250h)
    predicted_val = float(slope * horizon_hours + intercept)
    
    # Calculate time to datasheet crossing (if positive drift towards limit)
    time_to_limit = None
    latest_val = y[-1]
    if slope > 1e-5 and datasheet_limit > latest_val:
        # hours = (limit - intercept) / slope
        time_to_limit = float((datasheet_limit - intercept) / slope)
    elif latest_val >= datasheet_limit:
        time_to_limit = 0.0

    return {
        "predicted_value": round(predicted_val, 2),
        "drift_rate": round(slope, 4),
        "prediction_horizon_hours": horizon_hours,
        "datasheet_limit": datasheet_limit,
        "time_to_limit_hours": round(time_to_limit, 1) if time_to_limit is not None else None,
        "prediction_confidence": confidence,
        "message": f"Projected value of {predicted_val:.2f} at {horizon_hours:.0f}h" + (
            f" (crosses {datasheet_limit:.1f} limit at {time_to_limit:.0f}h)" if time_to_limit and time_to_limit < 1000 else ""
        )
    }
