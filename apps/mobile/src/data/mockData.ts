import { DailyPlanItem, RecitationResult, WeakPassage } from '../types';

export const dailyPlan: DailyPlanItem[] = [
  {
    id: '1',
    title: 'Memorize Al-Fatihah: 1-7',
    type: 'memorize',
    durationMinutes: 15,
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Review Surah Al-Mulk',
    type: 'review',
    durationMinutes: 10,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Recitation check',
    type: 'test',
    durationMinutes: 12,
    status: 'pending',
  },
];

export const recentRecitations: RecitationResult[] = [
  {
    id: 'r1',
    title: 'Session 1',
    accuracy: 92,
    confidence: 'high',
    summary: 'Strong recall on the first 10 verses. Minor omission in one phrase.',
    issues: [
      {
        id: 'i1',
        kind: 'missing',
        label: 'Possible omission',
        detail: 'One phrase needs a slower second pass.',
      },
    ],
  },
  {
    id: 'r2',
    title: 'Session 2',
    accuracy: 86,
    confidence: 'medium',
    summary: 'A few substitutions around the middle of the passage.',
    issues: [
      {
        id: 'i2',
        kind: 'substitution',
        label: 'Word substitution',
        detail: 'Review the middle section before moving forward.',
      },
    ],
  },
];

export const weakPassages: WeakPassage[] = [
  {
    id: 'wp1',
    title: 'Ayah 17-20 of Al-Fatihah',
    risk: 'high',
    issueCount: 4,
  },
  {
    id: 'wp2',
    title: 'Surah Al-Mulk 1-5',
    risk: 'medium',
    issueCount: 2,
  },
];
