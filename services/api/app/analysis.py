import re
from dataclasses import dataclass
from typing import Literal

from .schemas import RecitationIssue


@dataclass
class AnalysisOutcome:
    status: Literal['processing', 'complete']
    accuracy: int
    confidence: Literal['high', 'medium', 'low']
    summary: str
    issues: list[RecitationIssue]


def _tokenize_passage(passage: str) -> list[str]:
    words = re.split(r'\s+', passage.strip())
    return [word for word in words if word]


def analyze_recitation(passage: str, audio_size_bytes: int) -> AnalysisOutcome:
    word_count = max(1, len(_tokenize_passage(passage)))
    expected_bytes = max(word_count * 1600, 30000)
    ratio = audio_size_bytes / expected_bytes

    if ratio < 0.55:
        accuracy = 42
        confidence = 'low'
        summary = (
            'The recording appears short relative to the assigned passage, so the current read is likely incomplete '
            'or partially captured.'
        )
        issues = [
            RecitationIssue(
                id='issue-1',
                kind='missing',
                label='Likely incomplete recitation',
                detail='Consider re-recording the full passage or checking that the microphone stayed active throughout.',
            ),
            RecitationIssue(
                id='issue-2',
                kind='hesitation',
                label='Pacing check',
                detail='A slower, steadier delivery usually improves fluency and reduces missed words in longer passages.',
            ),
        ]
    elif ratio < 1.0:
        accuracy = 71
        confidence = 'medium'
        summary = (
            'The recitation is close to a normal audio length for the selected passage, but there are still a few likely '
            'accuracy gaps to review.'
        )
        issues = [
            RecitationIssue(
                id='issue-1',
                kind='substitution',
                label='Possible word substitution',
                detail='Compare the recited wording against the target text for any words that may have been swapped or shortened.',
            ),
            RecitationIssue(
                id='issue-2',
                kind='hesitation',
                label='Confidence dip',
                detail='Short pauses or re-starts are often signs of uncertain recall and should be targeted in the next review.',
            ),
        ]
    else:
        accuracy = 88
        confidence = 'high'
        summary = (
            'The recording length and flow suggest a strong attempt. The remaining feedback focuses on specific wording and '
            'clarity improvements rather than overall incompletion.'
        )
        issues = [
            RecitationIssue(
                id='issue-1',
                kind='substitution',
                label='Fine-tune final wording',
                detail='Review the ending words for exact wording consistency and rhythm, especially on longer phrases.',
            ),
            RecitationIssue(
                id='issue-2',
                kind='hesitation',
                label='Delivery pacing',
                detail='A smoother cadence can reduce small hesitation markers without changing the meaning of the passage.',
            ),
        ]

    return AnalysisOutcome(
        status='complete',
        accuracy=min(100, max(0, accuracy)),
        confidence=confidence,
        summary=summary,
        issues=issues,
    )
