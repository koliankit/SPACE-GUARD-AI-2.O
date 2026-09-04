# SPACEGUARD AI — SIH 2026
### Real-Time Intelligent Reliability Monitoring for Spacecraft Components

> **MISSION SIMULATION DISCLAIMER**  
> *This software is an aerospace reliability engineering decision-support tool and mission simulation inspired by ISRO and space agency quality standards. It does not represent an official ISRO system or an operational government network connection.*

---

## 🛰️ Executive Overview

Traditional spacecraft component screening relies on binary static boundaries:
> *"Does the measured reading fall within the manufacturer datasheet limit?"*

In high-reliability space applications, a latent defect often remains within static datasheet limits during screening, only to catastrophically fail during mission operational life.

**SPACEGUARD AI** asks a fundamentally different question:
> *"Is the component behaving normally relative to its production lot and burn-in drift trajectory?"*

### The Core Concept Proven
A flight computer component (`COMP-FC-03`) has a leakage current of **38.4 µA** against a datasheet limit of **50.0 µA**.
- **Traditional Screening Result**: **PASS** (38.4 µA < 50.0 µA)
- **SPACEGUARD AI Result**: **REJECT / CRITICAL RISK (Risk: 87/100)**
  - **Reason 1**: Operating **+3.4σ** above its production lot baseline (Lot-12 peer mean: 21.0 µA).
  - **Reason 2**: Positive degradation drift rate of **+0.11 µA/hr** across 168h burn-in.
  - **Reason 3**: Robust regression predicts parameter value of **54.8 µA at 250h**, crossing the datasheet limit during initial mission deployment.
  - **Result**: Automatic camera focus onto the 3D satellite flight computer bay with a glowing crimson alert and full engineering diagnosis!

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Plotly.js (`plotly.js-dist-min`), Framer Motion, TanStack Query |
| **Backend** | Python 3.11 / 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Pandas, NumPy, Scikit-learn (Isolation Forest), SciPy, ReportLab (Official PDF Generator) |
| **Database** | Relational Database with SQLAlchemy ORM (SQLite zero-dependency development fallback, PostgreSQL production ready) |
| **DevOps** | Docker, Docker Compose, Pytest |

---

## 🏛️ System Architecture

```
                                  SPACEGUARD AI ARCHITECTURE
                                  
   +--------------------------------------------------------------------------------+
   |                             Vite + React Frontend                              |
   |                                                                                |
   |  +---------------------+   +-----------------------+   +--------------------+  |
   |  |  Component Monitor  |   |   3D Satellite Bus    |   | Component Intel    |  |
   |  |  (Search & Filters) |   | (React Three Fiber)   |   | (Why Flagged, Risk)|  |
   |  +---------------------+   +-----------------------+   +--------------------+  |
   |  +--------------------------------------------------------------------------+  |
   |  | Bottom Telemetry Panel: Plotly Telemetry Curve | Burn-in Timeline | Audit |  |
   +---------------------------------------^----------------------------------------+
                                           | REST API (Axios / TanStack Query)
   +---------------------------------------v----------------------------------------+
   |                             FastAPI Backend                                    |
   |                                                                                |
   |  [/upload]       [/analyze]      [/components]      [/mission-status]  [/demo]  |
   +---------------------------------------+----------------------------------------+
                                           |
                    +----------------------v----------------------+
                    |          Data & ML Pipeline Engine          |
                    |                                             |
                    |  1. Ingestion & Column Alias Detection      |
                    |  2. Canonical Normalization (Wide / Long)   |
                    |  3. Data Quality Engine                     |
                    |  4. Feature Engineering (Deltas, Slopes)    |
                    |  5. Lot-Relative Analysis (Z-score, Median) |
                    |  6. Isolation Forest Anomaly Detection      |
                    |  7. Drift Extrapolation (Trajectory/Limit)  |
                    |  8. Deterministic Risk Engine (0 - 100)     |
                    |  9. Decision Engine (SAFE/MONITOR/REJECT)   |
                    | 10. Satellite Physical Coordinate Mapper    |
                    +----------------------+----------------------+
                                           |
                    +----------------------v----------------------+
                    |        SQLAlchemy Persistent Database       |
                    |  (Datasets, Components, Measurements,       |
                    |   AnalysisRuns, AnalysisResults, AuditLogs) |
                    +---------------------------------------------+
```

---

## ⚡ Quickstart & Judge Deployment Guide

### 🚀 Option A: 1-Click Live Judge Demo (Zero Friction)
- **Windows**: Double-click [`run_judge_demo.bat`](file:///c:/Users/ankit/Downloads/sihproject/run_judge_demo.bat) (or run `./run_judge_demo.bat` in PowerShell).
- **Linux / macOS**: Run `chmod +x run_judge_demo.sh && ./run_judge_demo.sh`.
- Automatically builds the frontend, verifies Python dependencies, launches the unified single-port app, and opens your browser directly to `http://127.0.0.1:8000`.

### 🌐 Option B: Instant Public Link for Judges (Shareable during Hackathon)
To let judges open and test the application on their own laptops or mobile devices during evaluation:
```bash
# In any terminal (with app running on port 8000):
npx localtunnel --port 8000
```
This generates a live public HTTPS URL (e.g., `https://spaceguard-demo.loca.lt`) you can directly paste to judges or embed in your presentation slides!

### 🐳 Option C: Production Docker Deployment
```bash
docker compose up --build
```
- Unified Application: `http://localhost:8000`
- API Swagger Docs: `http://localhost:8000/docs`

### ☁️ Option D: Free 1-Click Cloud Deployment (Render.com / Railway)
- **Render.com**: Connect your GitHub repo and select "Blueprint" to automatically use [`render.yaml`](file:///c:/Users/ankit/Downloads/sihproject/render.yaml).
- **Railway / Heroku**: Deploys automatically using the included [`Procfile`](file:///c:/Users/ankit/Downloads/sihproject/Procfile) and [`Dockerfile`](file:///c:/Users/ankit/Downloads/sihproject/Dockerfile).

### 🔺 Option E: Vercel Frontend Deployment
- **Option 1: Deploy from Project Root**:
  1. Connect your repository to [Vercel](https://vercel.com).
  2. Leave the **Root Directory** as `./`.
  3. (Optional) Add an Environment Variable `VITE_API_BASE_URL` with your deployed backend URL (e.g. `https://spaceguard-ai.onrender.com/api/v1`).
  4. Click **Deploy**. The root [`vercel.json`](file:///c:/Users/ankit/Downloads/sihproject/vercel.json) will automatically install frontend dependencies, build the Vite app, and serve it with production SPA routing.
- **Option 2: Deploy Frontend Subdirectory**:
  1. Set **Root Directory** to `frontend` in the Vercel project settings.
  2. The included [`frontend/vercel.json`](file:///c:/Users/ankit/Downloads/sihproject/frontend/vercel.json) handles client-side routing rewrites and asset caching automatically.
- **Option 3: Vercel CLI**:
  ```bash
  npx vercel
  # or for production:
  npx vercel --prod
  ```

### 🛠️ Option F: Traditional Development Mode
```powershell
# Terminal 1: Backend
py -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 🎈 Option G: Standalone Streamlit App (Zero Node.js Dependency)
To launch the complete Mission Control dashboard in Python with interactive 3D satellite visualization, Plotly telemetry drift curves, and instant PDF report generation:
```powershell
streamlit run streamlit_app.py
# or using the Makefile:
make streamlit
```
- Can also be deployed in 1-click on [Streamlit Community Cloud](https://share.streamlit.io) by linking this repository and selecting `streamlit_app.py`.

---

## 🧪 Automated Testing

SPACEGUARD AI includes a comprehensive test suite with 100% pass rate:
```powershell
python -m pytest backend/tests -v
```

Test Suites:
1. `test_data_validator.py`: Alias detection, wide/long canonicalization, missing value detection.
2. `test_feature_and_lot.py`: Delta from baseline, drift rate calculation, lot-relative robust z-scores.
3. `test_anomaly_and_risk.py`: Isolation Forest reproducibility, regression prediction, insufficient data reporting, 3D coordinate mapping.
4. `test_api_endpoints.py`: End-to-end API verification of health, demo loader, components, mission status, audit log, and PDF report generation.

---

## 📡 Core API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | System health check and disclaimer |
| `/api/v1/health/database` | `GET` | Relational database connection check |
| `/api/v1/health/ml` | `GET` | ML model and pipeline check |
| `/api/v1/upload` | `POST` | Upload CSV/Excel dataset with alias detection & quality check |
| `/api/v1/analyze` | `POST` | Trigger ML screening pipeline on a dataset |
| `/api/v1/analysis/{id}` | `GET` | Retrieve persistent analysis results and summary |
| `/api/v1/components` | `GET` | Filterable list of components with risk scores |
| `/api/v1/components/{id}` | `GET` | Component detail, 3D coordinates, and measurement history |
| `/api/v1/prediction/{id}` | `GET` | Burn-in trajectory and projected future value |
| `/api/v1/mission-status` | `GET` | Dynamic mission health score and telemetry overview |
| `/api/v1/demo/load` | `POST` | Load synthetic demo dataset and run screening |
| `/api/v1/reports/{id}/generate` | `POST` | Generate official ReportLab PDF report |
| `/api/v1/reports/download/{id}` | `GET` | Download generated PDF report |
| `/api/v1/audit-log/{id}` | `GET` | Chronological persistent audit log |

---

## 📊 End-to-End Judge Walkthrough (20-30 Second Demo)

1. Open `http://localhost:5173`.
2. Notice the live health telemetry badges in the top header (`SYSTEM ONLINE`, `AI ENGINE ONLINE`, `DATABASE ONLINE`, `TELEMETRY ACTIVE`).
3. Click the glowing **MISSION DEMO** button.
4. Watch the real-time stage progress modal track backend execution (Ingestion → Lot Analysis → Isolation Forest → Drift Prediction → 3D Mapping).
5. The 3D satellite camera smoothly glides and zooms directly into the **Flight Computer** bay.
6. `COMP-FC-03` pulses red with a warning halo.
7. Inspect the **Component Intelligence** panel on the right:
   - **Traditional Check**: `PASS (38.4 µA < 50.0 µA)`
   - **SPACEGUARD AI**: `REJECT (Risk Score: 87/100)`
   - **Why Flagged**: `+3.4σ deviation from LOT-12 baseline`, `+0.11 µA/h drift rate`, `Projected 54.8 µA at 250h breaches 50.0 µA limit`.
8. Inspect the bottom panel:
   - **Telemetry Curve**: See the observed 0h, 24h, 96h, 168h points, the lot baseline, the projected extrapolation line, and the red datasheet limit.
   - **Audit Trail**: View the timestamped database events for this run.
9. Click **REPORTS** in the header -> Click **GENERATE PDF REPORT** -> Download and open the generated PDF report.

---

## 👥 Authors
Built for Smart India Hackathon (SIH 2026).
Aerospace Reliability Engineering & Spacecraft Quality Assurance.
