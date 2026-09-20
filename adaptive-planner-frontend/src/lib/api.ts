import { TimeBlock, ScenarioOption, WeeklyRoutine, CreateWeeklyRoutinePayload, Holiday, MonthlySummaryResponse, RescheduleResponse, AdaptationAction } from '@/types/planner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface CreateTimeBlockPayload {
  title: string;
  detail?: string;
  startTime: string;
  endTime: string;
  category: string;
  energyLevel: string;
  priority?: string;
  deadline?: string;
  isMovable?: boolean;
  status?: string;
  inboxDate?: string;
  preferredTimeRange?: string;
  reminderMinutesBefore?: number[];
  isBufferBlock?: boolean;
  microSteps?: { id: string; text: string; done: boolean }[];
  date?: string;
  sourceType?: string;
  sourceRoutineId?: number;
  overrideType?: string;
}

export interface ParseIntentPayload {
  prompt: string;
}

export interface ReschedulePayload {
  urgentEvent: string;
  targetTime?: string;
  durationMinutes?: number;
  currentBlocks: TimeBlock[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // TimeBlock CRUD & Date queries
  getTimeBlocks: (date?: string) =>
    request<TimeBlock[]>(date ? `/timeblocks?date=${date}` : '/timeblocks'),
  getMonthlySummary: (year: number, month: number) =>
    request<MonthlySummaryResponse>(`/timeblocks/month?year=${year}&month=${month}`),
  getTimeBlockById: (id: string) => request<TimeBlock>(`/timeblocks/${id}`),
  createTimeBlock: (payload: CreateTimeBlockPayload) =>
    request<TimeBlock>('/timeblocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) =>
    request<TimeBlock>(`/timeblocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteTimeBlock: (id: string) =>
    request<void>(`/timeblocks/${id}`, {
      method: 'DELETE',
    }),
  cancelRoutineForDate: (routineId: number, date: string) =>
    request<void>(`/timeblocks/cancel-routine-date?routineId=${routineId}&date=${date}`, {
      method: 'POST',
    }),
  pauseAllRoutinesForDate: (date: string) =>
    request<void>(`/timeblocks/pause-routine-date?date=${date}`, {
      method: 'POST',
    }),
  resumeAllRoutinesForDate: (date: string) =>
    request<void>(`/timeblocks/resume-routine-date?date=${date}`, {
      method: 'POST',
    }),
  purgeAllBlocks: () =>
    request<void>('/timeblocks/purge', {
      method: 'DELETE',
    }),
  batchApplyScenario: (blocks: TimeBlock[]) =>
    request<TimeBlock[]>('/timeblocks/batch-apply', {
      method: 'POST',
      body: JSON.stringify(blocks),
    }),
  getInboxBlocks: (date?: string) =>
    request<TimeBlock[]>(date ? `/timeblocks/inbox?date=${date}` : '/timeblocks/inbox'),
  scheduleFromInbox: (id: string, startTime: string, endTime: string, date?: string) =>
    request<TimeBlock>(`/timeblocks/${id}/schedule-from-inbox?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}${date ? `&date=${date}` : ''}`, {
      method: 'POST',
    }),
  getCalmOpenings: (date?: string, duration = 60, category = 'work', energyLevel = 'medium') =>
    request<import('@/types/planner').CalmSlot[]>(`/timeblocks/calm-openings?date=${date || ''}&duration=${duration}&category=${category}&energyLevel=${energyLevel}`),

  // Weekly Routines
  getRoutines: () => request<WeeklyRoutine[]>('/routines'),
  createRoutines: (payload: CreateWeeklyRoutinePayload) =>
    request<WeeklyRoutine[]>('/routines', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRoutine: (id: number, updates: Partial<WeeklyRoutine>, updateAllMatching = false) =>
    request<WeeklyRoutine[]>(`/routines/${id}?updateAllMatching=${updateAllMatching}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  toggleRoutine: (id: number) =>
    request<WeeklyRoutine>(`/routines/${id}/toggle`, {
      method: 'PATCH',
    }),
  deleteRoutine: (id: number) =>
    request<void>(`/routines/${id}`, {
      method: 'DELETE',
    }),
  copyDayRoutines: (fromDay: string, toDays: string[], overwrite = false) =>
    request<WeeklyRoutine[]>(`/routines/copy-day?fromDay=${fromDay}&toDays=${toDays.join(',')}&overwrite=${overwrite}`, {
      method: 'POST',
    }),
  copyRoutineToDays: (id: number, targetDays: string[]) =>
    request<WeeklyRoutine[]>(`/routines/${id}/copy-to-days?targetDays=${targetDays.join(',')}`, {
      method: 'POST',
    }),

  // Vietnamese Public Holidays
  getHolidays: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Holiday[]>(`/holidays${qs}`);
  },
  checkHoliday: (date: string) => request<Holiday | null>(`/holidays/check?date=${date}`),

  // AI Gateway Endpoints
  parseIntent: (payload: ParseIntentPayload) =>
    request<TimeBlock>('/planner/parse-intent', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getRescheduleScenarios: (payload: ReschedulePayload) =>
    request<RescheduleResponse>('/planner/reschedule-scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  breakdownTask: (taskTitle: string) =>
    request<{ microSteps: { id: string; text: string; done: boolean }[] }>('/planner/task-breakdown', {
      method: 'POST',
      body: JSON.stringify({ prompt: taskTitle }),
    }),
  applyAdaptation: (payload: { date?: string; reason?: string; newBlocks: TimeBlock[] }) =>
    request<{ actionId: number; message: string; status: string; blocks: TimeBlock[] }>('/planner/adaptation/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  undoAdaptation: (actionId: number) =>
    request<{ actionId: number; message: string; status: string; blocks: TimeBlock[] }>(`/planner/adaptation/undo/${actionId}`, {
      method: 'POST',
    }),
};
