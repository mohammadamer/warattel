export type GoalType = 'verse-range' | 'custom-passage';

export type LearningState = 'new' | 'active' | 'review' | 'weak' | 'mastered' | 'paused';

export type DailyPlanItem = {
  id: string;
  title: string;
  type: 'memorize' | 'review' | 'test';
  durationMinutes: number;
  status: 'pending' | 'in-progress' | 'done';
};

export type GoalDraft = {
  id: string;
  title: string;
  type: GoalType;
  target: string;
  duration: string;
};

export type RecitationResult = {
  id: string;
  title: string;
  accuracy: number;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  audioUri?: string;
  issues: RecitationIssue[];
};

export type RecitationIssue = {
  id: string;
  kind: 'missing' | 'substitution' | 'hesitation';
  label: string;
  detail: string;
};

export type WeakPassage = {
  id: string;
  title: string;
  risk: 'high' | 'medium' | 'low';
  issueCount: number;
};
