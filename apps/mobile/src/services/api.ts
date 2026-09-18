import { DailyPlanItem, GoalType, RecitationResult } from '../types';
import * as SecureStore from 'expo-secure-store';

declare const process: { env: Record<string, string | undefined> };

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
let accessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'warattel.accessToken';

type ApiGoal = {
  id: string;
  title: string;
  type: GoalType;
  target: string;
  duration_minutes: number;
};

type ApiPlan = {
  items: DailyPlanItem[];
};

type ApiRecitation = {
  id: string;
  passage: string;
  audio_uri: string;
  status: 'queued' | 'processing' | 'complete';
  accuracy: number | null;
  confidence: 'high' | 'medium' | 'low' | null;
  summary: string;
  issues: RecitationResult['issues'];
};

export async function getRecitationStatus(recitationId: string): Promise<RecitationResult> {
  const result = await request<ApiRecitation>(`/recitations/${recitationId}`);
  return {
    id: result.id,
    title: 'Latest recitation',
    status: result.status,
    accuracy: result.accuracy ?? 0,
    confidence: result.confidence ?? 'low',
    summary: result.summary,
    audioUri: result.audio_uri,
    issues: result.issues,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function register(email: string, password: string): Promise<void> {
  const response = await request<{ access_token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  accessToken = response.access_token;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function login(email: string, password: string): Promise<void> {
  const response = await request<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  accessToken = response.access_token;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function restoreAccessToken(): Promise<boolean> {
  accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return Boolean(accessToken);
}

export async function clearAccessToken() {
  accessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getWorkerStatus(): Promise<{
  mode: 'redis' | 'local-fallback';
  overall: 'healthy' | 'degraded' | 'offline';
  broker: string;
  worker: string;
  is_ready: boolean;
}> {
  return request('/worker/status');
}

export async function createGoalAndPlan(input: {
  title: string;
  type: GoalType;
  target: string;
  durationMinutes: number;
}): Promise<DailyPlanItem[]> {
  const goal = await request<ApiGoal>('/goals', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      type: input.type,
      target: input.target,
      duration_minutes: input.durationMinutes,
    }),
  });
  const plan = await request<ApiPlan>(`/goals/${goal.id}/daily-plan`, { method: 'POST' });
  return plan.items;
}

export async function queueRecitation(input: {
  passage: string;
  audioUri: string;
}): Promise<RecitationResult> {
  const form = new FormData();
  form.append('passage', input.passage);
  form.append('audio', {
    uri: input.audioUri,
    name: 'recitation.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);

  const result = await request<ApiRecitation>('/recitations', {
    method: 'POST',
    body: form,
  });

  return {
    id: result.id,
    title: 'Latest recitation',
    status: result.status,
    accuracy: result.accuracy ?? 0,
    confidence: result.confidence ?? 'low',
    summary: result.summary,
    audioUri: result.audio_uri,
    issues: result.issues,
  };
}