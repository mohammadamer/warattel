# Warattel API

This service provides the backend for Warattel, including auth, Quran metadata, memorization planning, recitation analysis job orchestration, and analytics.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
redis-server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

In a second terminal, start the worker:

```bash
cd services/api
source .venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

## Health check

- GET /health
- GET /api/v1/status
- GET /api/v1/worker/status
- GET /api/v1/worker/health

## Background worker

The API uses Celery with Redis as the durable job broker for audio analysis. Jobs are queued when a recitation is uploaded and processed asynchronously in the worker. Local development can fall back to direct execution if Redis is not running.

```bash
# start Redis
redis-server

# start the worker
celery -A app.celery_app worker --loglevel=info
```
