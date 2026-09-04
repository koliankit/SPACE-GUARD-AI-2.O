@echo off
TITLE SPACEGUARD AI - SIH 2026 Live Demo
cls

echo ==============================================================================
echo                 🛰️ SPACEGUARD AI — SIH 2026 LIVE DEMO
echo      Real-Time Intelligent Reliability Monitoring for Spacecraft Components
echo ==============================================================================
echo.
echo [*] Checking runtime environment...

:: Check if virtual environment exists
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=.venv\Scripts\python.exe"
    echo [*] Using Virtual Environment: .venv\Scripts\python.exe
) else (
    :: Detect Python launcher or python executable
    set PYTHON_CMD=py
    %PYTHON_CMD% --version >nul 2>&1
    if %errorlevel% neq 0 (
        set PYTHON_CMD=python
        %PYTHON_CMD% --version >nul 2>&1
        if %errorlevel% neq 0 (
            echo [ERROR] Python was not found in PATH!
            echo Please ensure Python 3.10+ is installed from python.org.
            pause
            exit /b 1
        )
    )
    echo [*] Using Python: %PYTHON_CMD%
)

:: Ensure requirements are installed
echo [*] Checking Python dependencies...
%PYTHON_CMD% -c "import fastapi, uvicorn, sklearn, pandas, reportlab" >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Installing required Python packages...
    %PYTHON_CMD% -m pip install -r backend/requirements.txt
)

:: Ensure frontend dist exists
if not exist "frontend\dist\index.html" (
    echo [*] Building frontend production bundle...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo.
echo ==============================================================================
echo  >>> SYSTEM READY!
echo  >>> Application URL : http://127.0.0.1:8000
echo  >>> API Docs (Swagger): http://127.0.0.1:8000/docs
echo ==============================================================================
echo.
echo [*] Opening default web browser to http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000"

echo [*] Starting FastAPI unified server on port 8000 (Press CTRL+C to stop)...
%PYTHON_CMD% -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

pause
