import os
from typing import List, Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from backend.app.config import settings
from backend.app.database import utc_now

def generate_pdf_report(
    analysis_run_id: str,
    dataset_name: str,
    model_version: str,
    summary_data: Dict[str, Any],
    component_results: List[Dict[str, Any]]
) -> str:
    """
    Generates an aerospace-grade PDF screening report with full traceability.
    Returns: absolute file path to the generated PDF.
    """
    filename = f"SPACEGUARD_Report_{analysis_run_id[:8]}_{int(utc_now().timestamp())}.pdf"
    filepath = os.path.join(settings.REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10
    )
    cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10
    )

    elements = []

    # Title & Metadata
    elements.append(Paragraph("SPACEGUARD AI — Aerospace Reliability Screening Report", title_style))
    elements.append(Paragraph(
        "Real-Time Intelligent Reliability Monitoring for Spacecraft Components | MISSION SIMULATION",
        subtitle_style
    ))

    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>Analysis Run ID:</b>", cell_bold), Paragraph(analysis_run_id, cell_style),
            Paragraph("<b>Timestamp:</b>", cell_bold), Paragraph(utc_now().strftime("%Y-%m-%d %H:%M:%S UTC"), cell_style)
        ],
        [
            Paragraph("<b>Source Dataset:</b>", cell_bold), Paragraph(dataset_name, cell_style),
            Paragraph("<b>AI Model Version:</b>", cell_bold), Paragraph(model_version, cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[120, 240, 100, 240])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # Summary Card
    elements.append(Paragraph("MISSION SCREENING SUMMARY", section_heading))
    summary_table_data = [
        ["Total Evaluated", "SAFE", "MONITOR", "REJECT", "Anomalies Flagged"],
        [
            str(summary_data.get("total_components", 0)),
            str(summary_data.get("safe", 0)),
            str(summary_data.get("monitor", 0)),
            str(summary_data.get("reject", 0)),
            str(summary_data.get("anomalies", 0))
        ]
    ]
    sum_table = Table(summary_table_data, colWidths=[140, 140, 140, 140, 140])
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F1F5F9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(sum_table)
    elements.append(Spacer(1, 14))

    # Component Detailed Results Table
    elements.append(Paragraph("COMPONENT RELIABILITY EVALUATION MATRIX", section_heading))
    
    headers = [
        "Component ID", "Subsystem", "Lot", "Parameter", "Current", 
        "Limit", "Anomaly", "Lot Z-Score", "Drift/hr", "Pred 250h", "Risk", "Decision"
    ]
    
    table_rows = [headers]
    for res in component_results:
        dec = str(res.get("decision", "SAFE"))
        pred_val = res.get("predicted_value")
        pred_str = f"{pred_val:.1f}" if pred_val is not None else "N/A"
        
        row = [
            str(res.get("component_id")),
            str(res.get("subsystem")),
            str(res.get("lot_id")),
            str(res.get("parameter"))[:16],
            f"{float(res.get('current_value', 0)):.1f}",
            f"{float(res.get('datasheet_limit', 0)):.1f}",
            f"{float(res.get('anomaly_score', 0)):.2f}",
            f"{float(res.get('lot_relative_score', 0)):+.1f}σ",
            f"{float(res.get('drift_rate', 0)):+.3f}",
            pred_str,
            f"{float(res.get('risk_score', 0)):.0f}",
            dec
        ]
        table_rows.append(row)

    comp_table = Table(
        table_rows, 
        colWidths=[70, 80, 50, 80, 45, 40, 45, 55, 50, 50, 40, 55]
    )
    
    # Styling per row based on decision
    custom_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 7.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('FONTSIZE', (0, 1), (-1, -1), 7),
    ]

    for idx, res in enumerate(component_results, start=1):
        dec = res.get("decision")
        if dec == "REJECT":
            custom_styles.append(('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FEE2E2')))
            custom_styles.append(('TEXTCOLOR', (11, idx), (11, idx), colors.HexColor('#B91C1C')))
            custom_styles.append(('FONTNAME', (11, idx), (11, idx), 'Helvetica-Bold'))
        elif dec == "MONITOR":
            custom_styles.append(('BACKGROUND', (0, idx), (-1, idx), colors.HexColor('#FEF3C7')))
            custom_styles.append(('TEXTCOLOR', (11, idx), (11, idx), colors.HexColor('#B45309')))
            custom_styles.append(('FONTNAME', (11, idx), (11, idx), 'Helvetica-Bold'))

    comp_table.setStyle(TableStyle(custom_styles))
    elements.append(comp_table)

    # Explanation of Flagged Components
    flagged = [r for r in component_results if r.get("decision") in ["REJECT", "MONITOR"]]
    if flagged:
        elements.append(Spacer(1, 14))
        elements.append(Paragraph("AI ANOMALY & DRIFT DIAGNOSIS RATIONALE", section_heading))
        for comp in flagged:
            comp_id = comp.get("component_id")
            dec = comp.get("decision")
            expl = comp.get("explanation", "").replace("\n", "<br/>")
            text = f"<b>{comp_id} [{dec}]:</b> {expl}"
            elements.append(Paragraph(text, cell_style))
            elements.append(Spacer(1, 3))

    doc.build(elements)
    return filepath
