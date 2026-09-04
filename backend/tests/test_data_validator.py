import os
import sys
from pathlib import Path

# Ensure project root is in sys.path when running this script directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
import pandas as pd
from backend.app.services.ml.data_validator import (
    detect_column_aliases,
    canonicalize_dataframe,
    DataValidationError
)


def test_detect_column_aliases_standard():
    headers = ["component_id", "subsystem", "lot_id", "parameter", "0h", "24h", "96h", "168h", "datasheet_limit"]
    mapped, unmapped, confidence = detect_column_aliases(headers)
    assert "component_id" in mapped
    assert "lot_id" in mapped
    assert "parameter" in mapped
    assert "stage_0h" in mapped
    assert "stage_168h" in mapped
    assert confidence > 0.80

def test_detect_column_aliases_variations():
    headers = ["part", "batch", "metric", "0h", "168h", "limit"]
    mapped, unmapped, confidence = detect_column_aliases(headers)
    assert mapped.get("component_id") == "part"
    assert mapped.get("lot_id") == "batch"
    assert mapped.get("parameter") == "metric"
    assert "stage_0h" in mapped
    assert "stage_168h" in mapped
    assert confidence > 0.80

def test_canonicalize_wide_dataframe():
    df = pd.DataFrame([
        {
            "component_id": "COMP-FC-01",
            "subsystem": "Flight Computer",
            "lot_id": "LOT-12",
            "parameter": "Leakage Current",
            "0h": 20.0,
            "24h": 21.0,
            "96h": 22.0,
            "168h": 23.0,
            "datasheet_limit": 50.0
        }
    ])
    mapped, _, _ = detect_column_aliases(list(df.columns))
    canonical_df, quality_report = canonicalize_dataframe(df, mapped)
    
    assert len(canonical_df) == 4  # 4 stages
    assert set(canonical_df["stage"].unique()) == {"0h", "24h", "96h", "168h"}
    assert quality_report.total_rows == 1
    assert quality_report.quality_score == 100.0

def test_canonicalize_missing_data_quality():
    df = pd.DataFrame([
        {
            "component_id": "COMP-FC-01",
            "subsystem": "Flight Computer",
            "lot_id": "LOT-12",
            "parameter": "Leakage Current",
            "0h": 20.0,
            "24h": None,
            "96h": None,
            "168h": 23.0,
            "datasheet_limit": 50.0
        }
    ])
    mapped, _, _ = detect_column_aliases(list(df.columns))
    canonical_df, quality_report = canonicalize_dataframe(df, mapped)
    
    assert len(canonical_df) == 2
    assert quality_report.missing_rows == 2
    assert quality_report.quality_score < 100.0


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print(" >>> RUNNING TEST: backend/tests/test_data_validator.py")
    print("=" * 70 + "\n")
    sys.exit(pytest.main([__file__, "-v", "-s"]))

