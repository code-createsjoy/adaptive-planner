export type BlockCategory = 'work' | 'social' | 'health' | 'rest' | 'urgent' | 'transition';
export type EnergyLevel = 'high' | 'medium' | 'low';
export type DayOfWeekType = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface MicroStep {
  id: string;
  text: string;
  done: boolean;
}

export interface TimeBlock {
  id: string;
  title: string;
  detail?: string;
  startTime: string; // "09:00" or ISO
  endTime: string;   // "11:30" or ISO
  category: BlockCategory;
  energyLevel: EnergyLevel;
  priority?: 'HIGH' | 'NORMAL' | 'PROTECTED' | 'FLEXIBLE' | 'High' | 'Normal' | 'Protected' | 'Flexible';
  deadline?: string; // ISO date-time or YYYY-MM-DD
  isMovable?: boolean;
  status?: 'ACTIVE' | 'DISRUPTED' | 'DEFERRED' | 'SCHEDULED';
  inboxDate?: string; // YYYY-MM-DD
  preferredTimeRange?: string;
  reminderMinutesBefore: number[]; // e.g. [30, 10, 0]
  isCompleted: boolean;
  isBufferBlock?: boolean;
  microSteps?: MicroStep[];
  date?: string; // "YYYY-MM-DD"
  durationMinutes?: number;
  missingFields?: string[];
  confidence?: number;
  sourceType?: 'ROUTINE' | 'CUSTOM' | 'AI_ADDED' | 'AI_RESCHEDULED';
  sourceRoutineId?: number;
  overrideType?: 'NONE' | 'MODIFIED' | 'CANCELLED';
  intentType?: 'SCHEDULE_EVENT' | 'CONVERSATION' | 'EMOTIONAL_SUPPORT';
  replyMessage?: string;
}

export interface WeeklyRoutine {
  id: number;
  dayOfWeek: DayOfWeekType;
  title: string;
  detail?: string;
  startTime: string;
  endTime: string;
  category: BlockCategory;
  energyLevel: EnergyLevel;
  priority?: 'HIGH' | 'NORMAL' | 'PROTECTED' | 'FLEXIBLE' | 'High' | 'Normal' | 'Protected' | 'Flexible';
  reminderMinutesBefore?: number[];
  enabled: boolean;
}

export interface CreateWeeklyRoutinePayload {
  daysOfWeek: DayOfWeekType[];
  title: string;
  detail?: string;
  startTime: string;
  endTime: string;
  category: BlockCategory;
  energyLevel: EnergyLevel;
  priority?: string;
  reminderMinutesBefore?: number[];
}

export interface Holiday {
  date: string; // "YYYY-MM-DD"
  name: string;
  englishName: string;
  lunarDate?: string;
  isStatutory: boolean;
  description?: string;
}

export interface DaySummary {
  date: string;
  dayOfWeek: string;
  totalTasks: number;
  isHoliday: boolean;
  holidayName?: string;
  isStatutory?: boolean;
}

export interface MonthlySummaryResponse {
  year: number;
  month: number;
  days: DaySummary[];
  holidays: Holiday[];
}

export interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  energyImpact: EnergyLevel;
  highlightText: string;
  tag: 'Optimized' | 'Low-Demand' | 'Alternative';
  blocks: TimeBlock[];
}

export interface ExplanationDetails {
  whatChanged: string;
  whatWillHappen: string;
  reasons: string[];
  confidenceLevel?: number;
}

export interface RescheduleResponse {
  analysis: string;
  recommendedScenario?: ScenarioOption;
  alternativeScenarios?: ScenarioOption[];
  explanation?: ExplanationDetails;
  scenarios: ScenarioOption[];
}

export interface ChatMessage {
  id?: number;
  conversationId?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadataJson?: string;
  createdAt?: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  lastMessagePreview?: string;
}

export interface AdaptationAction {
  id: number;
  conversationId?: number;
  date: string;
  reason: string;
  selectedScenarioId?: string;
  scenarioTitle?: string;
  explanationJson?: string;
  beforeSnapshotJson?: string;
  afterSnapshotJson?: string;
  status: 'APPLIED' | 'ROLLED_BACK' | 'UNDONE';
  createdAt: string;
}

export interface CalmSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  calmScore: number;
  reason: string;
  isRecommended: boolean;
}

export type DisruptionState = 'idle' | 'impact' | 'adapted';

export interface ProjectSubtask {
  id: number;
  projectId: number;
  milestoneName: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  scheduledDate?: string;
  timeBlockId?: number;
  orderIndex: number;
}

export interface ProjectGoal {
  id: number;
  title: string;
  description?: string;
  officialDeadline: string;
  internalTargetDate: string;
  bufferDays: number;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  feasibilityStatus: 'FEASIBLE' | 'TIGHT' | 'NOT_FEASIBLE';
  conversationId?: number;
  createdAt?: string;
  updatedAt?: string;
  subtasks: ProjectSubtask[];
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
  progressPercentage: number;
  currentMilestone: string;
  remainingBufferDays: number;
}

export interface GoalMilestone {
  name: string;
  totalMinutes: number;
  subtasks: {
    title: string;
    estimatedMinutes: number;
    orderIndex?: number;
  }[];
}

export interface DailyRoadmapDay {
  date: string;
  dayOfWeek: string;
  formattedDate: string;
  isBufferDay?: boolean;
  blocks: {
    startTime: string;
    endTime: string;
    milestoneName: string;
    title: string;
    durationMinutes: number;
    blockType: 'EXISTING_WORK_FIT' | 'DEDICATED_DEEP_WORK' | 'FLEXIBLE_SLOT' | 'BUFFER';
    note?: string;
    subtaskTitles: string[];
  }[];
}

export interface GoalScenarioOption {
  id: string;
  title: string;
  badge: 'RECOMMENDED' | 'FASTER' | 'LOW_PRESSURE';
  description: string;
  internalTargetDate: string;
  bufferDays: number;
  daysCount: number;
  totalPlannedMinutes: number;
  strategySummary: string;
  roadmapDays: DailyRoadmapDay[];
}

export interface GoalDecompositionResponse {
  goalTitle: string;
  summaryMessage: string;
  officialDeadline: string;
  internalTargetDate: string;
  bufferDays: number;
  totalRequiredMinutes: number;
  availableHours: number;
  feasibilityStatus: 'FEASIBLE' | 'TIGHT' | 'NOT_FEASIBLE';
  feasibilityRationale: string;
  milestones: GoalMilestone[];
  scenarios: GoalScenarioOption[];
}

export interface GoalRebalanceOption {
  id: string;
  title: string;
  badge: 'RECOMMENDED' | 'FASTER' | 'BUFFER';
  description: string;
  impactSummary: string;
  deadlineSafe: boolean;
  modifiedDays: DailyRoadmapDay[];
}

export interface GoalRebalanceResponse {
  projectId: number;
  overdueMinutes: number;
  companionMessage: string;
  options: GoalRebalanceOption[];
}

export type NotificationType =
  | 'BLOCK_STARTING'
  | 'BLOCK_STARTED'
  | 'BLOCK_ENDED'
  | 'DEADLINE_WARNING'
  | 'TASK_OVERDUE'
  | 'SCHEDULE_CONFLICT'
  | 'REBALANCE_AVAILABLE'
  | 'SCHEDULE_CHANGED'
  | 'MILESTONE_COMPLETED'
  | 'PROJECT_COMPLETED';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH';

export interface NotificationItem {
  id: number;
  userId?: string;
  type: NotificationType | string;
  priority: NotificationPriority | string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  actionType?: string;
  actionData?: string;
  isRead: boolean;
  readAt?: string;
  eventKey?: string;
  scheduledFor?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  inAppEnabled: boolean;
  browserEnabled: boolean;
  soundEnabled: boolean;
  remindMinutesBefore: number; // e.g. 5, 10, 15
  suppressDuringFocus: boolean;
  suppressDuringBreak: boolean;
  suppressDuringSleep: boolean;
}

export type PeriodFlow = 'NONE' | 'SPOTTING' | 'LIGHT' | 'MEDIUM' | 'HEAVY';

export interface DailyCheckin {
  id?: number;
  userId?: string;
  checkinDate: string; // YYYY-MM-DD
  moodEmoji?: string;
  moodLabel?: string;
  energyLevel?: number; // 1 to 5
  note?: string;
  isPeriodDay: boolean;
  flowIntensity?: PeriodFlow;
  createdAt?: string;
  updatedAt?: string;
}

export interface PredictedCycleWindow {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  confidenceScore: number;
  label: string;
}

export interface CyclePrediction {
  averageCycleLengthDays: number;
  averagePeriodDurationDays: number;
  totalCyclesLogged: number;
  lastPeriodStartDate?: string;
  predictedWindows: PredictedCycleWindow[];
}

export interface ProactiveAdaptationResponse {
  hasRecommendation: boolean;
  reason?: string;
  suggestedAction?: string;
  heavyBlockIds?: number[];
  proposedChangesSummary?: string[];
}

export type SensoryMode = 'calm' | 'balanced' | 'focus';

export interface AccessibilityProfile {
  id?: number;
  userId?: string;
  visualDensity: 'low' | 'medium' | 'high';
  sensorySensitivity: 'high' | 'medium' | 'standard';
  focusSupport: 'single-task' | 'now-next' | 'full-timeline';
  scheduleStructure: 'flexible' | 'balanced' | 'structured';
  notificationStyle: 'gentle' | 'standard' | 'persistent';
  communicationStyle: 'empathetic' | 'concise' | 'direct';
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingAnswers {
  infoStyle: 'VISUAL' | 'TEXT' | 'MIXED';
  distractionSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  reminderPreference: 'GENTLE' | 'STANDARD' | 'PERSISTENT';
  schedulePreference: 'FLEXIBLE' | 'BALANCED' | 'STRUCTURED';
}

export interface ResolvedAccessibilityConfig {
  mode: SensoryMode;
  animationState: 'none' | 'reduced' | 'full';
  taskDisplayLimit: number; // 1 = focus only, 2 = now + next, 0 = all
  hideSecondaryWidgets: boolean;
  soundVolumeLevel: 'muted' | 'gentle-432hz' | 'standard';
  themePalette: 'sensory-calm' | 'standard' | 'high-contrast';
  communicationTone: 'empathetic' | 'concise' | 'direct';
}

export type CognitiveLoadLevel = 'LIGHT' | 'MODERATE' | 'HEAVY';

export interface CognitiveMetrics {
  totalTasks: number;
  meetingCount: number;
  backToBackCount: number;
  contextSwitchCount: number;
  highFocusHours: number;
  totalBufferMinutes: number;
  deadlineCount: number;
}

export interface CognitiveLoadAssessment {
  date: string;
  score: number; // 0 to 100
  level: CognitiveLoadLevel;
  summary: string;
  bulletPoints: string[];
  metrics: CognitiveMetrics;
  isDemanding: boolean;
}

export interface QuickRebalanceOption {
  id: string;
  type: 'ADD_BUFFER' | 'MOVE_FLEXIBLE_TASK' | 'REDUCE_CONTEXT_SWITCH' | string;
  title: string;
  description: string;
  estimatedLoadReduction: number;
  diff: {
    movedBlockCount: number;
    bufferAddedMinutes: number;
    deferredBlockCount: number;
  };
  proposedBlocks: TimeBlock[];
}

export interface QuickRebalanceProposal {
  date: string;
  loadScore: number;
  options: QuickRebalanceOption[];
}




