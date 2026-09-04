import io
import re
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from backend.app.schemas.upload import DataQualityReport, ColumnMappingPreview

# Standard column aliases map
ALIAS_MAP = {
    "component_id": [
        "component_id", "component", "part_id", "part", "device_id", 
        "comp_id", "componentid", "partid", "device"
    ],
    "subsystem": [
        "subsystem", "sub_system", "system", "unit", "module", "assembly"
    ],
    "lot_id": [
        "lot_id", "lot", "batch", "batch_id", "lot_num", "lotid", "batchid"
    ],
    "parameter": [
        "parameter", "parameter_name", "measurement_type", "metric", 
        "param", "test_parameter", "metric_name"
    ],
    "value": [
        "value", "measurement", "reading", "val", "data", "measured_value"
    ],
    "stage": [
        "stage", "burn_in_stage", "burnin_stage", "hour", "hours", 
        "time_stage", "test_stage", "timepoint"
    ],
    "datasheet_limit": [
        "datasheet_limit", "limit", "max_limit", "spec_limit", 
        "max_spec", "datasheet_max", "upper_limit", "threshold"
    ],
}

STAGE_PATTERNS = [
    r"^0\s*h(ours?)?$",
    r"^24\s*h(ours?)?$",
    r"^96\s*h(ours?)?$",
    r"^168\s*h(ours?)?$",
    r"^(\d+)\s*h(ours?)?$",
]

class DataValidationError(Exception):
    def __init__(self, message: str, issues: List[str] = None):
        super().__init__(message)
        self.message = message
        self.issues = issues or []

def detect_column_aliases(headers: List[str]) -> Tuple[Dict[str, str], List[str], float]:
    """
    Intelligently detects column aliases from raw CSV/XLSX headers.
    Returns: (mapped_columns: {standard_name: raw_header}, unmapped_headers, confidence)
    """
    mapped: Dict[str, str] = {}
    used_headers = set()

    clean_headers = {h: re.sub(r"[_\s\-]+", "_", h.strip().lower()) for h in headers}

    for std_field, aliases in ALIAS_MAP.items():
        for raw_h, clean_h in clean_headers.items():
            if raw_h in used_headers:
                continue
            if clean_h in aliases or any(clean_h.startswith(a) or clean_h.endswith(a) for a in aliases):
                mapped[std_field] = raw_h
                used_headers.add(raw_h)
                break

    # Check for wide-format stage columns (e.g., '0h', '24h', '96h', '168h')
    stage_cols = []
    for raw_h in headers:
        if raw_h in used_headers:
            continue
        clean_h = raw_h.strip().lower()
        if any(re.match(p, clean_h) for p in STAGE_PATTERNS):
            stage_cols.append(raw_h)
            mapped[f"stage_{clean_h}"] = raw_h
            used_headers.add(raw_h)

    unmapped = [h for h in headers if h not in used_headers]
    
    # Calculate confidence
    essential_fields = ["component_id", "lot_id", "parameter"]
    has_essentials = all(f in mapped for f in essential_fields)
    has_values = ("value" in mapped and "stage" in mapped) or len(stage_cols) >= 2
    
    if has_essentials and has_values:
        confidence = 0.95
    elif has_essentials:
        confidence = 0.65
    else:
        confidence = 0.30

    return mapped, unmapped, confidence

def parse_file_to_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parses uploaded CSV or Excel bytes into a Pandas DataFrame."""
    if not file_bytes:
        raise DataValidationError("Uploaded file is empty (0 bytes).")
    
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(file_bytes))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            raise DataValidationError("Unsupported file extension. Only .csv and .xlsx are supported.")
    except Exception as e:
        if isinstance(e, DataValidationError):
            raise e
        raise DataValidationError(f"Failed to parse file: {str(e)}")

    if df.empty or len(df.columns) == 0:
        raise DataValidationError("Dataset is empty. No rows or columns found.")

    return df

def canonicalize_dataframe(df: pd.DataFrame, mapping: Dict[str, str]) -> Tuple[pd.DataFrame, DataQualityReport]:
    """
    Transforms wide or long format into canonical format:
    Columns: [component_id, subsystem, lot_id, parameter, stage, value, datasheet_limit]
    """
    total_raw_rows = len(df)
    issues: List[str] = []
    
    # Invert mapping to find standard fields
    inv_map = {v: k for k, v in mapping.items()}
    df_renamed = df.rename(columns=inv_map)

    # Check if wide format
    stage_cols = [c for c in df_renamed.columns if str(c).startswith("stage_") or re.match(r"^\d+h$", str(c).lower())]
    
    canonical_rows = []
    
    if stage_cols:
        # Wide format: component_id | lot_id | parameter | 0h | 24h | 96h | 168h | limit
        for _, row in df_renamed.iterrows():
            comp_id = str(row.get("component_id", "")).strip()
            subsystem = str(row.get("subsystem", "")).strip() or "Flight Computer"
            lot_id = str(row.get("lot_id", "")).strip()
            param = str(row.get("parameter", "")).strip()
            
            raw_limit = row.get("datasheet_limit", None)
            try:
                limit = float(raw_limit) if pd.notna(raw_limit) else 50.0
            except (ValueError, TypeError):
                limit = 50.0
                issues.append(f"Invalid datasheet limit for {comp_id}; defaulted to 50.0")

            if not comp_id or comp_id.lower() == "nan":
                continue

            for sc in stage_cols:
                stage_name = str(sc).replace("stage_", "").strip()
                val = row.get(sc)
                
                if pd.isna(val) or str(val).strip() == "":
                    # Record missing stage measurement
                    issues.append(f"Missing measurement for {comp_id} at {stage_name}")
                    continue
                
                try:
                    num_val = float(val)
                except (ValueError, TypeError):
                    issues.append(f"Non-numeric reading for {comp_id} at {stage_name}: '{val}'")
                    continue
                
                canonical_rows.append({
                    "component_id": comp_id,
                    "subsystem": subsystem,
                    "lot_id": lot_id or "LOT-UNKNOWN",
                    "parameter": param or "Standard Measurement",
                    "stage": stage_name,
                    "value": num_val,
                    "datasheet_limit": limit
                })
    else:
        # Long format: component_id | lot_id | parameter | stage | value | limit
        for _, row in df_renamed.iterrows():
            comp_id = str(row.get("component_id", "")).strip()
            subsystem = str(row.get("subsystem", "")).strip() or "Flight Computer"
            lot_id = str(row.get("lot_id", "")).strip()
            param = str(row.get("parameter", "")).strip()
            stage = str(row.get("stage", "")).strip()
            val = row.get("value")
            
            raw_limit = row.get("datasheet_limit", None)
            try:
                limit = float(raw_limit) if pd.notna(raw_limit) else 50.0
            except (ValueError, TypeError):
                limit = 50.0

            if not comp_id or comp_id.lower() == "nan":
                continue
            
            if pd.isna(val) or str(val).strip() == "":
                issues.append(f"Missing measurement for {comp_id} at {stage}")
                continue
            
            try:
                num_val = float(val)
            except (ValueError, TypeError):
                issues.append(f"Non-numeric reading for {comp_id} at {stage}: '{val}'")
                continue

            canonical_rows.append({
                "component_id": comp_id,
                "subsystem": subsystem,
                "lot_id": lot_id or "LOT-UNKNOWN",
                "parameter": param or "Standard Measurement",
                "stage": stage,
                "value": num_val,
                "datasheet_limit": limit
            })

    if not canonical_rows:
        raise DataValidationError("No valid measurements could be parsed from the dataset.", issues)

    canonical_df = pd.DataFrame(canonical_rows)

    # Deduplicate rows
    dup_count = canonical_df.duplicated(subset=["component_id", "parameter", "stage"]).sum()
    if dup_count > 0:
        issues.append(f"Detected {dup_count} duplicate measurements; retaining most recent.")
        canonical_df = canonical_df.drop_duplicates(subset=["component_id", "parameter", "stage"], keep="last")

    # Data quality calculations
    valid_rows = len(canonical_df)
    missing_rows = len([i for i in issues if "Missing measurement" in i])
    components = canonical_df["component_id"].nunique()
    lots = canonical_df["lot_id"].nunique()
    parameters = canonical_df["parameter"].nunique()
    stages = sorted(canonical_df["stage"].unique().tolist())

    # Quality Score: start at 100, penalize for missing values and duplicates
    penalty = (missing_rows * 3.0) + (dup_count * 2.0)
    quality_score = max(10.0, min(100.0, 100.0 - penalty))

    quality_report = DataQualityReport(
        total_rows=total_raw_rows,
        valid_rows=valid_rows,
        missing_rows=missing_rows,
        duplicate_rows=int(dup_count),
        component_count=components,
        lot_count=lots,
        parameter_count=parameters,
        available_stages=stages,
        quality_score=round(quality_score, 1),
        issues=issues[:15]  # Cap top 15 issues for readable response
    )

    return canonical_df, quality_report
