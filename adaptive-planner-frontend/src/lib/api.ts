import {
  TimeBlock,
  ScenarioOption,
  WeeklyRoutine,
  CreateWeeklyRoutinePayload,
  Holiday,
  MonthlySummaryResponse,
  RescheduleResponse,
  AdaptationAction,
  Conversation,
  ChatMessage,
  NotificationItem,
  DailyCheckin,
  CyclePrediction,
  ProactiveAdaptationResponse,
  AccessibilityProfile,
  OnboardingAnswers,
} from '@/types/planner';
import {
  UserDto,
  SignUpRequest,
  LoginRequest,
  AuthResponse,
  JourneyStageRequest,
  NeurodivergenceSelfIdRequest,
  NeurodivergenceProfileDto,
  AssessmentSubmissionRequest,
  FunctionalProfileDto,
} from '@/types/auth';

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

export interface ApplyAdaptationPayload {
  conversationId?: number;
  date?: string;
  reason?: string;
  selectedScenarioId?: string;
  scenarioTitle?: string;
  explanationJson?: string;
  newBlocks: TimeBlock[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText || `Request error (${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.detail || parsed.title || parsed.message || errorText;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export function normalizeTimeBlock(raw: any): TimeBlock {
  if (!raw) return raw;
  return {
    ...raw,
    isCompleted: Boolean(raw.isCompleted ?? raw.completed),
    isBufferBlock: Boolean(raw.isBufferBlock ?? raw.bufferBlock),
    isMovable: raw.isMovable ?? raw.movable ?? true,
    microSteps: raw.microSteps || [],
    reminderMinutesBefore: raw.reminderMinutesBefore || [30, 10, 0],
  };
}

export const api = {
  // TimeBlock CRUD & Date queries
  getTimeBlocks: async (date?: string) => {
    const list = await request<TimeBlock[]>(date ? `/timeblocks?date=${date}` : '/timeblocks');
    return Array.isArray(list) ? list.map(normalizeTimeBlock) : [];
  },
  getMonthlySummary: (year: number, month: number) =>
    request<MonthlySummaryResponse>(`/timeblocks/month?year=${year}&month=${month}`),
  getTimeBlockById: async (id: string) => {
    const block = await request<TimeBlock>(`/timeblocks/${id}`);
    return normalizeTimeBlock(block);
  },
  createTimeBlock: async (payload: CreateTimeBlockPayload) => {
    const block = await request<TimeBlock>('/timeblocks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeTimeBlock(block);
  },
  updateTimeBlock: async (id: string, updates: Partial<TimeBlock>) => {
    const block = await request<TimeBlock>(`/timeblocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return normalizeTimeBlock(block);
  },
  updateTimeBlockCompletion: async (id: string, completed: boolean) => {
    const block = await request<TimeBlock>(`/timeblocks/${id}/completion`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    });
    return normalizeTimeBlock(block);
  },
  updateRoutineOccurrenceCompletion: async (routineId: number, date: string, completed: boolean) => {
    const block = await request<TimeBlock>(`/timeblocks/routines/${routineId}/occurrences/${date}/completion`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    });
    return normalizeTimeBlock(block);
  },
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
  batchApplyScenario: async (blocks: TimeBlock[]) => {
    const list = await request<TimeBlock[]>('/timeblocks/batch-apply', {
      method: 'POST',
      body: JSON.stringify(blocks),
    });
    return Array.isArray(list) ? list.map(normalizeTimeBlock) : [];
  },
  getInboxBlocks: async (date?: string) => {
    const list = await request<TimeBlock[]>(date ? `/timeblocks/inbox?date=${date}` : '/timeblocks/inbox');
    return Array.isArray(list) ? list.map(normalizeTimeBlock) : [];
  },
  scheduleFromInbox: async (id: string, startTime: string, endTime: string, date?: string) => {
    const block = await request<TimeBlock>(`/timeblocks/${id}/schedule-from-inbox?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}${date ? `&date=${date}` : ''}`, {
      method: 'POST',
    });
    return normalizeTimeBlock(block);
  },
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

  // AI Adaptation & Multi-Block Undo
  getAdaptations: (date?: string) =>
    request<AdaptationAction[]>(date ? `/planner/adaptation?date=${date}` : '/planner/adaptation'),
  getAdaptationById: (actionId: number) =>
    request<AdaptationAction>(`/planner/adaptation/${actionId}`),
  applyAdaptation: (payload: ApplyAdaptationPayload) =>
    request<{ actionId: number; message: string; status: string; blocks: TimeBlock[] }>('/planner/adaptation/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  undoAdaptation: (actionId: number) =>
    request<{ actionId: number; message: string; status: string; blocks: TimeBlock[] }>(`/planner/adaptation/undo/${actionId}`, {
      method: 'POST',
    }),

  // AI Conversations & Chat Sessions
  getConversations: () =>
    request<Conversation[]>('/ai/conversations'),
  getConversationById: (id: number) =>
    request<Conversation>(`/ai/conversations/${id}`),
  createConversation: (payload?: { title?: string; initialMessage?: Partial<ChatMessage> }) =>
    request<Conversation>('/ai/conversations', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  appendMessage: (conversationId: number, payload: { role: string; content: string; metadataJson?: string }) =>
    request<ChatMessage>(`/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteConversation: (id: number) =>
    request<void>(`/ai/conversations/${id}`, {
      method: 'DELETE',
    }),

  // Real Notifications System
  getNotifications: () =>
    request<NotificationItem[]>('/notifications'),
  getUnreadNotificationCount: () =>
    request<{ unreadCount: number }>('/notifications/unread-count'),
  markNotificationAsRead: (id: number) =>
    request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsAsRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    }),
  deleteNotification: (id: number) =>
    request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    }),
  deleteAllReadNotifications: () =>
    request<{ message: string }>('/notifications/read', {
      method: 'DELETE',
    }),
  createNotification: (payload: Partial<NotificationItem>) =>
    request<NotificationItem>('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Daily Check-ins, Mood & Period Tracker
  getDailyCheckins: (startDate: string, endDate: string) =>
    request<DailyCheckin[]>(`/daily-checkins?startDate=${startDate}&endDate=${endDate}`),
  getDailyCheckinByDate: (date: string) =>
    request<DailyCheckin | null>(`/daily-checkins/${date}`),
  upsertDailyCheckin: (payload: DailyCheckin) =>
    request<DailyCheckin>('/daily-checkins', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteDailyCheckinByDate: (date: string) =>
    request<void>(`/daily-checkins/by-date/${date}`, {
      method: 'DELETE',
    }),
  deleteDailyCheckinById: (id: number) =>
    request<void>(`/daily-checkins/${id}`, {
      method: 'DELETE',
    }),
  getCyclePredictions: () =>
    request<CyclePrediction>('/daily-checkins/cycle-prediction'),
  evaluateProactiveAdaptation: (payload: { checkinDate: string; energyLevel?: number; isPeriodDay?: boolean }) =>
    request<ProactiveAdaptationResponse>('/daily-checkins/evaluate-adaptation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Personal Accessibility Profile & Universal Design
  getAccessibilityProfile: () =>
    request<AccessibilityProfile>('/user/accessibility-profile'),
  updateAccessibilityProfile: (profile: Partial<AccessibilityProfile>) =>
    request<AccessibilityProfile>('/user/accessibility-profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
  submitOnboarding: (answers: OnboardingAnswers) =>
    request<AccessibilityProfile>('/user/accessibility-profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(answers),
    }),

  // Workload & Cognitive Load Detection
  getWorkloadAssessment: (date: string) =>
    request<CognitiveLoadAssessment>(`/workload/evaluate?date=${date}`),
  getQuickRebalanceOptions: (date: string) =>
    request<QuickRebalanceProposal>(`/workload/rebalance-options?date=${date}`),

  // Auth & Session
  signup: (payload: SignUpRequest) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  getCurrentUser: () =>
    request<UserDto>('/auth/me'),

  // Onboarding & Assessment
  saveJourneyStage: (payload: JourneyStageRequest) =>
    request<UserDto>('/onboarding/journey-stage', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  saveNeurodivergenceSelfId: (payload: NeurodivergenceSelfIdRequest) =>
    request<NeurodivergenceProfileDto>('/onboarding/neurodivergence-self-id', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  submitAssessment: (payload: AssessmentSubmissionRequest) =>
    request<FunctionalProfileDto>('/onboarding/functional-assessment', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeOnboarding: () =>
    request<UserDto>('/onboarding/complete', {
      method: 'POST',
    }),
  getFunctionalProfile: () =>
    request<FunctionalProfileDto>('/onboarding/functional-profile'),
};
