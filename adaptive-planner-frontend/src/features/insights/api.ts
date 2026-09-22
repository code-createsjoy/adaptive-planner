import { WeeklyInsightsResponse, ProgressiveInsightsData } from '@/types/insights';

const BASE_URL = 'http://localhost:8080/api/insights';

export async function fetchProgressiveInsights(weekStart?: string): Promise<ProgressiveInsightsData> {
  const url = weekStart ? `${BASE_URL}/progressive?weekStart=${weekStart}` : `${BASE_URL}/progressive`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Unable to load progressive insights.');
  }
  return res.json();
}

export async function fetchWeeklyInsights(weekStart?: string): Promise<WeeklyInsightsResponse> {
  const url = weekStart ? `${BASE_URL}/weekly?weekStart=${weekStart}` : `${BASE_URL}/weekly`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Unable to load weekly insights analysis.');
  }
  return res.json();
}

export async function saveExperimentApi(data: {
  sourceWeek: string;
  ruleKey: string;
  evidenceFingerprint: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/experiments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Unable to save experiment.');
  }
  return res.json();
}

export async function dismissExperimentApi(data: {
  sourceWeek: string;
  ruleKey: string;
  evidenceFingerprint: string;
}): Promise<void> {
  const res = await fetch(`${BASE_URL}/experiments/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Unable to dismiss experiment.');
  }
}
