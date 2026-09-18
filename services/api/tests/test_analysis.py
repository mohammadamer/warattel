import unittest

from app.analysis import analyze_recitation


class AnalyzeRecitationTest(unittest.TestCase):
    def test_generates_feedback_for_a_passage(self) -> None:
        result = analyze_recitation(
            passage='بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            audio_size_bytes=240000,
        )

        self.assertIn(result.status, {'processing', 'complete'})
        self.assertGreaterEqual(result.accuracy, 0)
        self.assertLessEqual(result.accuracy, 100)
        self.assertIn(result.confidence, {'high', 'medium', 'low'})
        self.assertTrue(result.summary)
        self.assertIsInstance(result.issues, list)
        self.assertGreaterEqual(len(result.issues), 1)

    def test_marks_short_audio_as_low_confidence(self) -> None:
        result = analyze_recitation(
            passage='اللَّهُ أَكْبَر',
            audio_size_bytes=25000,
        )

        self.assertLess(result.accuracy, 90)
        self.assertIn(result.confidence, {'low', 'medium'})


if __name__ == '__main__':
    unittest.main()
