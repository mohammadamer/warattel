import sqlite3
from pathlib import Path
from uuid import uuid4

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from .auth import create_token, decode_token, hash_password, new_user_id, verify_password
from .repository import Repository
from .schemas import AuthCredentials, AuthResponse, DailyPlan, Goal, GoalCreate, PlanItem, RecitationResult

app = FastAPI(title='Warattel API', version='0.1.0')

repository = Repository()
audio_directory = Path('data/audio')
audio_directory.mkdir(parents=True, exist_ok=True)
app.mount('/media', StaticFiles(directory=audio_directory), name='media')
bearer_scheme = HTTPBearer()


@app.get('/health')
def health_check() -> dict[str, str]:
    return {'status': 'ok'}


@app.get('/api/v1/status')
def api_status() -> dict[str, str]:
    return {'service': 'warattel-api', 'status': 'ready'}


@app.post('/api/v1/auth/register', response_model=AuthResponse, status_code=201)
def register(payload: AuthCredentials) -> AuthResponse:
    user_id = new_user_id()
    try:
        repository.create_user(user_id, payload, hash_password(payload.password))
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail='Email is already registered') from error
    return AuthResponse(access_token=create_token(user_id))


@app.post('/api/v1/auth/login', response_model=AuthResponse)
def login(payload: AuthCredentials) -> AuthResponse:
    user = repository.get_user(payload.email)
    if user is None or not verify_password(payload.password, user[1]):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    return AuthResponse(access_token=create_token(user[0]))


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    user_id = decode_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status_code=401, detail='Invalid or expired access token')
    return user_id


@app.post('/api/v1/goals', response_model=Goal, status_code=201)
def create_goal(payload: GoalCreate, _: str = Depends(current_user)) -> Goal:
    goal = Goal(id=str(uuid4()), **payload.model_dump())
    return repository.create_goal(goal)


@app.get('/api/v1/goals', response_model=list[Goal])
def list_goals(_: str = Depends(current_user)) -> list[Goal]:
    return repository.list_goals()


@app.post('/api/v1/goals/{goal_id}/daily-plan', response_model=DailyPlan)
def create_daily_plan(goal_id: str, _: str = Depends(current_user)) -> DailyPlan:
    goal = repository.get_goal(goal_id)
    if goal is None:
        raise HTTPException(status_code=404, detail='Goal not found')

    return DailyPlan(
        goal_id=goal.id,
        items=[
            PlanItem(
                id=str(uuid4()),
                title=f'{goal.title}: {goal.target}',
                type='memorize',
                duration_minutes=goal.duration_minutes,
                status='in-progress',
            ),
            PlanItem(
                id=str(uuid4()),
                title='Review previous ayah set',
                type='review',
                duration_minutes=10,
                status='pending',
            ),
            PlanItem(
                id=str(uuid4()),
                title='Recitation check',
                type='test',
                duration_minutes=12,
                status='pending',
            ),
        ],
    )


@app.post('/api/v1/recitations', response_model=RecitationResult, status_code=202)
def queue_recitation(
    background_tasks: BackgroundTasks,
    passage: str = Form(..., min_length=1, max_length=160),
    audio: UploadFile = File(...),
    _: str = Depends(current_user),
) -> RecitationResult:
    if audio.content_type not in {'audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a'}:
        raise HTTPException(status_code=415, detail='Unsupported audio format')

    recitation_id = str(uuid4())
    file_extension = Path(audio.filename or 'recitation.m4a').suffix.lower() or '.m4a'
    stored_filename = f'{recitation_id}{file_extension}'
    stored_path = audio_directory / stored_filename
    with stored_path.open('wb') as output:
        output.write(audio.file.read())

    result = RecitationResult(
        id=recitation_id,
        passage=passage,
        audio_uri=f'/media/{stored_filename}',
        status='queued',
        summary='Audio received. Analysis is queued for alignment and feedback.',
        issues=[],
    )
    repository.create_recitation(result)
    background_tasks.add_task(process_recitation, result.id)
    return result


@app.get('/api/v1/recitations/{recitation_id}', response_model=RecitationResult)
def get_recitation(recitation_id: str, _: str = Depends(current_user)) -> RecitationResult:
    result = repository.get_recitation(recitation_id)
    if result is None:
        raise HTTPException(status_code=404, detail='Recitation not found')
    return result


def process_recitation(recitation_id: str) -> None:
    result = repository.get_recitation(recitation_id)
    if result is None:
        return
    repository.update_recitation(
        result.model_copy(
            update={
                'status': 'complete',
                'confidence': 'low',
                'summary': 'Audio stored. Word-level alignment is ready for the analysis worker.',
            }
        )
    )
