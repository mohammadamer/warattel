from pathlib import Path

from .analysis import analyze_recitation
from .celery_app import celery_app
from .repository import Repository

repository = Repository()


@celery_app.task(name='app.tasks.process_recitation_task', bind=True, max_retries=3)
def process_recitation_task(self, recitation_id: str) -> dict[str, object]:
    result = repository.get_recitation(recitation_id)
    if result is None:
        return {'status': 'not_found', 'id': recitation_id}

    repository.update_recitation(
        result.model_copy(
            update={
                'status': 'processing',
                'summary': 'The recitation is being analyzed in the background worker.',
            }
        )
    )

    audio_path = Path('data/audio') / Path(result.audio_uri).name
    audio_size = audio_path.stat().st_size if audio_path.exists() else 0
    analysis = analyze_recitation(result.passage, audio_size)

    repository.update_recitation(
        result.model_copy(
            update={
                'status': 'complete',
                'accuracy': analysis.accuracy,
                'confidence': analysis.confidence,
                'summary': analysis.summary,
                'issues': analysis.issues,
            }
        )
    )

    return {
        'status': 'complete',
        'id': recitation_id,
        'accuracy': analysis.accuracy,
        'confidence': analysis.confidence,
    }
