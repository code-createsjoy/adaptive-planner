export type JourneyStage =
  | 'STUDYING'
  | 'EXPLORING_CAREERS'
  | 'JOB_SEARCHING'
  | 'INTERVIEW_PREPARATION'
  | 'STARTING_NEW_JOB'
  | 'CURRENTLY_WORKING'
  | 'OTHER'
  | 'PREFER_NOT_TO_SAY';

export type DiagnosticStatus =
  | 'PROFESSIONAL_DIAGNOSIS'
  | 'SELF_IDENTIFIED'
  | 'THINK_MAY_BE'
  | 'NEUROTYPICAL'
  | 'NOT_SURE'
  | 'PREFER_NOT_TO_SAY';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  platformRole: string;
  journeyStage?: JourneyStage | null;
  onboardingCompleted: boolean;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: UserDto;
}

export interface JourneyStageRequest {
  stage: JourneyStage;
}

export interface NeurodivergenceSelfIdRequest {
  identifiedTraits: string[];
  diagnosticStatus: DiagnosticStatus;
  primaryChallenges: string[];
  strengths: string[];
}

export interface NeurodivergenceProfileDto {
  id: number;
  identifiedTraits: string[];
  diagnosticStatus: DiagnosticStatus;
  primaryChallenges: string[];
  strengths: string[];
  isPrivate: boolean;
}

export interface AssessmentAnswerItem {
  questionId: string;
  dimension: string;
  scoreValue: number;
}

export interface AssessmentSubmissionRequest {
  answers: AssessmentAnswerItem[];
}

export interface FunctionalProfileDto {
  id: number;
  userId: number;
  attentionScore: number;
  initiationScore: number;
  timeAwarenessScore: number;
  contextSwitchScore: number;
  sensorySensitivityScore: number;
  structureNeedScore: number;
  recommendedSensoryMode: 'CALM' | 'FOCUS' | 'BALANCED';
  recommendedPacing: 'MICRO_STEPS' | 'POMODORO' | 'TIME_BOXING' | 'FLOW_STATE';
  recommendedDensity: 'SPACIOUS' | 'BALANCED' | 'COMPACT';
  supportiveSummary: string;
  traitsSummary: string[];
  medicalDisclaimer: string;
}
