# Warattel

Warattel is a learner-first Quran memorization (Hifz) app for daily planning, Muraja'ah (revision), recitation practice, and explainable recitation feedback.

The current product slice includes:

- React Native and Expo mobile app
- Hifz dashboard and goal/planner flow
- Microphone recording with local-first feedback
- API-backed goal and daily-plan generation
- Authenticated recitation uploads
- SQLite-backed API storage for goals and recitations
- Durable async worker flow for recitation analysis
- Storage abstraction with local filesystem fallback and S3-ready support
- Worker health and monitoring endpoints
- Offline fallback when the API is unavailable

## Repository layout

```text
apps/mobile/       React Native and Expo mobile app
services/api/      FastAPI backend
docs/              Product and architecture decisions
CONTEXT.md         Domain glossary
```

## Run locally

You need Node.js with npm, Python 3.12 or newer, and either an Expo Go device/emulator or a browser. Run the API and mobile app in separate terminals.

### 1. Start Redis

Install Redis locally if it is not already present:

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y redis-server
```

Then start the Redis broker in Terminal 1:

```bash
redis-server
```

### 2. Start the API

In Terminal 2:

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env

# Load the local settings for the current shell.
set -a
source .env
set +a

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Check that the API is running:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

Important endpoints:

- `GET /health`
- `GET /api/v1/status`
- `GET /api/v1/worker/status`
- `GET /api/v1/worker/health`
- `GET /api/v1/worker/monitor`
- `GET /api/v1/storage/status`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/goals`
- `POST /api/v1/goals/{goal_id}/daily-plan`
- `POST /api/v1/recitations`
- `GET /api/v1/recitations/{recitation_id}`

The API uses SQLite by default at `services/api/data/warattel.db`. Uploads are stored through a pluggable storage backend: local files under `services/api/data/audio` by default, or S3-compatible storage when `AWS_S3_BUCKET` is configured.

### 3. Start the worker

In Terminal 3:

```bash
cd services/api
source .venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

The worker exposes a health signal on `GET /api/v1/worker/status` and a richer monitoring payload on `GET /api/v1/worker/monitor`. The mobile app can use these to show whether queue processing is live or whether the service is running in local fallback mode.

### 4. Configure the mobile API URL

In Terminal 4:

```bash
cd apps/mobile
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` according to the target:

- Web or iOS simulator: `http://localhost:8000/api/v1`
- Android emulator: `http://10.0.2.2:8000/api/v1`
- Physical device: `http://<your-computer-lan-ip>:8000/api/v1`

For a physical device, the API must be started with `--host 0.0.0.0`, and the device must be able to reach the computer over the network.

### 5. Start Expo

```bash
npm start
```

Then choose one target:

```bash
npm run web      # http://localhost:8081
npm run android  # Android emulator or device
npm run ios      # iOS simulator, macOS required
```

Alternatively, scan the QR code shown by Expo with Expo Go. The app opens on the authentication screen; register or sign in to use API-backed features, or choose **Continue offline** to use the local fallback.

The first run may prompt for microphone permission. Accept it to test the recitation recording flow and audio upload.

## Validate

```bash
cd apps/mobile
npx tsc --noEmit

cd ../../services/api
python -m compileall -q app
```

## Durable async worker and storage abstraction

Recitation analysis runs through a background worker when Redis is available. The API enqueues a job, and the worker updates the recitation record with the computed accuracy, confidence, and issue breakdown. Storage is handled by a backend abstraction so the same process can use local files during development or move to S3-compatible object storage in production.

Local developer flow:

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: API
cd services/api
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3: worker
cd services/api
source .venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

If Redis is unavailable, the service falls back to a local execution path so the app remains usable during development while clearly reporting degraded status.

## Architecture status

Product decisions are recorded in [docs/warattel-product-decisions.md](docs/warattel-product-decisions.md), the architecture plan is in [docs/warattel-architecture.md](docs/warattel-architecture.md), and domain terminology is in [CONTEXT.md](CONTEXT.md).

The next production work is to add real Quranic alignment and speech-recognition scoring, isolate all records by authenticated user, and tighten production observability around queue failures and storage health. The backend now already includes the durable worker foundation, monitoring, and S3-ready storage abstraction needed for that next step.
