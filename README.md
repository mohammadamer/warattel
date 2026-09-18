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

## Run locally

You need Node.js with npm, Python 3.12 or newer, and either an Expo Go device/emulator or a browser. Run the API and mobile app in separate terminals.

### 1. Start the API

In Terminal 1:

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
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/goals`
- `POST /api/v1/goals/{goal_id}/daily-plan`
- `POST /api/v1/recitations`
- `GET /api/v1/recitations/{recitation_id}`

The API uses SQLite by default at `services/api/data/warattel.db`. Uploaded audio is stored locally under `services/api/data/audio`.

### 2. Configure the mobile API URL

In Terminal 2:

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

### 3. Start Expo

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

## Architecture status

Product decisions are recorded in [docs/warattel-product-decisions.md](docs/warattel-product-decisions.md), the architecture plan is in [docs/warattel-architecture.md](docs/warattel-architecture.md), and domain terminology is in [CONTEXT.md](CONTEXT.md).

The next production work is to replace local audio storage with object storage, move background processing to a durable worker such as Celery, isolate all records by authenticated user, and add real Quran alignment and recitation analysis.
