import re
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

def parse_stage_hours(stage_str: str) -> float:
    """Parses '0h', '24h', '96h', '168h' to float hours (0.0, 24.0, etc.)."""
    match = re.search(r"(\d+(\.\d+)?)", str(stage_str))
    if match:
        return float(match.group(1))
    return 0.0

def engineer_component_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes component-level time-series and drift features across burn-in stages.
    Inputs: canonical DataFrame with [component_id, subsystem, lot_id, parameter, stage, value, datasheet_limit]
    Returns: DataFrame indexed by (component_id, parameter) with rich engineered features.
    """
    df = df.copy()
    df["stage_hours"] = df["stage"].apply(parse_stage_hours)
    
    # Sort chronologically by component, parameter, and stage_hours
    df = df.sort_values(by=["component_id", "parameter", "stage_hours"])

    records = []
    
    for (comp_id, param), group in df.groupby(["component_id", "parameter"]):
        subsystem = group["subsystem"].iloc[0]
        lot_id = group["lot_id"].iloc[0]
        limit = group["datasheet_limit"].iloc[0]
        
        stages = group["stage_hours"].values
        values = group["value"].values
        
        # 1. Baseline value (stage = 0h, or earliest available stage)
        baseline_val = values[0]
        current_val = values[-1]  # Latest stage measurement (e.g. 168h)
        current_stage = group["stage"].iloc[-1]
        
        # 2. Delta from baseline (0h)
        delta_0h = float(current_val - baseline_val)
        
        # 3. Percentage change from baseline
        if abs(baseline_val) > 1e-9:
            pct_change = float((current_val - baseline_val) / baseline_val * 100.0)
        else:
            pct_change = 0.0
            
        # 4. Stage-to-stage deltas & drift slope (Rate of change per hour)
        if len(stages) >= 2 and (stages[-1] - stages[0]) > 0:
            # Linear regression slope: value / hour
            # m = sum((x - x_mean)*(y - y_mean)) / sum((x - x_mean)^2)
            x_mean = np.mean(stages)
            y_mean = np.mean(values)
            denom = np.sum((stages - x_mean) ** 2)
            if denom > 1e-9:
                drift_rate = float(np.sum((stages - x_mean) * (values - y_mean)) / denom)
            else:
                drift_rate = float((current_val - baseline_val) / (stages[-1] - stages[0]))
        else:
            drift_rate = 0.0
            
        # 5. Drift acceleration (comparing early slope vs late slope)
        drift_acceleration = 0.0
        if len(stages) >= 4:
            # Early slope: stage 0 to 24
            early_dx = stages[1] - stages[0]
            early_slope = (values[1] - values[0]) / early_dx if early_dx > 0 else 0.0
            # Late slope: stage 96 to 168
            late_dx = stages[-1] - stages[-2]
            late_slope = (values[-1] - values[-2]) / late_dx if late_dx > 0 else 0.0
            drift_acceleration = float(late_slope - early_slope)
            
        # 6. Datasheet Utilization (%)
        if abs(limit) > 1e-9:
            datasheet_utilization = float((current_val / limit) * 100.0)
        else:
            datasheet_utilization = 0.0
            
        # 7. Count of observations
        obs_count = len(values)

        records.append({
            "component_id": comp_id,
            "subsystem": subsystem,
            "lot_id": lot_id,
            "parameter": param,
            "datasheet_limit": limit,
            "baseline_value": baseline_val,
            "current_value": current_val,
            "current_stage": current_stage,
            "delta_0h": delta_0h,
            "pct_change": pct_change,
            "drift_rate": drift_rate,
            "drift_acceleration": drift_acceleration,
            "datasheet_utilization": datasheet_utilization,
            "obs_count": obs_count
        })

    return pd.DataFrame(records)
