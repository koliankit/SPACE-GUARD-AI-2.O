#!/usr/bin/env bash
# ==============================================================================
# SPACEGUARD AI - SIH 2026 Live Demo Launcher (Linux / macOS)
# ==============================================================================

set -e

echo "=============================================================================="
echo "                🛰️ SPACEGUARD AI — SIH 2026 LIVE DEMO"
echo "     Real-Time Intelligent Reliability Monitoring for Spacecraft Components"
echo "=============================================================================="
echo ""

# Check if local virtual environment exists
if [ -f ".venv/bin/python" ]; then
    PYTHON_CMD=".venv/bin/python"
elif [ -f ".venv/Scripts/python" ]; then
    PYTHON_CMD=".venv/Scripts/python"
elif [ -f ".venv/Scripts/python.exe" ]; then
    PYTHON_CMD=".venv/Scripts/python.exe"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Neither .venv nor system Python was found in your PATH."
    exit 1
fi

echo "[*] Using Python: $($PYTHON_CMD --version)"

# Check / install dependencies
if ! $PYTHON_CMD -c "import fastapi, uvicorn, sklearn, pandas, reportlab" &>/dev/null; then
    echo "[*] Installing Python dependencies..."
    $PYTHON_CMD -m pip install -r backend/requirements.txt
fi

# Ensure frontend dist is built
if [ ! -f "frontend/dist/index.html" ]; then
    echo "[*] Building frontend production bundle..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo ""
echo "=============================================================================="
echo " >>> SYSTEM READY!"
echo " >>> Application URL : http://127.0.0.1:8000"
echo " >>> API Docs (Swagger): http://127.0.0.1:8000/docs"
echo "=============================================================================="
echo ""

# Try opening the browser
if command -v xdg-open &>/dev/null; then
    xdg-open "http://127.0.0.1:8000" &
elif command -v open &>/dev/null; then
    open "http://127.0.0.1:8000" &
fi

echo "[*] Starting FastAPI unified server on port 8000 (Press CTRL+C to stop)..."
$PYTHON_CMD -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
