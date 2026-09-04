# ==============================================================================
# SPACEGUARD AI - Unified Multi-Stage Production Dockerfile (SIH 2026)
# Builds React Frontend & packages with FastAPI Backend into a single container
# ==============================================================================

# ---- Stage 1: Build React 18 + Vite Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Python 3.11 Slim Production Backend ----
FROM python:3.11-slim

WORKDIR /app

# Install minimal OS dependencies for scikit-learn & reportlab
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy Backend Code
COPY backend /app/backend

# Copy Built Frontend Distribution from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /build/dist /app/frontend/dist

# Set environment variables
ENV PYTHONPATH=/app
ENV DATABASE_URL=sqlite:///./spaceguard.db
ENV PORT=8000

# Create upload and reports directory
RUN mkdir -p /app/uploads /app/reports /app/backend/data

EXPOSE 8000

# Start Unified Service
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
