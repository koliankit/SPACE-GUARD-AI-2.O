from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db, utc_now

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health")
def system_health():
    """Returns overall health of SPACEGUARD AI system services."""
    return {
        "status": "online",
        "service": "SPACEGUARD AI",
        "version": "1.0.0",
        "timestamp": utc_now().isoformat(),
        "disclaimer": "MISSION SIMULATION — Aerospace Reliability Monitoring"
    }

@router.get("/health/database")
def database_health(db: Session = Depends(get_db)):
    """Verifies relational database connection and responsiveness."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "online",
            "database": "relational_db",
            "message": "Database connection verified and active.",
            "timestamp": utc_now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "offline", "database": "relational_db", "error": str(e)}
        )

@router.get("/health/ml")
def ml_engine_health():
    """Verifies ML pipeline and model runtimes."""
    try:
        from sklearn.ensemble import IsolationForest
        import numpy as np
        # Lightweight test execution
        clf = IsolationForest(n_estimators=10, random_state=42)
        clf.fit(np.array([[1.0, 2.0], [1.1, 2.1], [50.0, 50.0]]))
        return {
            "status": "online",
            "ml_engine": "IsolationForest + Robust Lot-Relative Z-Score Engine",
            "version": "v1.0.0-isoforest-lotrobust",
            "timestamp": utc_now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "offline", "ml_engine": "unavailable", "error": str(e)}
        )
