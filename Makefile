.PHONY: help install build test run dev-backend dev-frontend demo docker-build docker-run deploy-vercel streamlit clean

PYTHON ?= .venv/Scripts/python
ifeq ($(OS),Windows_NT)
    PYTHON := $(shell if exist .venv\Scripts\python.exe (echo .venv\Scripts\python.exe) else (echo py))
else
    PYTHON := $(shell if [ -f .venv/bin/python ]; then echo .venv/bin/python; else echo python3; fi)
endif

help:
	@echo "=============================================================================="
	@echo "               SPACEGUARD AI — SIH 2026 Build and Run Commands"
	@echo "=============================================================================="
	@echo "  make install       Install backend requirements into .venv and frontend npm packages"
	@echo "  make build         Compile React frontend into production bundle (frontend/dist)"
	@echo "  make run           Run unified production server on http://127.0.0.1:8000"
	@echo "  make test          Run complete automated pytest test suite"
	@echo "  make dev-backend   Run FastAPI backend with live reload"
	@echo "  make dev-frontend  Run Vite frontend development server"
	@echo "  make streamlit     Run interactive Streamlit Mission Control dashboard"
	@echo "  make docker-build  Build multi-stage production Docker image"
	@echo "  make docker-run    Run Docker container on port 8000"
	@echo "  make deploy-vercel Deploy frontend to Vercel"

install:
	$(PYTHON) -m pip install -r backend/requirements.txt
	cd frontend && npm install

build:
	cd frontend && npm run build

run:
	$(PYTHON) -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

test:
	$(PYTHON) -m pytest backend/tests -v

dev-backend:
	$(PYTHON) -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

dev-frontend:
	cd frontend && npm run dev

docker-build:
	docker build -t spaceguard-ai .

docker-run:
	docker run -p 8000:8000 spaceguard-ai

deploy-vercel:
	cd frontend && npx vercel --prod

streamlit:
	$(PYTHON) -m streamlit run streamlit_app.py
