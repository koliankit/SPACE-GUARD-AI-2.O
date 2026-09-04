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
        "comp_id", "componentid", "partid", "device", "id", "serial", 
        "serial_no", "component_name", "part_number", "part_no"
    ],
    "subsystem": [
        "subsystem", "sub_system", "system", "unit", "module", "assembly", 
        "domain", "section", "bay"
    ],
    "lot_id": [
        "lot_id", "lot", "batch", "batch_id", "lot_num", "lotid", "batchid", 
        "lot_no", "batch_no", "wafer", "lot#"
    ],
    "parameter": [
        "parameter", "parameter_name", "measurement_type", "metric", 
        "param", "test_parameter", "metric_name", "test", "feature", "variable"
    ],
    "value": [
        "value", "measurement", "reading", "val", "data", "measured_value", "measured", "result"
    ],
    "stage": [
        "stage", "burn_in_stage", "burnin_stage", "hour", "hours", 
        "time_stage", "test_stage", "timepoint", "time", "cycle", "step"
    ],
    "datasheet_limit": [
        "datasheet_limit", "limit", "max_limit", "spec_limit", 
        "max_spec", "datasheet_max", "upper_limit", "threshold", "spec", "max"
    ],
}

STAGE_PATTERNS = [
    r"^0\s*h(ours?)?$",
    r"^24\s*h(ours?)?$",
    r"^96\s*h(ours?)?$",
    r"^168\s*h(ours?)?$",
    r"^(\d+(?:\.\d+)?)\s*h(ours?)?$",
    r"^(?:hour|hr|h|stage|time|t|step|cycle)[_\-\s]*(\d+(?:\.\d+)?)(?:h|hr|hours?)?$",
    r"^(\d+(?:\.\d+)?)$",
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

    # Auto-fallback for component_id if not mapped
    if "component_id" not in df_renamed.columns:
        for col in df_renamed.columns:
            if not pd.api.types.is_numeric_dtype(df_renamed[col]):
                df_renamed = df_renamed.rename(columns={col: "component_id"})
                break
        if "component_id" not in df_renamed.columns and len(df_renamed.columns) > 0:
            df_renamed = df_renamed.rename(columns={df_renamed.columns[0]: "component_id"})

    # Check if wide format
    stage_cols = [
        c for c in df_renamed.columns 
        if str(c).startswith("stage_") or re.match(r"^\d+(?:\.\d+)?(?:h|hours?)?$", str(c).lower().strip())
    ]
    
    # Auto-detect numeric columns as wide-format stages if no standard stage columns found
    if not stage_cols and ("value" not in df_renamed.columns or "stage" not in df_renamed.columns):
        for col in df_renamed.columns:
            if col not in ("component_id", "subsystem", "lot_id", "parameter", "datasheet_limit"):
                try:
                    s = pd.to_numeric(df_renamed[col].dropna(), errors="coerce")
                    if s.notna().sum() > 0:
                        stage_cols.append(col)
                except Exception:
                    pass
    
    canonical_rows = []
    
    if stage_cols:
        # Wide format: component_id | lot_id | parameter | 0h | 24h | 96h | 168h | limit
        for idx, row in df_renamed.iterrows():
            raw_c = row.get("component_id")
            comp_id = str(raw_c).strip() if pd.notna(raw_c) else ""
            if not comp_id or comp_id.lower() == "nan":
                comp_id = f"COMP-{idx+1:02d}"

            raw_sub = row.get("subsystem")
            subsystem = str(raw_sub).strip() if pd.notna(raw_sub) else ""
            if not subsystem or subsystem.lower() == "nan":
                subsystem = "Flight Computer"

            raw_lot = row.get("lot_id")
            lot_id = str(raw_lot).strip() if pd.notna(raw_lot) else ""
            if not lot_id or lot_id.lower() == "nan":
                lot_id = "LOT-01"

            raw_param = row.get("parameter")
            param = str(raw_param).strip() if pd.notna(raw_param) else ""
            if not param or param.lower() == "nan":
                param = "Parameter Telemetry"
            
            raw_limit = row.get("datasheet_limit", None)
            try:
                limit = float(raw_limit) if pd.notna(raw_limit) else 50.0
            except (ValueError, TypeError):
                limit = 50.0

            for sc in stage_cols:
                stage_name = str(sc).replace("stage_", "").strip()
                val = row.get(sc)
                
                if pd.isna(val) or str(val).strip() == "":
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
                    "lot_id": lot_id,
                    "parameter": param,
                    "stage": stage_name,
                    "value": num_val,
                    "datasheet_limit": limit
                })
    else:
        # Long format: component_id | lot_id | parameter | stage | value | limit
        for idx, row in df_renamed.iterrows():
            raw_c = row.get("component_id")
            comp_id = str(raw_c).strip() if pd.notna(raw_c) else ""
            if not comp_id or comp_id.lower() == "nan":
                comp_id = f"COMP-{idx+1:02d}"

            raw_sub = row.get("subsystem")
            subsystem = str(raw_sub).strip() if pd.notna(raw_sub) else ""
            if not subsystem or subsystem.lower() == "nan":
                subsystem = "Flight Computer"

            raw_lot = row.get("lot_id")
            lot_id = str(raw_lot).strip() if pd.notna(raw_lot) else ""
            if not lot_id or lot_id.lower() == "nan":
                lot_id = "LOT-01"

            raw_param = row.get("parameter")
            param = str(raw_param).strip() if pd.notna(raw_param) else ""
            if not param or param.lower() == "nan":
                param = "Parameter Telemetry"

            raw_stage = row.get("stage")
            stage = str(raw_stage).strip() if pd.notna(raw_stage) else f"stage_{idx}"

            val = row.get("value")
            
            raw_limit = row.get("datasheet_limit", None)
            try:
                limit = float(raw_limit) if pd.notna(raw_limit) else 50.0
            except (ValueError, TypeError):
                limit = 50.0

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
                "lot_id": lot_id,
                "parameter": param,
                "stage": stage,
                "value": num_val,
                "datasheet_limit": limit
            })

    if not canonical_rows:
        raise DataValidationError(
            "No valid numeric measurements could be parsed from the dataset. Please ensure columns with numeric readings (e.g. 0h, 24h, 96h, 168h or a value column) are included.",
            issues
        )

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
