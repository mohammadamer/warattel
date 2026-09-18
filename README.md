# Warattel

Warattel is a learner-first Quran memorization (Hifz) app for daily planning, Muraja'ah (revision), recitation practice, and explainable recitation feedback.

The current product slice includes:

- React Native and Expo mobile app
- Hifz dashboard and goal/planner flow
- Microphone recording with local-first feedback
- API-backed goal and daily-plan generation
- Authenticated recitation uploads
- SQLite-backed API storage
- Background recitation job lifecycle
- Offline fallback when the API is unavailable

## Repository layout

```text
apps/mobile/       React Native and Expo mobile app
services/api/      FastAPI backend
docs/              Product and architecture decisions
CONTEXT.md         Domain glossary
```

## Run the API

```bash
cd services/api
cp .env.example .env
/home/codespace/.python/current/bin/python -m pip install -r requirements.txt
/home/codespace/.python/current/bin/uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`.

Important endpoints:

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/goals`
- `POST /api/v1/goals/{goal_id}/daily-plan`
- `POST /api/v1/recitations`
- `GET /api/v1/recitations/{recitation_id}`

The current API uses SQLite by default at `services/api/data/warattel.db`. Set `WARATTEL_DB_PATH` to change the location. Uploaded audio is stored locally under `services/api/data/audio`.

## Run the mobile app

```bash
cd apps/mobile
npm install
cp .env.example .env
npm start
```

Use `npm run ios`, `npm run android`, or `npm run web` for a target-specific launch. Configure `EXPO_PUBLIC_API_URL` for the target environment:

- iOS simulator: `http://localhost:8000/api/v1`
- Android emulator: `http://10.0.2.2:8000/api/v1`
- Physical device: use the API host machine's LAN IP

The mobile app supports account registration, sign-in, SecureStore token persistence, and a local offline entry path.

## Validate

```bash
cd apps/mobile
npx tsc --noEmit

cd ../../services/api
python -m compileall -q app
```

## Architecture status

Product decisions are recorded in [docs/warattel-product-decisions.md](docs/warattel-product-decisions.md), the architecture plan is in [docs/warattel-architecture.md](docs/warattel-architecture.md), and domain terminology is in [CONTEXT.md](CONTEXT.md).

The next production work is to replace local audio storage with object storage, move background processing to a durable worker such as Celery, isolate all records by authenticated user, and add real Quran alignment and recitation analysis.
