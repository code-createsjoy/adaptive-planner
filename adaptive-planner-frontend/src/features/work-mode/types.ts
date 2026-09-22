export type SharingVisibility = 'private' | 'manager' | 'team';

export interface FocusPreferences {
  bestFocusTime: string; // e.g. "09:00 - 11:00"
  deepWorkDuration: string; // e.g. "90 mins"
  meetingFreePref: string; // e.g. "Mornings preferred meeting-free"
  interruptionSensitivity: 'high' | 'medium' | 'low';
  preferredEnvironment: string[]; // e.g. ["Noise-cancelling headphones", "Async chat only", "Quiet room"]
  customNote?: string;
}

export interface CommunicationPreferences {
  channels: string[]; // e.g. ["Written communication", "Async chat", "Email summary"]
  formats: string[]; // e.g. ["Short bullet points", "Step-by-step instructions", "Visual diagrams"]
  customNote?: string;
}

export interface TaskPreferences {
  preferences: string[]; // e.g. ["One priority at a time", "Break large tasks into smaller steps", "Clear deadline", "Clear expected output", "Checklist format", "Time-blocking"]
  customNote?: string;
}

export interface FeedbackPreferences {
  preferences: string[]; // e.g. ["Private feedback", "Direct & actionable", "Specific examples", "Written notes", "Include next steps", "Allow processing time"]
  customNote?: string;
}

export interface MeetingPreferences {
  preferences: string[]; // e.g. ["Agenda before meeting", "Written notes after meeting", "Camera optional", "Short meetings (< 30m)", "Processing time before answering", "Avoid back-to-back"]
  customNote?: string;
}

export interface ContextSwitchingPreferences {
  preferences: string[]; // e.g. ["Prefer fewer task switches", "Need 10-15m transition buffer", "Batch similar tasks together", "Avoid sudden context shifts"]
  customNote?: string;
}

export interface StrengthsPreferences {
  strengths: string[]; // e.g. ["Deep focus & flow", "Pattern recognition", "Creative thinking", "Detail-oriented work", "Analytical problem solving", "Structured execution", "Thorough research", "Technical depth"]
  customNote?: string;
}

export interface CategoryVisibilitySettings {
  focus: SharingVisibility;
  communication: SharingVisibility;
  task: SharingVisibility;
  feedback: SharingVisibility;
  meeting: SharingVisibility;
  contextSwitching: SharingVisibility;
  strengths: SharingVisibility;
}

export interface WorkplacePassport {
  userId: string;
  userName: string;
  userRole: string;
  avatarUrl?: string;
  focus: FocusPreferences;
  communication: CommunicationPreferences;
  task: TaskPreferences;
  feedback: FeedbackPreferences;
  meeting: MeetingPreferences;
  contextSwitching: ContextSwitchingPreferences;
  strengths: StrengthsPreferences;
  visibility: CategoryVisibilitySettings;
  lastUpdated: string;
}

export interface AiSuggestedInsight {
  id: string;
  category: keyof CategoryVisibilitySettings;
  title: string;
  insightText: string;
  recommendedValue: string;
  sourceReason: string;
  status: 'pending' | 'approved' | 'dismissed';
}

export interface AdaptedTask {
  id: string;
  goal: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: string[];
  expectedOutput: string;
  suggestedFirstAction: string;
  originalRequest: string;
  assignedBy: string;
  assignedTo: string;
  targetDate: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}
