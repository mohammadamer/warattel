import { GoalDraft } from '../types';

export const goalDrafts: GoalDraft[] = [
  {
    id: 'goal-1',
    title: 'Memorize Surah Al-Fatihah',
    type: 'verse-range',
    target: 'Ayah 1-7',
    duration: '15 min',
  },
  {
    id: 'goal-2',
    title: 'Review Surah Al-Mulk',
    type: 'custom-passage',
    target: 'First 10 verses',
    duration: '10 min',
  },
];
