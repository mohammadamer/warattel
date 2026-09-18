# MASTER PROMPT — BUILD AN AI-POWERED QURAN & HIFZ APPLICATION

You are a senior software architect, product engineer, UI/UX designer, AI/ML engineer, Quran application specialist, DevOps engineer, QA engineer, and security engineer.

Your task is to design and implement a production-quality mobile application for Quran reading, memorization (Hifz), Muraja'ah (revision), recitation practice, AI-powered recitation analysis, and personalized Hifz planning.

The working project name is:

**Warattel**

You may structure the codebase so the application name can easily be changed later.

The application should be inspired by the general functionality of modern Quran memorization applications, including AI-assisted recitation, but MUST NOT copy proprietary source code, copyrighted assets, branding, logos, exact UI designs, or proprietary implementation details from any existing application.

The goal is to build an original product with a stronger emphasis on:

> "Your personal AI Hifz coach."

---

# 1. PRODUCT VISION

Build a Quran application where a user can:

1. Read the Quran.
2. Listen to recitations.
3. Search the Quran.
4. Memorize Quranic passages.
5. Hide verses and recite from memory.
6. Have their recitation analyzed by AI.
7. Detect missing, added, or incorrect words.
8. Detect possible tashkeel/diacritic mistakes where technically reliable.
9. Receive immediate feedback.
10. Review historical mistakes.
11. Automatically identify weak portions of memorization.
12. Create memorization and revision goals.
13. Receive an automatically generated daily Hifz plan.
14. Take AI-generated memorization tests.
15. Practice similar/commonly-confused verses.
16. Track memorization progress.
17. Track Muraja'ah.
18. Track streaks and achievements.
19. Review detailed analytics.
20. Listen to different Qaris.
21. Download audio for offline listening.
22. Use the application in multiple languages.
23. Eventually connect students with teachers.
24. Eventually support families, Hifz schools, and Quran teachers.

The application should feel like:

**Quran reader + Hifz tracker + AI recitation teacher + revision planner + memorization analytics platform.**

---

# 2. PRIMARY TECHNOLOGY STACK

Use the following technology stack unless there is a compelling technical reason to deviate.

## Mobile application

Use:

**React Native + TypeScript**

Target:

* Android
* iOS

Use a modern React Native architecture with:

* React Native
* TypeScript
* Expo or a maintained bare React Native setup as appropriate
* React Navigation for app navigation
* Zustand or Redux Toolkit for state management
* RTK Query or a similar async data layer for API access
* React Query for caching and server state management
* SQLite or Realm for local persistence depending on the use case
* SecureStore / Keychain for sensitive local data
* Firebase Cloud Messaging for push notifications
* Firebase Analytics only where privacy requirements permit it

The architecture must support offline-first operation.

Do NOT build the application as a simple collection of screens.

Use clean separation between:

```text
Presentation
Domain
Data
Infrastructure
```

Recommended structure:

```text
lib/
  core/
    config/
    constants/
    errors/
    localization/
    networking/
    storage/
    theme/
    utils/

  features/
    auth/
    onboarding/
    home/
    quran/
    mushaf/
    audio/
    recitation/
    ai_recitation/
    memorization/
    murajaah/
    testing/
    goals/
    analytics/
    mistakes/
    bookmarks/
    search/
    settings/
    profile/
    notifications/

  shared/
    widgets/
    models/
    services/
```

---

# 3. BACKEND

Use:

**Python 3.12+**

with:

**FastAPI**

for the main API.

Use:

* Pydantic
* SQLAlchemy 2.x
* Alembic
* PostgreSQL
* Redis
* Celery or another robust background-job system where needed
* WebSocket support for real-time recitation sessions
* JWT/OAuth authentication
* S3-compatible object storage for audio assets where legally permitted

Architecture:

```text
Flutter Mobile App
        |
        v
   API Gateway
        |
        v
     FastAPI
        |
   +----+----+
   |         |
PostgreSQL Redis
   |
   +----------------+
   |                |
Hifz Engine     User Data
   |
   +----------------+
   |
AI Recitation Service
```

Keep the AI service modular so that the speech-recognition provider can be replaced later.

---

# 4. AI / SPEECH ARCHITECTURE

This is the most technically important part of the application.

Do NOT assume ordinary speech-to-text is sufficient.

The system must ultimately perform:

```text
Audio
  ↓
Audio preprocessing
  ↓
Speech recognition
  ↓
Arabic/Quran recognition
  ↓
Quran text alignment
  ↓
Word-level comparison
  ↓
Error classification
  ↓
Confidence calculation
  ↓
UI feedback
  ↓
Hifz analytics
```

Create an abstraction:

```dart
abstract class RecitationAnalysisService {
  Future<RecitationAnalysis> analyze(
    AudioRecording recording,
    QuranPassage expectedPassage,
  );
}
```

Backend equivalent:

```python
class RecitationAnalyzer(Protocol):
    async def analyze(
        self,
        audio: AudioInput,
        expected_passage: QuranPassage,
    ) -> RecitationAnalysis:
        ...
```

The provider must be replaceable.

Potential implementations can include:

```text
CloudSpeechRecognitionProvider
LocalSpeechRecognitionProvider
CustomQuranASRProvider
HybridRecognitionProvider
```

Do not hard-code the application to a single AI provider.

---

# 5. RECITATION ANALYSIS

The application must represent each recitation at word level.

Example:

Expected:

```text
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
```

Recognized:

```text
الْحَمْدُ لِلَّهِ مَلِكِ الْعَالَمِينَ
```

The analysis engine should produce something conceptually like:

```json
{
  "status": "mistake_detected",
  "confidence": 0.96,
  "words": [
    {
      "expected": "الْحَمْدُ",
      "recognized": "الْحَمْدُ",
      "status": "correct"
    },
    {
      "expected": "لِلَّهِ",
      "recognized": "لِلَّهِ",
      "status": "correct"
    },
    {
      "expected": "رَبِّ",
      "recognized": "مَلِكِ",
      "status": "incorrect"
    },
    {
      "expected": "الْعَالَمِينَ",
      "recognized": "الْعَالَمِينَ",
      "status": "correct"
    }
  ]
}
```

Support these error categories:

```text
CORRECT
WRONG_WORD
MISSING_WORD
EXTRA_WORD
WORD_ORDER
UNCERTAIN
TASHKEEL_POSSIBLE_ERROR
REPETITION
INCOMPLETE
```

Never present an uncertain AI result as unquestionably correct.

Use confidence thresholds.

For example:

```text
confidence >= 0.90
    high confidence

0.70 - 0.89
    medium confidence

< 0.70
    uncertain
```

Make these thresholds configurable.

---

# 6. QURAN DATA

The Quran is sacred content and must be handled with exceptional care.

Do NOT generate Quran text using an LLM.

Do NOT reconstruct Quran text from OCR.

Do NOT allow users or administrators to arbitrarily edit canonical Quran text.

Use a trusted, properly licensed Quran text source.

Store canonical Arabic text separately from:

* translations
* transliterations
* tafsir
* metadata
* user annotations

Every Quran text version should have:

```text
edition_id
name
language
script
riwayah/qira'ah
source
license
version
checksum
```

Support at minimum:

* Madani/Uthmani-style script
* Indo-Pak script where legally/licensing-wise possible

Design the schema to support multiple riwayat/qira'at in the future.

---

# 7. QURAN DATABASE MODEL

Create entities such as:

```text
QuranEdition
Surah
Ayah
AyahWord
Juz
Hizb
Rub
Page
Manzil
Sajdah
Recitation
Reciter
Translation
Tafsir
```

Relationships must allow:

```text
Quran
 └── Surah
      └── Ayah
           └── Word
```

Each word should have:

```text
id
ayah_id
position
text
normalized_text
tashkeel_form
search_form
```

Do not modify canonical text during normalization.

Normalization must operate on a separate representation.

---

# 8. QURAN READER

Build a beautiful, distraction-free Quran reader.

Features:

* Surah list
* Juz list
* Hizb navigation
* Page navigation
* Ayah navigation
* Search
* Bookmark
* Last-read position
* Translation
* Transliteration
* Tafsir
* Font size
* Multiple Quran scripts
* Light theme
* Dark theme
* System theme
* Tajweed colors
* Hide/show ayah numbers
* Hide/show translation
* Hide/show transliteration
* Page mode
* Ayah mode

Allow the user to tap an ayah to open an action menu:

```text
Listen
Memorize
Test
Bookmark
Share
Translation
Tafsir
Add note
Start from here
```

---

# 9. TAJWEED DISPLAY

Support optional Tajweed visualization.

The application should be able to visually distinguish categories such as:

* Madd
* Ghunnah
* Qalqalah
* Tafkhim
* Silent letters

The actual Tajweed classification must come from a validated Quran/Tajweed dataset rather than an LLM guessing the rules.

Provide:

```text
Settings
→ Quran Appearance
→ Tajweed Colors
```

Allow users to enable/disable it.

---

# 10. AUDIO ENGINE

Implement:

* Qari selection
* Play/pause
* Seek
* Previous/next ayah
* Repeat ayah
* Repeat range
* Repeat N times
* Custom range
* Ayah-by-ayah mode
* Word-by-word mode where audio data supports it
* Playback speed
* Background playback
* Lock-screen controls
* Download for offline playback
* Audio cache
* Download management

Design audio storage so the application can support multiple Qaris without requiring a separate implementation for each.

---

# 11. MEMORIZATION MODE

This is a central feature.

User selects:

```text
Surah
Ayah range
Page
Juz
Custom range
```

Then chooses:

```text
Hide all
Hide selected words
Hide selected ayahs
Progressive hiding
```

During memorization:

```text
Quran text hidden
        ↓
User recites
        ↓
AI listens
        ↓
AI identifies passage
        ↓
AI compares recitation
        ↓
Mistakes highlighted
```

Support a "peek" function.

The user should be able to reveal:

* One word
* Current ayah
* Entire ayah
* Next ayah

Record every peek as part of session analytics.

---

# 12. RECITATION SESSION

Every session should produce a structured record.

Example:

```text
RecitationSession

id
user_id
started_at
ended_at
surah_id
start_ayah
end_ayah
mode
accuracy
words_attempted
words_correct
mistakes_count
peeks_count
duration_seconds
audio_reference
```

Each mistake:

```text
Mistake

id
session_id
user_id
surah_id
ayah_id
word_id
expected_text
recognized_text
mistake_type
confidence
timestamp
resolved
```

Allow users to delete an incorrectly detected mistake from their history.

---

# 13. MISTAKE HISTORY

Create a dedicated Mistakes screen.

Filters:

```text
Today
This week
This month
All time
Surah
Juz
Mistake type
```

Display:

```text
Most repeated mistakes
Most difficult ayahs
Most difficult words
Mistake frequency
Recent mistakes
Resolved mistakes
Unresolved mistakes
```

Clicking a mistake should open:

```text
Ayah
Expected word
What AI heard
Audio playback
Correct recitation
Practice button
Add to revision
```

---

# 14. MURAJAAH ENGINE

Build a dedicated revision engine.

The engine should calculate revision priority based on:

```text
time_since_last_review
mistake_frequency
recent_accuracy
number_of_successful_reviews
memorization_age
user_defined_priority
similarity_confusion
```

Create a configurable scoring system.

Example conceptual formula:

```text
revision_priority =
    forgetting_risk
    + mistake_weight
    + age_weight
    + user_priority
    + confusion_weight
```

Do not claim that this mathematically predicts memory unless scientifically validated.

Call it:

**Revision Priority Score**

rather than "memory certainty."

---

# 15. AUTOMATIC DAILY PLAN

The user specifies:

```text
Goal
Deadline
Daily available time
Current memorized range
Preferred review frequency
```

Generate:

```text
Today's Hifz Plan

New Memorization
- Surah X, Ayah 1–8

Muraja'ah
- Surah Y, Ayah 20–30

Weak Area
- Surah Z, Ayah 14

AI Test
- 10 random prompts
```

The plan must dynamically adapt.

If the user misses a day:

Do not simply duplicate the schedule.

Recalculate the remaining workload.

---

# 16. GOALS

Support:

```text
Memorize
Review
Recite
Complete Quran
```

Each goal should support:

```text
name
Quran range
start date
target date
schedule
daily/weekly amount
portion
reverse order
active/inactive
```

Examples:

```text
Memorize Juz 30 in 60 days
Review Juz 29 every week
Recite Surah Al-Kahf every Friday
Complete Quran recitation in 30 days
```

Support multiple simultaneous goals.

---

# 17. HIFZ TESTING ENGINE

Build an AI-assisted testing system.

Test types:

### Continue the Ayah

Display the beginning and ask the user to continue.

### Random Ayah

Select an ayah from memorized content.

### Previous Ayah

Ask the user to recite the previous ayah.

### Next Ayah

Ask the user to continue to the next ayah.

### Random Passage

Generate a random memorization test.

### Weak Area Test

Only select frequently missed material.

### Similar Ayah Test

Test verses with similar wording.

### Page Test

Choose a random page from the selected memorized range.

The AI should evaluate the recitation using the same recitation-analysis engine.

---

# 18. SIMILAR-AYAH ENGINE

Create a Quran similarity dataset.

Calculate linguistic similarity using validated Quran text.

Possible methods:

```text
TF-IDF
n-gram similarity
Levenshtein distance
Arabic morphological normalization
sentence embeddings
semantic similarity
```

Do NOT automatically tell users that two verses are "the same."

Use wording such as:

> "These passages have similar wording."

Allow the user to practice them side-by-side.

---

# 19. PROGRESS TRACKING

Track:

```text
Ayahs memorized
Pages memorized
Surahs memorized
Juz memorized
Review sessions
Recitation sessions
Accuracy
Mistakes
Time practiced
Daily streak
Weekly activity
Monthly activity
```

Dashboard:

```text
Quran Progress
████████░░ 80%

Memorized
24 Juz

This Week
3h 42m

Review
87%

Recitation Accuracy
93%
```

Do not equate time spent with memorization quality.

---

# 20. ANALYTICS

Create:

### Overview

* Total practice time
* Memorized content
* Review count
* Accuracy
* Streak

### Hifz analytics

* Memorization progress
* Review progress
* New vs revision
* Weak sections

### Recitation analytics

* Accuracy
* Mistakes
* Missing words
* Wrong words
* Repeated mistakes

### Heatmap

Calendar activity similar to a GitHub-style activity calendar.

### Surah analytics

```text
Surah Al-Baqarah

Accuracy: 91%
Sessions: 27
Mistakes: 42
Repeated mistakes: 11
```

---

# 21. STREAKS & BADGES

Support:

* Daily streak
* Weekly consistency
* Memorization milestones
* Revision milestones
* Testing milestones
* Quran completion milestones

Examples:

```text
First Session
7-Day Practice
30-Day Practice
100 Ayahs Reviewed
1 Juz Memorized
5 Juz Memorized
10 Juz Memorized
20 Juz Memorized
30 Juz Memorized
```

Keep gamification respectful and optional.

---

# 22. BOOKMARKS & NOTES

Users can bookmark:

* Ayah
* Page
* Surah

Allow private notes.

Notes must never modify canonical Quran text.

---

# 23. SEARCH

Implement:

### Text search

Search Arabic Quran text.

### Translation search

Search translated meaning.

### Voice search

User recites:

```text
"الحمد لله رب العالمين"
```

The system attempts to identify the corresponding passage.

Search results should include:

```text
Surah
Ayah
Juz
Page
Arabic text
Translation
```

Voice search must distinguish between:

```text
high confidence match
possible match
no reliable match
```

---

# 24. ONBOARDING

First launch:

### Screen 1

Welcome.

### Screen 2

Choose language.

### Screen 3

Current Hifz level:

```text
Beginner
Currently memorizing
Partial Hafiz
Hafiz / Revision
Just reading
```

### Screen 4

Current memorized range.

### Screen 5

Daily available time:

```text
10 min
20 min
30 min
45 min
60+ min
```

### Screen 6

Primary objective:

```text
Start Hifz
Continue Hifz
Improve Muraja'ah
Prepare for Hifz test
Improve recitation
Complete Quran
```

### Screen 7

Create first goal.

---

# 25. HOME SCREEN

Design a calm dashboard.

Example:

```text
Assalamu 'alaykum

Today's Hifz
────────────────────
New Memorization
Al-Mulk 1–10

Muraja'ah
Al-Kahf 1–20

AI Test
10 questions

────────────────────
Your Progress

🔥 14 day streak

Memorized
8 Juz

This week
4h 20m
```

Primary CTA:

**Start Today's Hifz**

Secondary:

**Read Quran**

---

# 26. NAVIGATION

Use bottom navigation:

```text
Home
Quran
Hifz
Progress
Profile
```

Inside Hifz:

```text
Today
Memorize
Muraja'ah
Test
Mistakes
Goals
```

---

# 27. AUTHENTICATION

Support:

* Email/password
* Google Sign-In
* Apple Sign-In on iOS
* Anonymous/local mode if practical

Users should be able to use basic Quran reading without creating an account.

Require account creation for cloud synchronization.

---

# 28. OFFLINE-FIRST DESIGN

The Quran reader must work offline.

Cache:

* Quran text
* User bookmarks
* Reading position
* Goals
* Local session data
* Downloaded audio

When online:

```text
Local changes
     ↓
Sync engine
     ↓
Backend
```

Implement conflict resolution.

Never silently overwrite user data.

---

# 29. SYNCHRONIZATION

Use:

```text
created_at
updated_at
deleted_at
version
device_id
```

for synchronizable entities.

Implement soft deletes.

Support multiple devices.

---

# 30. NOTIFICATIONS

Optional notifications:

```text
Today's Hifz is ready
Your Muraja'ah is due
You have an unfinished session
Your weekly goal is incomplete
Time for today's review
```

Users must have granular notification settings.

Avoid guilt-based language.

---

# 31. TEACHER MODE — PHASE 2

Build the architecture so teacher functionality can later be added.

Teacher can:

```text
Create class
Invite students
Assign memorization
Assign revision
Assign tests
View progress
Review mistakes
Leave feedback
```

Student:

```text
Accept assignment
Complete assignment
Submit recitation
View feedback
```

---

# 32. FAMILY MODE — PHASE 2

Family account:

```text
Parent
 ├── Child 1
 ├── Child 2
 ├── Child 3
 └── Child 4
```

Parent can see:

* Practice consistency
* Goals
* Completed assignments
* Memorization progress

Protect child privacy and implement appropriate consent mechanisms.

---

# 33. MADRASA / INSTITUTION MODE — PHASE 3

Support:

```text
Institution
 ├── Administrators
 ├── Teachers
 └── Students
```

Features:

* Classes
* Student roster
* Hifz curriculum
* Assignments
* Attendance
* Teacher notes
* Progress reports
* Student analytics
* Exportable reports

---

# 34. SUBSCRIPTION ARCHITECTURE

Design subscription support using:

**RevenueCat**

or an equivalent abstraction.

Plans:

### Free

* Quran reader
* Basic audio
* Basic bookmarks
* Basic progress
* Limited AI testing

### Premium

* AI recitation analysis
* Advanced mistake detection
* Hifz planning
* Advanced analytics
* Historical mistakes
* Advanced testing
* Similar-Ayah practice

### Family

* Multiple accounts
* Family dashboard

### Teacher

Separate B2B subscription.

Never hard-code subscription logic into UI widgets.

Use:

```text
EntitlementService
```

---

# 35. PRIVACY

Treat audio as sensitive user data.

Principles:

* Collect minimum necessary data.
* Explain microphone usage.
* Explain audio processing.
* Provide deletion controls.
* Encrypt data in transit.
* Encrypt sensitive data at rest.
* Do not sell user data.
* Do not use private recitations for AI training without explicit consent.
* Allow users to delete recitation history.
* Separate analytics from Quran content.
* Minimize third-party SDKs.

Create:

```text
PrivacySettings
AudioRetentionSettings
AnalyticsConsent
AITrainingConsent
```

---

# 36. SECURITY

Implement:

* TLS
* Secure authentication
* JWT rotation
* Refresh tokens
* Rate limiting
* API authorization
* Input validation
* SQL injection protection
* Secure file uploads
* Audio MIME validation
* Malware scanning where appropriate
* Encryption at rest
* Audit logs for administrative operations

Never trust the mobile client for:

* Subscription status
* User permissions
* Teacher permissions
* Quran content
* Analytics integrity

---

# 37. ADMIN DASHBOARD

Build a web-based admin application.

Recommended stack:

**Next.js + TypeScript**

Use:

* React
* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Admin features:

```text
Dashboard
Users
Subscriptions
Quran editions
Translations
Reciters
Audio
System health
AI metrics
Error monitoring
Feature flags
Support
```

Admins must NOT be able to casually edit canonical Quran text.

---

# 38. OBSERVABILITY

Implement:

* Structured logging
* Crash reporting
* API monitoring
* AI latency metrics
* AI confidence metrics
* Recitation processing failures
* Audio processing failures
* Database monitoring

Track:

```text
recitation_analysis_latency
speech_recognition_latency
analysis_failure_rate
low_confidence_rate
session_completion_rate
```

Do not store raw audio indefinitely by default.

---

# 39. TESTING

Use:

### Flutter

* Unit tests
* Widget tests
* Integration tests

### Python

* Pytest
* API tests
* Database tests
* AI-analysis tests

### End-to-end

Use:

* Patrol
* Maestro
* or equivalent

Test critical flows:

```text
Sign up
Login
Read Quran
Play audio
Create goal
Start memorization
Record recitation
Detect mistake
Save session
View mistake history
Complete test
View analytics
Sync across devices
```

---

# 40. AI TEST DATA

Create a synthetic/internal test suite containing examples of:

```text
Correct recitation
Missing word
Extra word
Wrong word
Repeated word
Word order error
Partial recitation
Background noise
Multiple speakers
Low volume
Fast recitation
Slow recitation
Different accents
Different legitimate recitation styles
```

Do not use synthetic data to validate Quranic correctness.

Use validated human-reviewed Quran recitation datasets where licensing permits.

---

# 41. QIRA'AT / RIWAYAT ARCHITECTURE

Do not assume every Arabic pronunciation difference is a mistake.

The system must eventually understand that legitimate differences can exist depending on:

* riwayah
* qira'ah
* pronunciation
* recitation rules

Therefore:

```text
RecitationProfile

qiraah
riwayah
mushaf_edition
tajweed_mode
```

The mistake engine must be aware of the selected recitation profile.

Do not label a legitimate variant as an error.

For MVP, support one clearly defined recitation configuration and design the system to expand later.

---

# 42. ARABIC TEXT NORMALIZATION

Create a dedicated Arabic normalization library.

It must distinguish:

```text
Canonical Quran text
Display text
Search text
ASR comparison text
```

Potential normalization operations:

* Remove tashkeel for search
* Normalize Alef variants where appropriate
* Normalize whitespace
* Handle Arabic presentation forms
* Normalize punctuation where applicable

NEVER overwrite canonical Quran text with normalized text.

---

# 43. ERROR HANDLING

The app must gracefully handle:

```text
No microphone permission
Microphone unavailable
Poor internet
AI timeout
Speech recognition failure
No matching verse
Low confidence
Server unavailable
Audio unavailable
Subscription failure
Sync conflict
```

Never tell a user:

> "You made a mistake"

when the AI confidence is low.

Instead:

> "We couldn't confidently identify that word. Try again."

---

# 44. ACCESSIBILITY

Support:

* Screen readers
* Large fonts
* High contrast
* Dynamic text sizes
* Semantic labels
* Large touch targets
* Reduced motion
* RTL layout
* Arabic accessibility

The Quran text must remain beautifully readable at large sizes.

---

# 45. RTL / LOCALIZATION

The entire application must support:

```text
Arabic
English
Urdu
Turkish
French
Indonesian
Malay
```

Architect localization from day one.

Never hard-code user-facing strings.

Use Flutter localization:

```text
ARB / JSON / generated localization
```

---

# 46. DESIGN SYSTEM

Create an original visual identity.

Do NOT copy Tarteel's UI.

Design principles:

* Calm
* Minimal
* Respectful
* Modern
* Quran-focused
* Accessible
* Low distraction

Use Material 3 as the foundation.

Create reusable:

```text
PrimaryButton
SecondaryButton
AyahCard
SurahCard
ProgressCard
GoalCard
MistakeCard
AudioPlayer
RecitationVisualizer
QuranText
StatsCard
BottomSheet
```

---

# 47. AUDIO RECORDING UI

During recording display:

```text
● Listening

Surah Al-Mulk
Ayahs 1–10

[ waveform ]

AI confidence
████████░░ 82%

[ Stop ]
```

After recording:

```text
Recitation Complete

Accuracy
94%

Mistakes
2

Words
118 / 120

[ Review Mistakes ]

[ Try Again ]

[ Finish ]
```

---

# 48. MISTAKE VISUALIZATION

Example:

```text
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                  ↑
               mistake
```

Color coding should be configurable.

Potential categories:

```text
Correct
Incorrect
Missing
Uncertain
```

Avoid excessive colors.

---

# 49. HIFZ SESSION FLOW

Implement exactly this user journey:

```text
Hifz
 ↓
Select range
 ↓
Select mode
 ↓
Prepare
 ↓
Start recording
 ↓
Recite
 ↓
AI analysis
 ↓
Results
 ↓
Review mistakes
 ↓
Retry weak sections
 ↓
Save session
 ↓
Update Hifz statistics
 ↓
Update revision priority
 ↓
Update today's plan
```

---

# 50. DAILY HIFZ LOOP

The core product loop should be:

```text
PLAN
 ↓
MEMORIZE
 ↓
RECITE
 ↓
ANALYZE
 ↓
CORRECT
 ↓
REPEAT
 ↓
TEST
 ↓
REVIEW
 ↓
ADAPT PLAN
```

Everything in the application should reinforce this loop.

---

# 51. DATABASE TABLES

At minimum design:

```text
users
profiles
subscriptions
quran_editions
surahs
ayahs
ayah_words
juz
hizbs
pages
translations
tafsirs
reciters
audio_files

memorization_records
memorization_sessions
recitation_sessions
recitation_words
mistakes
mistake_events

goals
goal_ranges
goal_progress
revision_items
revision_sessions

tests
test_questions
test_attempts

bookmarks
notes
reading_history

streaks
badges
user_badges

notifications
notification_preferences

teacher_accounts
classes
class_members
assignments

devices
sync_events
audit_logs
```

Use proper foreign keys and indexes.

---

# 52. API DESIGN

Create REST APIs such as:

```text
POST /auth/register
POST /auth/login
POST /auth/refresh

GET /quran/surahs
GET /quran/surahs/{id}
GET /quran/ayahs/{id}
GET /quran/search

GET /audio/reciters
GET /audio/{ayah_id}

POST /recitation/session
POST /recitation/analyze
GET /recitation/sessions/{id}

GET /mistakes
GET /mistakes/{id}
DELETE /mistakes/{id}

GET /hifz/progress
POST /hifz/session
GET /hifz/weak-areas

GET /goals
POST /goals
PUT /goals/{id}
DELETE /goals/{id}

GET /revision/today
POST /revision/session

POST /tests
POST /tests/{id}/attempt
GET /tests/history

GET /analytics/overview
GET /analytics/hifz
GET /analytics/recitation
```

Use OpenAPI documentation.

---

# 53. WEBSOCKET RECITATION

For real-time AI feedback, design:

```text
Flutter
  |
WebSocket
  |
FastAPI
  |
Audio stream
  |
ASR
  |
Alignment
  |
Mistake events
  |
WebSocket
  |
Flutter
```

Events:

```json
{
  "type": "word_result",
  "word_index": 12,
  "status": "incorrect",
  "confidence": 0.94
}
```

The UI should update without requiring the entire recording to finish.

If real-time analysis is too complex for the MVP, implement near-real-time chunked analysis first.

---

# 54. MVP

Do NOT attempt to build every feature simultaneously.

Build MVP in this order:

## Phase 1

1. Flutter project
2. Authentication
3. Quran database
4. Quran reader
5. Surah/Juz navigation
6. Audio playback
7. Bookmarks
8. Basic Hifz tracking

## Phase 2

9. Memorization mode
10. Audio recording
11. Speech recognition abstraction
12. Quran alignment engine
13. Basic mistake detection
14. Recitation results
15. Session history

## Phase 3

16. Goals
17. Muraja'ah
18. Mistake history
19. Analytics
20. Streaks
21. Testing engine

## Phase 4

22. Automatic Hifz planner
23. Similar-Ayah engine
24. Voice search
25. Advanced analytics
26. Adaptive revision

## Phase 5

27. Teacher mode
28. Family mode
29. Institution mode
30. Advanced AI tutor

---

# 55. DEVELOPMENT METHODOLOGY

Work incrementally.

DO NOT generate the entire application in one enormous code dump.

First create:

```text
ARCHITECTURE.md
PRODUCT_REQUIREMENTS.md
DATABASE_SCHEMA.md
API_SPEC.md
AI_ARCHITECTURE.md
SECURITY.md
ROADMAP.md
```

Then implement the application feature-by-feature.

After every major phase:

1. Run tests.
2. Fix compilation errors.
3. Fix lint errors.
4. Verify database migrations.
5. Verify API contracts.
6. Verify RTL.
7. Verify offline behavior.
8. Verify navigation.
9. Verify accessibility.
10. Update documentation.

---

# 56. CODE QUALITY

Use:

* Strong typing
* SOLID principles
* Dependency injection
* Repository pattern
* Service interfaces
* DTOs
* Domain models
* Error types
* Unit tests
* Documentation for complex algorithms

Avoid:

* Giant widgets
* Giant controllers
* Business logic in UI
* Hard-coded Quran text
* Hard-coded subscription status
* Hard-coded API URLs
* Global mutable state
* Magic numbers
* Duplicate business logic

---

# 57. ENVIRONMENT CONFIGURATION

Support:

```text
development
staging
production
```

Environment variables:

```text
DATABASE_URL
REDIS_URL
JWT_SECRET
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
AI_PROVIDER
AI_API_KEY
REVENUECAT_API_KEY
FIREBASE_CONFIG
```

Never commit secrets.

Create:

```text
.env.example
```

---

# 58. CI/CD

Use GitHub Actions.

Pipeline:

```text
git push
 ↓
Flutter analyze
 ↓
Flutter tests
 ↓
Python lint
 ↓
Python tests
 ↓
API tests
 ↓
Build
 ↓
Security scan
 ↓
Deploy staging
```

Production deployment should require explicit approval.

---

# 59. DOCUMENTATION

Maintain:

```text
README.md
ARCHITECTURE.md
SETUP.md
DATABASE.md
API.md
AI.md
DEPLOYMENT.md
SECURITY.md
PRIVACY.md
CONTRIBUTING.md
```

Include diagrams where helpful.

---

# 60. PRODUCT ANALYTICS

Implement privacy-conscious product analytics.

Track events such as:

```text
app_opened
quran_opened
ayah_played
memorization_started
memorization_completed
recitation_started
recitation_completed
mistake_detected
mistake_reviewed
goal_created
goal_completed
test_started
test_completed
```

Do NOT log Quran recitation audio into ordinary analytics events.

---

# 61. FEATURE FLAGS

Create a feature flag system.

Examples:

```text
ai_recitation_enabled
voice_search_enabled
similar_ayah_enabled
teacher_mode_enabled
family_mode_enabled
new_reader_enabled
```

This allows gradual rollout.

---

# 62. PERFORMANCE

Target:

* App startup under approximately 2–3 seconds on modern devices.
* Smooth 60 FPS scrolling.
* Quran pages should load instantly after initial cache.
* Audio should begin quickly.
* Avoid unnecessary network requests.
* Paginate large datasets.
* Cache frequently accessed Quran data.
* Compress uploaded audio appropriately.
* Stream rather than download unnecessarily.

AI latency should be displayed gracefully rather than blocking the entire UI.

---

# 63. IMPORTANT QURAN SAFETY REQUIREMENT

This is critical.

The AI must NEVER be treated as the authoritative source of Quranic text.

Canonical Quran content comes from the validated Quran database.

AI is only an analysis layer.

Architecture:

```text
Canonical Quran Database
        ↓
Authoritative expected text

AI
        ↓
Recognition / analysis only
```

Never:

```text
AI generates Quran
```

Never allow an LLM to "correct" Quran text.

---

# 64. AI TUTOR

Eventually implement an AI Hifz coach.

The AI can answer questions such as:

> "What should I revise today?"

> "Which ayahs am I struggling with?"

> "Test me on Juz Amma."

> "Give me a test from Surah Al-Mulk."

> "Which passages do I frequently confuse?"

The AI must retrieve information from the user's actual structured Hifz data.

Do not hallucinate user progress.

Use tool/function calling:

```text
get_user_hifz_progress()
get_revision_items()
get_mistake_history()
generate_test()
start_recitation_session()
```

---

# 65. AI COACH RESPONSE RULES

The AI should:

* Be encouraging.
* Be respectful.
* Avoid pretending to be a qualified Islamic scholar.
* Avoid inventing Quran verses or Hadith.
* Clearly distinguish Quran, Hadith, tafsir and general advice.
* Prefer validated Quran data.
* Avoid giving religious rulings unless supported by a trusted source.
* Encourage consultation with qualified scholars for fiqh/religious questions.

---

# 66. DESIGN THE APP FOR EXTENSIBILITY

The architecture must eventually support:

```text
Android
iOS
Web
Desktop
Wearables
Car audio
Teacher dashboard
Institution dashboard
```

Do not over-engineer the MVP, but avoid architectural decisions that make these impossible later.

---

# 67. DELIVERABLES

At the end of the initial implementation, provide:

```text
1. Complete source code
2. Flutter mobile application
3. FastAPI backend
4. PostgreSQL schema
5. Database migrations
6. Admin dashboard foundation
7. AI provider abstraction
8. Quran data import pipeline
9. API documentation
10. Automated tests
11. CI/CD configuration
12. Docker configuration
13. Environment template
14. README
15. Architecture documentation
16. Deployment instructions
```

---

# 68. FIRST TASK

Before writing application code:

1. Inspect the repository.
2. Determine whether a project already exists.
3. Preserve useful existing work.
4. Create the architecture documents.
5. Propose the directory structure.
6. Propose the database schema.
7. Propose the API structure.
8. Identify external dependencies.
9. Identify licensing requirements for Quran text, audio, translations and tafsir.
10. Identify which components require external AI services.
11. Identify which components can operate offline.
12. Identify technical risks.
13. Create a phased implementation plan.

Then begin implementing Phase 1.

Do not wait for unnecessary confirmation between every small step.

Make sensible engineering decisions, document them, and continue.

If an architectural decision has significant long-term consequences, document the decision and explain the trade-off.

---

# 69. FINAL PRODUCT PRINCIPLE

The finished application should not feel like:

> "A Quran reader with an AI microphone."

It should feel like:

> **"A complete personal Hifz training system that understands what I have memorized, listens to my recitation, identifies where I struggle, helps me correct it, tests my retention, and intelligently plans my Muraja'ah."**

Build for correctness first.

Build Quran-data integrity first.

Build recitation accuracy second.

Build UX around the learner.

Build AI as an assistant rather than an authority.

Build the architecture so the application can grow from a personal Hifz app into a platform for students, teachers, families, and Quran institutions.

Begin with architecture and repository inspection, then implement the MVP systematically.