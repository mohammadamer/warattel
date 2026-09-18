import os
from dataclasses import dataclass
from typing import Literal

from redis import Redis

from .celery_app import celery_app


@dataclass(frozen=True)
class WorkerMonitorSnapshot:
    mode: Literal['redis', 'local-fallback']
    is_healthy: bool
    queue_size: int
    active_workers: int
    processed_jobs: int
    failed_jobs: int
    broker: str


def build_worker_snapshot(
    worker_available: bool,
    active_workers: int = 0,
    queue_size: int = 0,
    processed_jobs: int = 0,
    failed_jobs: int = 0,
    broker_url: str | None = None,
) -> WorkerMonitorSnapshot:
    broker = broker_url or os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    return WorkerMonitorSnapshot(
        mode='redis' if worker_available else 'local-fallback',
        is_healthy=worker_available,
        queue_size=queue_size,
        active_workers=active_workers,
        processed_jobs=processed_jobs,
        failed_jobs=failed_jobs,
        broker=broker,
    )


def detect_worker_monitor_snapshot() -> WorkerMonitorSnapshot:
    broker_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    try:
        client = Redis.from_url(broker_url, decode_responses=True)
        client.ping()
        redis_available = True
    except Exception:
        return build_worker_snapshot(False, broker_url=broker_url)

    try:
        inspect = celery_app.control.inspect(timeout=2)
        active = inspect.active() or {}
        stats = inspect.stats() or {}
        worker_available = bool(active or stats)
        active_workers = len(active)
        queue_size = sum(len(items) for items in active.values())
        processed_jobs = 0
        failed_jobs = 0
        for worker_data in stats.values():
            totals = worker_data.get('total', {}) if isinstance(worker_data, dict) else {}
            processed_jobs += int(totals.get('task-succeeded', 0) or 0)
            failed_jobs += int(totals.get('task-failed', 0) or 0)
        return build_worker_snapshot(
            worker_available=worker_available,
            active_workers=active_workers,
            queue_size=queue_size,
            processed_jobs=processed_jobs,
            failed_jobs=failed_jobs,
            broker_url=broker_url,
        )
    except Exception:
        return build_worker_snapshot(False, broker_url=broker_url)
