from backend.app.routes.upload import router as upload_router
from backend.app.routes.analysis import router as analysis_router
from backend.app.routes.components import router as components_router
from backend.app.routes.mission import router as mission_router
from backend.app.routes.audit import router as audit_router
from backend.app.routes.reports import router as reports_router
from backend.app.routes.demo import router as demo_router
from backend.app.routes.health import router as health_router

__all__ = [
    "upload_router",
    "analysis_router",
    "components_router",
    "mission_router",
    "audit_router",
    "reports_router",
    "demo_router",
    "health_router",
]
