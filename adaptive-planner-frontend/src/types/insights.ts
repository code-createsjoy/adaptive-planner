export interface WeeklyInsightsResponse {
  weekStart: string;
  weekEnd: string;
  dataThrough: string;
  timezone: string;
  periodLabel: string;
  coverage: InsightsCoverage;
  metrics: InsightsMetrics;
  patterns: InsightPattern[];
  recommendations: InsightRecommendation[];
  experimentState: InsightExperimentState | null;
  previousWeekComparison: PreviousWeekComparison;
}

export interface InsightsCoverage {
  coveredDays: number;
  minimumCoveredDays: number;
  eligibleBlocks: number;
  malformedBlocks: number;
  sufficient: boolean;
  limitations: string[];
  exclusions: string[];
}

export interface InsightsMetrics {
  scheduledBlocks: number;
  completedBlocks: number;
  completionRatePercent: number | null;
  completionByDaypart: DaypartMetric[];
  transitions: TransitionMetric;
  adaptations: AdaptationMetric;
}

export interface DaypartMetric {
  daypart: string;
  eligibleBlocks: number;
  completedBlocks: number;
  completionRatePercent: number | null;
}

export interface TransitionMetric {
  opportunities: number;
  covered: number;
  coverageRatePercent: number | null;
}

export interface AdaptationMetric {
  applied: number;
  rolledBack: number;
  undone: number;
}

export interface InsightEvidence {
  type: string;
  id: string;
  date: string;
  label: string;
}

export interface InsightPattern {
  ruleKey: string;
  title: string;
  observation: string;
  sampleSize: number;
  confidence: string;
  evidenceFingerprint: string;
  evidence: InsightEvidence[];
}

export interface InsightRecommendation {
  ruleKey: string;
  title: string;
  rationale: string;
  measurableAction: string;
  evidenceFingerprint: string;
  sampleSize: number;
}

export interface InsightExperimentState {
  id: number;
  ruleKey: string;
  evidenceFingerprint: string;
  status: string;
  reminderDate: string;
}

export interface PreviousWeekComparison {
  eligible: boolean;
  omittedReason: string | null;
  deltas: Array<{ metric: string; absoluteDelta: number }>;
}

export type DominantPeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'BALANCED';
export type PatternMaturity = 'EARLY' | 'CONFIRMED';

export interface DaypartRhythm {
  morningFocusMinutes: number;
  afternoonFocusMinutes: number;
  eveningFocusMinutes: number;
  dominantPeriod: DominantPeriod;
}

export interface PatternObservation {
  maturity: PatternMaturity;
  tag: string;
  observation: string;
  evidenceDetail: string;
}

export interface CurrentWeekProgress {
  weekStart: string;
  weekEnd: string;
  dayIndex: number;
  totalDaysInWeek: number;
  completedTasks: number;
  scheduledTasks: number;
  completionRate: number;
  totalFocusMinutes: number;
  focusSessionsCount: number;
  daypartRhythm: DaypartRhythm;
  pattern: PatternObservation;
}

export interface LastWeekSuggestion {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface LastWeekReflection {
  weekStart: string;
  weekEnd: string;
  completedTasks: number;
  scheduledTasks: number;
  completionRate: number;
  totalFocusMinutes: number;
  dominantPattern: string;
  whyReason: string;
  suggestion?: LastWeekSuggestion;
}

export interface ProgressiveInsightsData {
  currentWeek: CurrentWeekProgress;
  lastWeek: LastWeekReflection;
}

