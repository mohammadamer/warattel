import os
from dataclasses import dataclass
from typing import Literal

from redis import Redis

from .celery_app import celery_app


@dataclass(frozen=True)
class WorkerStatus:
    mode: Literal['redis', 'local-fallback']
    overall: Literal['healthy', 'degraded', 'offline']
    broker: str
    worker: str
    is_ready: bool


def get_worker_status(
    worker_available: bool,
    redis_available: bool,
    broker_url: str | None = None,
) -> WorkerStatus:
    broker = broker_url or os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    if worker_available and redis_available:
        return WorkerStatus(mode='redis', overall='healthy', broker=broker, worker='celery', is_ready=True)
    if redis_available:
        return WorkerStatus(mode='redis', overall='degraded', broker=broker, worker='celery', is_ready=False)
    return WorkerStatus(mode='local-fallback', overall='degraded', broker='local', worker='local-worker', is_ready=False)


def detect_worker_status() -> WorkerStatus:
    broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    try:
        client = Redis.from_url(broker_url, decode_responses=True)
        client.ping()
        redis_available = True
    except Exception:
        return get_worker_status(False, False, broker_url)

    try:
        worker_ping = celery_app.control.inspect(timeout=2).ping()
        worker_available = bool(worker_ping)
    except Exception:
        worker_available = False

    return get_worker_status(worker_available, redis_available, broker_url)
