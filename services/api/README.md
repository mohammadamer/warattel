# Warattel API

This service provides the backend for Warattel, including auth, Quran metadata, memorization planning, recitation analysis job orchestration, and analytics.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Health check

- GET /health
- GET /api/v1/status
