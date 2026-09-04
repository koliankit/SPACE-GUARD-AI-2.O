import os
import sys
from pathlib import Path

# Ensure project root is in sys.path when running this script directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoints(client):
    r1 = client.get("/api/v1/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "online"

    r2 = client.get("/api/v1/health/database")
    assert r2.status_code == 200
    assert r2.json()["status"] == "online"

    r3 = client.get("/api/v1/health/ml")
    assert r3.status_code == 200
    assert r3.json()["status"] == "online"

def test_demo_load_and_screening_pipeline(client):
    # 1. Load Demo
    res = client.post("/api/v1/demo/load")
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["status"] == "completed"
    analysis_id = data["analysis_id"]

    # Verify Summary
    summary = data["summary"]
    assert summary["total_components"] >= 15
    assert summary["reject"] >= 1  # Should flag anomalies

    # Verify COMP-FC-03 is localized to flightComputer and flagged REJECT
    fc03 = next((r for r in data["results"] if r["component_id"] == "COMP-FC-03"), None)
    assert fc03 is not None
    assert fc03["decision"] == "REJECT"
    assert fc03["physical_model_id"] == "flightComputer"
    assert fc03["current_value"] < fc03["datasheet_limit"]  # Within datasheet limit!
    assert fc03["risk_score"] >= 70.0
    assert "Lot" in fc03["explanation"] or "baseline" in fc03["explanation"]

    # 2. Test Components API
    comp_res = client.get("/api/v1/components")
    assert comp_res.status_code == 200
    comps = comp_res.json()
    assert len(comps) >= 15

    # 3. Test Specific Component Detail
    fc03_detail = client.get("/api/v1/components/COMP-FC-03")
    assert fc03_detail.status_code == 200
    detail_data = fc03_detail.json()
    assert detail_data["component_id"] == "COMP-FC-03"
    assert len(detail_data["measurements"]) >= 4
    assert len(detail_data["coordinates"]) == 3

    # 4. Test Mission Status Dynamic Health
    m_res = client.get("/api/v1/mission-status")
    assert m_res.status_code == 200
    m_data = m_res.json()
    assert m_data["system_online"] is True
    assert m_data["mission_health_score"] > 0
    assert len(m_data["critical_components"]) >= 1

    # 5. Test Audit Log
    audit_res = client.get(f"/api/v1/audit-log/{analysis_id}")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 3

    # 6. Test PDF Report Generation
    rep_res = client.post(f"/api/v1/reports/{analysis_id}/generate")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert "report_id" in rep_data
    assert "report_url" in rep_data

    # Download Report
    down_res = client.get(rep_data["report_url"])
    assert down_res.status_code == 200
    assert down_res.headers["content-type"] == "application/pdf"


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print(" >>> RUNNING TEST: backend/tests/test_api_endpoints.py")
    print("=" * 70 + "\n")
    sys.exit(pytest.main([__file__, "-v", "-s"]))

