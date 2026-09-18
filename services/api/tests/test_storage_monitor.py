import io
import os
import tempfile
import unittest

from app.storage import LocalAudioStorage
from app.worker_monitor import WorkerMonitorSnapshot, build_worker_snapshot


class StorageMonitorTest(unittest.TestCase):
    def test_local_storage_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            storage = LocalAudioStorage(base_dir=tmpdir)
            stored_path = storage.save_upload('sample.wav', io.BytesIO(b'audio-bytes'), 'audio/wav')
            self.assertTrue(os.path.exists(stored_path))
            self.assertTrue(stored_path.endswith('sample.wav'))
            self.assertEqual(storage.get_public_url('sample.wav'), '/media/sample.wav')

    def test_monitor_snapshot_reports_health(self) -> None:
        snapshot = build_worker_snapshot(
            worker_available=True,
            active_workers=2,
            queue_size=4,
            processed_jobs=17,
            failed_jobs=1,
        )
        self.assertIsInstance(snapshot, WorkerMonitorSnapshot)
        self.assertTrue(snapshot.is_healthy)
        self.assertEqual(snapshot.queue_size, 4)
        self.assertEqual(snapshot.failed_jobs, 1)


if __name__ == '__main__':
    unittest.main()
