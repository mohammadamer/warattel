# Warattel Architecture Plan

This document turns the agreed product decisions into a v1 technical architecture for React Native and FastAPI.

## Current status

Phase 1 scaffold is complete for the repository: the mobile app shell and API skeleton are in place, and the first user-facing home screen prototype has been created to reflect the Hifz dashboard pattern.

Phase 2 work is now focused on the goal-setting, daily planner, and recitation feedback flow. The mobile app supports microphone permission, local recording, API-backed plan generation, bearer authentication persisted in SecureStore, and queued recitation analysis with local-first fallback. The API provides signed-token auth, SQLite-backed goals, multipart audio storage, and background recitation job processing. Production object storage, multi-user data isolation, and server-side word alignment remain follow-up work.

## Product baseline

The app is a learner-first Hifz coaching platform focused on:

- Quran reading and verse navigation
- personalized memorization goals
- daily Hifz planning
- recitation recording and upload
- AI-powered recitation comparison
- mistake history and weak-passage detection
- retention and consistency analytics
- offline-first operation

These decisions are recorded in [warattel-product-decisions.md](./warattel-product-decisions.md) and the domain language is captured in [../CONTEXT.md](../CONTEXT.md).

---

## 1. Technical stack

### Mobile app

- React Native
- TypeScript
- Expo or a maintained bare React Native setup
- React Navigation
- Zustand for app state
- React Query for server state and caching
- AsyncStorage / SQLite for persistence
- SecureStore / Keychain for sensitive local data
- React Native audio capture libraries for recording
- Firebase Cloud Messaging for push notifications

### Backend

- Python 3.12+
- FastAPI
- Pydantic v2
- PostgreSQL
- Redis
- Celery for async jobs
- JWT auth
- S3-compatible object storage for audio and media

### AI / analysis pipeline

- Audio preprocessing service
- Speech recognition provider abstraction
- Arabic text alignment service
- Word-level comparison engine
- Error classification service
- Confidence scoring and explanation generation

---

## 2. High-level architecture

```text
React Native App
   |
   v
API Gateway / FastAPI
   |
   +----> PostgreSQL
   |
   +----> Redis
   |
   +----> Celery workers
   |
   +----> S3-compatible storage
   |
   +----> AI analysis service
```

### Client responsibilities

- read Quran text and navigate passages
- show daily plan and goals
- record or upload recitation audio
- queue analysis jobs when offline
- display feedback, trends, and weak passages
- persist local user progress and queued actions

### Server responsibilities

- user management and auth
- Quran metadata and verse content
- plan generation and scheduling
- recitation job orchestration
- AI analysis orchestration
- analytics aggregation
- privacy and retention controls

---

## 3. System domains

### 3.1 Quran domain

Purpose: provide Quran text, verse metadata, and reading navigation.

Entities:

- Surah
- Ayah
- VerseRange
- Passage
- PageReference

Core behavior:

- fetch surah/ayah text
- map verse ranges to memorization targets
- support reading and search flows

### 3.2 Memorization domain

Purpose: manage the learning state of a user’s memorization targets.

Entities:

- Goal
- MemorizationTarget
- PassageProgress
- LearningState
- ReviewSession

States:

- new
- active
- review
- weak
- mastered
- paused

Key behavior:

- assign passages to goals
- update progress after recitation
- flag weak sections
- track streaks and reinforcement cycles

### 3.3 Recitation analysis domain

Purpose: compare a user recitation to the expected text and classify errors.

Entities:

- RecitationAttempt
- AudioAsset
- AnalysisJob
- AnalysisResult
- ErrorItem
- ConfidenceScore

Key behavior:

- store audio before or after analysis
- schedule alignment and comparison
- return missing/extra/substituted words
- classify diacritic or tajweed-related risk
- preserve uncertainty explicitly

### 3.4 Planning domain

Purpose: generate a realistic daily Hifz plan based on effort, retention, and learner history.

Entities:

- DailyPlan
- PlanItem
- Recommendation
- WeakPassageSignal

Key behavior:

- prioritize passages with high risk or decay
- adjust workload based on recent performance
- prefer small purposeful sessions over rigid schedules

### 3.5 Analytics domain

Purpose: surface learner insights without misleading simplification.

Entities:

- AccuracyTrend
- RetentionTrend
- MistakeHistory
- WeakPassageSummary
- StreakSummary

Key behavior:

- aggregate by day/week/month
- surface strong vs weak areas
- visualize trend changes over time

---

## 4. V1 feature map

### Core features

1. Quran reader
   - surah and ayah navigation
   - search and bookmark support

2. Memorization goals
   - create goal for verse range or custom passage
   - track due and completed work

3. Daily plan
   - generate personalized daily practice list
   - support multiple short sessions

4. Recitation workflow
   - record live recitation
   - upload recorded audio
   - queue AI analysis

5. Feedback view
   - corrected text comparison
   - missing/extra/substituted words
   - confidence indicator
   - “possible issue” model for uncertain recognition

6. Progress dashboard
   - streaks
   - retention trend
   - weak passages
   - mistake history

7. Offline-first support
   - queued analysis
   - cached Quran data
   - local-first progress syncing

### Deferred features

- teacher dashboards
- family or school supervision
- collaborative learning views
- advanced teacher feedback workflows
- broader social features

---

## 5. Suggested app structure

```text
apps/
  mobile/
    src/
      app/
      features/
        auth/
        onboarding/
        home/
        quran/
        memorization/
        revision/
        recitation/
        analytics/
        settings/
        profile/
      shared/
        components/
        hooks/
        services/
        theme/
        utils/
      store/
      navigation/
      types/

services/
  api/
    app/
    core/
    features/
      auth/
      quran/
      memorization/
      planning/
      recitation/
      analytics/
    workers/
      celery/
    infra/
      db/
      auth/
      storage/
```

---

## 6. Core user flows

### Flow A: set a goal

1. User chooses a verse range or custom passage
2. System creates MemorizationTarget
3. System stores initial LearningState
4. Daily plan generation begins

### Flow B: daily practice

1. User opens today’s plan
2. User studies target passage
3. User recites from memory
4. User records audio or uploads existing audio
5. Audio is queued for AI analysis
6. Results are returned with word-level corrections
7. Learner can review mistakes and update progress

### Flow C: weak-passage detection

1. System aggregates history across attempts
2. Misses and retention drop are analyzed
3. Passage is marked weak if risk threshold is crossed
4. Plan generator increases reinforcement for that passage

---

## 7. Data model highlights

### User

- id
- name
- locale
- learning preferences
- privacy settings

### Goal

- id
- user_id
- title
- target_type
- passage_reference
- created_at
- target_deadline

### MemorizationTarget

- id
- goal_id
- passage_id
- status
- start_date
- last_reviewed_at
- mastery_score
- weak_score

### RecitationAttempt

- id
- user_id
- target_id
- audio_url
- recorded_at
- analysis_status
- confidence_summary

### AnalysisResult

- id
- attempt_id
- total_words
- correct_words
- missing_words
- extra_words
- substituted_words
- confidence
- issue_summary

---

## 8. Offline-first design

The app should support the important learning loop without network connectivity.

### Offline capabilities

- read cached Quran data
- review memorization goals and plan
- record audio locally
- queue analysis jobs
- sync later when online

### Sync policies

- local-first writes
- queued jobs with retry
- user-visible sync status
- explicit handling of partial network failures

---

## 9. Key engineering principles

- Keep the learner’s trust central: no fake certainty in AI results
- Prefer explainable feedback over vague scores
- Treat weak passages as a first-class concept
- Build analytics around actual learning behavior, not vanity metrics
- Keep the v1 scope focused on the learning loop

---

## 10. v1 implementation roadmap

### Phase 1: foundation

- app shell and navigation
- auth and onboarding
- Quran text and passage data
- local persistence and offline queue

### Phase 2: learning core

- goals and target creation
- daily plan generation
- progress tracking
- review flow

### Phase 3: recitation analysis

- recording and uploading audio
- job queue and async analysis
- feedback result model
- error classification UI

### Phase 4: analytics and retention

- weak passage detection
- trends and dashboards
- streak and mastery summaries

### Phase 5: polish and release readiness

- privacy controls
- queue reliability
- performance tuning
- app-store readiness

---

## 11. Recommendation

Build v1 around a clear product loop:

Daily plan → recite → analyze → explain → improve → repeat.

This loop is the true product differentiator and the most important thing to validate before expanding into additional features or teacher workflows.
