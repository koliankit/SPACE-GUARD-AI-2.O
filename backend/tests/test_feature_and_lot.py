import os
import sys
from pathlib import Path

# Ensure project root is in sys.path when running this script directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
import pandas as pd
import numpy as np
from backend.app.services.ml.feature_engineering import engineer_component_features
from backend.app.services.ml.lot_analysis import compute_lot_relative_metrics


def test_feature_engineering_deltas_and_slope():
    df = pd.DataFrame([
        {"component_id": "COMP-FC-01", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "0h", "value": 20.0, "datasheet_limit": 50.0},
        {"component_id": "COMP-FC-01", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "24h", "value": 21.0, "datasheet_limit": 50.0},
        {"component_id": "COMP-FC-01", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "96h", "value": 22.0, "datasheet_limit": 50.0},
        {"component_id": "COMP-FC-01", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "168h", "value": 24.0, "datasheet_limit": 50.0},
    ])
    feat_df = engineer_component_features(df)
    assert len(feat_df) == 1
    row = feat_df.iloc[0]
    assert row["baseline_value"] == 20.0
    assert row["current_value"] == 24.0
    assert row["delta_0h"] == 4.0
    assert row["pct_change"] == 20.0
    assert row["drift_rate"] > 0.0
    assert row["datasheet_utilization"] == (24.0 / 50.0) * 100.0

def test_lot_relative_analysis_outlier_detection():
    # 3 normal components in LOT-12, and 1 latent outlier COMP-FC-03
    rows = []
    # Normals around 20.0 - 21.2
    normal_data = [
        ("COMP-FC-01", 20.1, 21.2),
        ("COMP-FC-02", 19.8, 20.9),
        ("COMP-FC-04", 20.5, 21.5),
        ("COMP-FC-05", 19.5, 20.6),
    ]
    for c, v0, v168 in normal_data:
        rows.append({"component_id": c, "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "0h", "value": v0, "datasheet_limit": 50.0})
        rows.append({"component_id": c, "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "168h", "value": v168, "datasheet_limit": 50.0})

    # Outlier at 38.4
    rows.append({"component_id": "COMP-FC-03", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "0h", "value": 22.4, "datasheet_limit": 50.0})
    rows.append({"component_id": "COMP-FC-03", "subsystem": "Flight Computer", "lot_id": "LOT-12", "parameter": "Leakage", "stage": "168h", "value": 38.4, "datasheet_limit": 50.0})

    df = pd.DataFrame(rows)
    feat_df = engineer_component_features(df)
    lot_df = compute_lot_relative_metrics(feat_df)

    # Find COMP-FC-03
    fc03 = lot_df[lot_df["component_id"] == "COMP-FC-03"].iloc[0]
    assert fc03["lot_robust_zscore"] > 3.0  # Significant lot outlier!
    assert fc03["current_value"] < 50.0    # But within datasheet limit!


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print(" >>> RUNNING TEST: backend/tests/test_feature_and_lot.py")
    print("=" * 70 + "\n")
    sys.exit(pytest.main([__file__, "-v", "-s"]))


