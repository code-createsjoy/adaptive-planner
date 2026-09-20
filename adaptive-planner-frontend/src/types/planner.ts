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

export interface AdaptationAction {
  id: number;
  createdAt: string;
  beforeStateJson: string;
  afterStateJson: string;
  urgentEventTitle: string;
  status: 'APPLIED' | 'ROLLED_BACK';
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
