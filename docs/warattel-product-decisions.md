# Warattel Product Decisions Log

This document records the design questions, recommended answers, and confirmations reached during the product discovery process for Warattel.

## Technology stack decision

### Mobile app platform
Question: Should the mobile app be built with Flutter or React Native?

Recommended answer: Use React Native with TypeScript for the mobile app. This aligns better with the desired cross-platform delivery, faster iteration for teams comfortable with JavaScript/TypeScript, and a practical product-development path for a mid-sized mobile app that needs strong ecosystem support while keeping the codebase maintainable.

Confirmed: Yes.

## Status

All recommendations below were explicitly confirmed by the product owner and are treated as the working baseline for v1 design.

---

## Round 1 — Core product definition

### Q1 — Primary user and objective
Question: Who is the main persona for v1: a beginner memorizer, a serious Hifz student, a teacher managing students, or a general Quran reader who wants AI feedback?

Recommended answer: Build v1 around the self-directed Hifz student who wants daily progress, revision, and AI recitation feedback without requiring a teacher to run the workflow. Teacher and family workflows should be deferred.

Confirmed: Yes.

### Q2 — What success looks like
Question: In Warattel, what is the strongest sign that a session has been successful—correct memorization completion, retention over time, lower error rate in recitation, or daily consistency/streaks?

Recommended answer: Optimize for a loop of memorize → review → recite → receive targeted feedback → improve retention. Success should combine correctness, retention, and consistency rather than relying on a single metric.

Confirmed: Yes.

### Q3 — AI feedback boundaries
Question: Should the AI judge only word-level accuracy and common recitation mistakes, or should it also coach deeper Quranic correctness, tajweed reasoning, and personalized learning recommendations?

Recommended answer: v1 should focus on reliable word-level and phrasing detection, with transparent confidence and clear corrections. Deeper tajweed advice becomes valuable only after the basic recitation pipeline is stable and explainable.

Confirmed: Yes.

### Q4 — MVP scope
Question: Which features are must-have in the first release—Quran reading, memorization tracking, revision planning, AI analysis, and analytics—or should the app start narrower and delay some of the broader vision?

Recommended answer: Start with a narrow but complete Hifz loop: reading, memorization goals, daily plan, revision tracking, and AI recitation feedback. Delay broader teacher networks, family dashboards, and advanced social features until the core loop is proven.

Confirmed: Yes.

### Q5 — Data and trust model
Question: For a Quran app with recitation assessment, what is the user expectation around privacy, offline use, and data retention for audio and analysis history?

Recommended answer: Privacy-first by default, offline-first for core reading and revision flows, and explicit user control over stored audio and AI analysis history. Collect only what is necessary to support progress and feedback.

Confirmed: Yes.

---

## Round 2 — Product workflow and learning loop

### Q1 — Core workflow
Question: If the app is built around a self-directed Hifz student, what should the default daily session look like from first tap to completion?

Recommended answer: Home dashboard → today’s plan → memorize or revise selected passage → recite from memory → record or upload audio → AI analysis → review mistakes and weak portions → mark progress and get the next recommended practice. The app should feel like a daily coach, not a general Quran reader.

Confirmed: Yes.

### Q2 — What counts as a target unit
Question: What counts as a “target unit” for memorization and revision? Is the app organized around verses, custom passages, pages, or surahs?

Recommended answer: Support both verse-level and custom passage-level targets, with surah/page as navigation aids only. Verse-level granularity is the real learning unit; custom passages are the way users set goals around meaningful chunks.

Confirmed: Yes.

### Q3 — AI output contract
Question: What should the user see when the AI evaluates recitation—just “incorrect/correct,” or a detailed breakdown of missing words, extra words, wrong words, and pronunciation issues?

Recommended answer: The user should see a clear, actionable breakdown: correct words, missing, inserted, substituted, and possible diacritic/tajweed concerns, each with a confidence label. The system should explain what was wrong and where the user should focus next.

Confirmed: Yes.

### Q4 — Weak-portion logic
Question: How should the app decide which passages become “weak” and deserve more revision?

Recommended answer: Weak portions are determined by repeated mistakes, low confidence, recurring missed words, and poor retention over time. The system should surface the handful of passages with the highest risk, not just the most recent errors.

Confirmed: Yes.

### Q5 — Progress model
Question: Should the app track progress as a single “memorization percentage,” or should it track multiple metrics separately such as retention, accuracy, consistency, and revision streak?

Recommended answer: Track multiple metrics separately and combine them into one simple score only for display. Retention, correctness, and consistency are distinct signals and should not collapse into a misleading single percentage.

Confirmed: Yes.

### Q6 — Offline-first behavior
Question: For a daily Hifz workflow, should users be able to record recitation, review plans, and continue practice while offline, with sync later?

Recommended answer: Yes. Core reading, revision, and recording flows should work offline. AI analysis can queue and sync later when connectivity returns, with clear status indicators.

Confirmed: Yes.

---

## Round 3 — Operationalized learning workflow

### Q1 — Default daily session
Question: If a user opens the app for a normal session, what is the exact flow from start to finish?

Recommended answer: Dashboard → today’s Hifz plan → one target passage → recite from memory → record or upload audio → AI analysis → review precise corrections → mark progress → receive the next recommended revision. The app should feel like a guided daily coach, not a general-purpose Quran reader.

Confirmed: Yes.

### Q2 — Learning target granularity
Question: Should the app treat a verse, a custom passage, a page, or a surah as the primary unit of study?

Recommended answer: Use verse and custom-passage chunks as the primary learning units, with surah and page references serving as navigation context. This gives the user enough precision for memorization without making review too fragmented.

Confirmed: Yes.

### Q3 — Feedback detail
Question: What should the analysis output include so it is genuinely useful instead of vague?

Recommended answer: The app should show a structured breakdown with exact affected words, insertion/deletion/substitution detection, confidence level, and any probable tajweed or diacritic issues. The system must explain what is wrong and where the problem is, not just say “incorrect.”

Confirmed: Yes.

### Q4 — Weak-portion detection
Question: What signals should cause a passage to be labeled “weak”?

Recommended answer: Repeated mistakes, low confidence across multiple attempts, high omission rate, and inconsistent retention over time. The app should identify the passages with the highest learning risk and prioritize them for revision.

Confirmed: Yes.

### Q5 — Progress metrics
Question: How should the app represent progress without oversimplifying the learner’s performance?

Recommended answer: Track multiple independent metrics—accuracy, retention, consistency, and revision streak—and surface a single high-level score only as a summary. No single percentage should hide the fact that a user can be strong in one area and weak in another.

Confirmed: Yes.

### Q6 — Offline-first requirement
Question: Should offline use support the critical Hifz loop even before sync?

Recommended answer: Yes. Users should be able to review their plan, study text, record recitation, and queue AI analysis offline. Once connectivity returns, analysis and sync should complete automatically with visible status.

Confirmed: Yes.

---

## Final confirmed product model

### Q1 — Release scope
Question: Is v1 intentionally learner-only, or do you want the app to support teacher/family workflows in the first release?

Recommended answer: Keep v1 learner-first and self-directed. Teacher and family workflows should be treated as future expansion because they add coordination and permission complexity that is not required to validate the core Hifz loop.

Confirmed: Yes.

### Q2 — Goal creation model
Question: How should users define learning goals—by surah, verse range, or custom passage blocks?

Recommended answer: Allow both verse ranges and custom passage blocks, while surah remains a navigational context. This gives the learner flexibility without making the system too rigid.

Confirmed: Yes.

### Q3 — Scheduling policy
Question: Should the daily plan be fixed-length with a predictable daily workload, or adaptive based on consistency, retention, and current difficulty?

Recommended answer: Adaptive scheduling is the correct default. The system should recommend a realistic workload that respects retention risk and recent mistakes rather than forcing the same target length every day.

Confirmed: Yes.

### Q4 — Data retention and trust
Question: How long should audio and analysis history be stored, and should users have control over deletion?

Recommended answer: Store the user’s analysis history as long as it supports learning progress, but let the user control retention, export, and deletion. Privacy and trust should be explicit, especially for recitation recordings.

Confirmed: Yes.

### Q5 — First-release success metric
Question: What does “ready to ship” mean for v1 in practical terms?

Recommended answer: The app is ready when a learner can reliably set a goal, receive a daily plan, record recitation, get actionable AI feedback, and see progress improve without needing manual intervention. That is the minimum meaningful release threshold.

Confirmed: Yes.

---

## Final product baseline

Warattel v1 will be a learner-first Hifz companion focused on:

- reading Quran text
- setting memorization or revision goals
- receiving an adaptive daily Hifz plan
- reciting from memory with audio capture
- analyzing recitation with AI using word-level and phrase-level comparison
- reviewing exact mistakes and confidence levels
- tracking retention, consistency, and weak passages over time
- operating offline-first with later sync

The application is intentionally narrower than the full long-term product vision. The v1 goal is to validate the daily Hifz coaching loop and prove that AI-assisted recitation feedback is useful and trustworthy for serious learners.
