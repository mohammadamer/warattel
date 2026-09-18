import unittest

from app.worker_status import WorkerStatus, get_worker_status


class WorkerStatusTest(unittest.TestCase):
    def test_returns_enabled_status_when_worker_is_healthy(self) -> None:
        status = get_worker_status(worker_available=True, redis_available=True)
        self.assertEqual(status.mode, 'redis')
        self.assertEqual(status.overall, 'healthy')
        self.assertTrue(status.is_ready)

    def test_returns_fallback_status_when_redis_is_unavailable(self) -> None:
        status = get_worker_status(worker_available=False, redis_available=False)
        self.assertEqual(status.mode, 'local-fallback')
        self.assertEqual(status.overall, 'degraded')
        self.assertFalse(status.is_ready)


if __name__ == '__main__':
    unittest.main()
