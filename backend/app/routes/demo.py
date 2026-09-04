import os
import uuid
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.dataset import Dataset
from backend.app.models.component import Component
from backend.app.models.measurement import Measurement
from backend.app.schemas.analysis import AnalysisResponse, AnalysisStartRequest
from backend.app.services.ml.data_validator import canonicalize_dataframe, detect_column_aliases
from backend.app.services.ml.satellite_mapper import resolve_component_mapping
from backend.app.routes.analysis import run_screening_analysis

router = APIRouter(prefix="", tags=["Demo"])

DEMO_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "demo", "demo_burn_in_data.csv")

@router.post("/demo/load", response_model=AnalysisResponse)
def load_and_execute_demo(db: Session = Depends(get_db)):
    """
    Loads the official aerospace demo dataset from disk, persists it to the database,
    and executes the real ML screening analysis pipeline.
    Identifies latent anomaly COMP-FC-03 (within datasheet limit, but abnormal trajectory & lot outlier).
    """
    if not os.path.exists(DEMO_FILE_PATH):
        raise HTTPException(status_code=500, detail="Demo dataset file not found on server.")

    # 1. Read CSV
    df = pd.read_csv(DEMO_FILE_PATH)
    headers = [str(c) for c in df.columns]
    mapping, _, _ = detect_column_aliases(headers)
    
    canonical_df, quality_report = canonicalize_dataframe(df, mapping)

    # 2. Persist Dataset
    dataset_id = str(uuid.uuid4())
    dataset = Dataset(
        id=dataset_id,
        filename="spaceguard_demo_burn_in.csv",
        file_type="csv",
        row_count=quality_report.total_rows,
        valid_rows=quality_report.valid_rows,
        missing_rows=quality_report.missing_rows,
        quality_score=quality_report.quality_score,
        status="ready"
    )
    db.add(dataset)

    # 3. Persist Components
    unique_comps = canonical_df[["component_id", "subsystem", "lot_id"]].drop_duplicates()
    for _, c_row in unique_comps.iterrows():
        c_id = c_row["component_id"]
        existing = db.query(Component).filter(Component.component_id == c_id).first()
        mapping_info = resolve_component_mapping(c_id, c_row["subsystem"])
        if not existing:
            comp = Component(
                component_id=c_id,
                subsystem=mapping_info["subsystem"],
                lot_id=c_row["lot_id"],
                physical_model_id=mapping_info["physical_model_id"],
                x=mapping_info["position"][0],
                y=mapping_info["position"][1],
                z=mapping_info["position"][2],
            )
            db.add(comp)
        else:
            existing.subsystem = mapping_info["subsystem"]
            existing.lot_id = c_row["lot_id"]
            existing.physical_model_id = mapping_info["physical_model_id"]
            existing.x = mapping_info["position"][0]
            existing.y = mapping_info["position"][1]
            existing.z = mapping_info["position"][2]

    # 4. Persist Measurements
    measurements = []
    for _, m_row in canonical_df.iterrows():
        measurements.append(Measurement(
            dataset_id=dataset_id,
            component_id=m_row["component_id"],
            lot_id=m_row["lot_id"],
            parameter=m_row["parameter"],
            stage=m_row["stage"],
            value=float(m_row["value"]),
            datasheet_limit=float(m_row["datasheet_limit"])
        ))
    db.bulk_save_objects(measurements)
    db.commit()

    # 5. Run the actual screening analysis pipeline!
    analysis_req = AnalysisStartRequest(dataset_id=dataset_id)
    return run_screening_analysis(analysis_req, db)
