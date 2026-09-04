import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db, utc_now
from backend.app.models.analysis import AnalysisRun, AnalysisResult
from backend.app.models.report import Report
from backend.app.schemas.report import ReportSummary, ReportGenerateResponse
from backend.app.services.report_service import generate_pdf_report
from backend.app.config import settings

router = APIRouter(prefix="", tags=["Reports"])

@router.get("/reports/{analysis_id}", response_model=List[ReportSummary])
def get_reports_for_analysis(analysis_id: str, db: Session = Depends(get_db)):
    """Lists generated reports for an analysis run."""
    reports = db.query(Report).filter(Report.analysis_run_id == analysis_id).order_by(Report.created_at.desc()).all()
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()

    return [
        ReportSummary(
            id=r.id,
            analysis_run_id=r.analysis_run_id,
            report_path=r.report_path,
            report_type=r.report_type,
            created_at=r.created_at.isoformat(),
            total_components=run.total_components if run else 0,
            anomaly_count=run.anomaly_count if run else 0,
            status="completed"
        )
        for r in reports
    ]

@router.post("/reports/{analysis_id}/generate", response_model=ReportGenerateResponse)
def generate_report(analysis_id: str, db: Session = Depends(get_db)):
    """Generates an official aerospace screening PDF report with full traceability."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found.")

    results = db.query(AnalysisResult).filter(AnalysisResult.analysis_run_id == analysis_id).all()
    if not results:
        raise HTTPException(status_code=400, detail="No results found for this analysis run to generate report.")

    results_data = [
        {
            "component_id": r.component_id,
            "subsystem": r.subsystem,
            "lot_id": r.lot_id,
            "parameter": r.parameter,
            "current_value": r.current_value,
            "datasheet_limit": r.datasheet_limit,
            "anomaly_score": r.anomaly_score,
            "lot_relative_score": r.lot_relative_score,
            "drift_rate": r.drift_rate,
            "predicted_value": r.predicted_value,
            "risk_score": r.risk_score,
            "decision": r.decision,
            "explanation": r.explanation,
        }
        for r in results
    ]

    summary_data = {
        "total_components": run.total_components,
        "safe": run.safe_count,
        "monitor": run.monitor_count,
        "reject": run.reject_count,
        "anomalies": run.anomaly_count
    }

    # Generate physical PDF
    pdf_path = generate_pdf_report(
        analysis_run_id=run.id,
        dataset_name=run.dataset.filename if run.dataset else "BurnIn_Dataset",
        model_version=run.model_version,
        summary_data=summary_data,
        component_results=results_data
    )

    report_id = str(uuid.uuid4())
    report_rec = Report(
        id=report_id,
        analysis_run_id=run.id,
        report_path=pdf_path,
        report_type="PDF",
        created_at=utc_now()
    )
    db.add(report_rec)
    db.commit()

    return ReportGenerateResponse(
        report_id=report_id,
        report_url=f"/api/v1/reports/download/{report_id}",
        filename=os.path.basename(pdf_path),
        message="Official aerospace reliability screening report generated successfully."
    )

@router.get("/reports/download/{report_id}")
def download_report(report_id: str, db: Session = Depends(get_db)):
    """Downloads the generated PDF report file."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.report_path):
        raise HTTPException(status_code=404, detail="Report file not found.")

    return FileResponse(
        report.report_path,
        media_type="application/pdf",
        filename=os.path.basename(report.report_path)
    )
