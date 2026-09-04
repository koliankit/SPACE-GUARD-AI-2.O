import os
import sys
from pathlib import Path

# Ensure project root is in sys.path when running this script directly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.config import settings

from backend.app.database import engine, Base
import backend.app.models  # Ensure all SQLAlchemy models are registered
from backend.app.routes import (
    upload_router,
    analysis_router,
    components_router,
    mission_router,
    audit_router,
    reports_router,
    demo_router,
    health_router
)
from backend.app.services.ml.data_validator import DataValidationError

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("spaceguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    logger.info("Initializing persistent database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized.")
    yield
    logger.info("SPACEGUARD AI backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Exception Handlers for Structured Error Responses
@app.exception_handler(DataValidationError)
async def data_validation_exception_handler(request: Request, exc: DataValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "INVALID_DATASET",
                "message": exc.message,
                "issues": exc.issues
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred in the reliability engine."
            }
        }
    )

# Register API v1 Routers
api_v1_routers = [
    upload_router,
    analysis_router,
    components_router,
    mission_router,
    audit_router,
    reports_router,
    demo_router,
    health_router,
]

for r in api_v1_routers:
    app.include_router(r, prefix=settings.API_V1_PREFIX)

# Also expose health check at root /health for convenience
app.include_router(health_router)

@app.get("/api/info")
def root_info():
    return {
        "system": "SPACEGUARD AI",
        "role": "Real-Time Intelligent Reliability Monitoring for Spacecraft Components",
        "docs": "/docs",
        "status": "online",
        "disclaimer": "MISSION SIMULATION"
    }

# Mount Built Frontend if available (Unified Single-Port Deployment for Judges/Production)
frontend_dist = PROJECT_ROOT / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    logger.info(f"Mounting built frontend static files from: {frontend_dist}")
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Allow API, docs and OpenAPI to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            return JSONResponse(status_code=404, content={"error": "Not Found"})
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(frontend_dist / "index.html"))
else:
    @app.get("/")
    def root():
        return root_info()



if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 70)
    print(" >>> STARTING SPACEGUARD AI BACKEND (FastAPI + Uvicorn)")
    print(" >>> Swagger Docs available at: http://127.0.0.1:8000/docs")
    print("=" * 70 + "\n")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

