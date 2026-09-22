import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AdaptedTask,
  AiSuggestedInsight,
  CategoryVisibilitySettings,
  SharingVisibility,
  WorkplacePassport,
} from '../types';

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const DEFAULT_PASSPORT: WorkplacePassport = {
  userId: 'user-thai',
  userName: 'Thai',
  userRole: 'Senior Product Designer & Engineer',
  avatarUrl: '/thai-avatar.jpg',
  focus: {
    bestFocusTime: '09:00 - 11:00',
    deepWorkDuration: '90 mins',
    meetingFreePref: 'Mornings preferred meeting-free',
    interruptionSensitivity: 'high',
    preferredEnvironment: [
      'Noise-cancelling headphones',
      'Async chat only',
      'Quiet room',
      'No surprise calls',
    ],
    customNote: '9:00 AM – 11:00 AM is usually my strongest focus period for complex architecture and deep planning.',
  },
  communication: {
    channels: ['Written communication', 'Async chat (Slack/Discord)', 'Email summary'],
    formats: [
      'Short bullet points',
      'Step-by-step instructions',
      'Visual diagrams / sketches',
    ],
    customNote: 'For important tasks, written instructions help me remember and process information better without anxiety.',
  },
  task: {
    preferences: [
      'One priority at a time',
      'Break large tasks into smaller steps',
      'Clear deadline',
      'Clear expected output',
      'Checklist format',
      'Time-blocking',
    ],
    customNote: 'Large tasks work much better for me when they are broken into clear micro-milestones with a defined finish line.',
  },
  feedback: {
    preferences: [
      'Private feedback',
      'Direct & actionable',
      'Specific examples',
      'Written notes',
      'Include next steps',
      'Allow processing time',
    ],
    customNote: 'I prefer feedback that clearly explains the issue, gives a concrete example, and suggests the immediate next action.',
  },
  meeting: {
    preferences: [
      'Agenda before meeting',
      'Written notes after meeting',
      'Camera optional',
      'Short meetings (< 30m)',
      'Processing time before answering',
      'Avoid back-to-back meetings',
    ],
    customNote: 'Having a brief bullet agenda beforehand allows me to prep thoughts and contribute calmly.',
  },
  contextSwitching: {
    preferences: [
      'Prefer fewer task switches',
      'Need 10-15m transition buffer',
      'Batch similar tasks together',
      'Avoid sudden mid-day priority changes',
    ],
    customNote: 'Frequent context switching reduces my focus. A short transition period between different tasks helps recharge.',
  },
  strengths: {
    strengths: [
      'Deep focus & flow',
      'Pattern recognition',
      'Creative problem solving',
      'Detail-oriented architecture',
      'Structured execution',
      'Thorough research',
      'Technical depth',
    ],
    customNote: 'Excels at untangling complex product flows, designing elegant system state, and deep technical execution.',
  },
  visibility: {
    focus: 'manager',
    communication: 'team',
    task: 'manager',
    feedback: 'manager',
    meeting: 'team',
    contextSwitching: 'manager',
    strengths: 'team',
  },
  lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
};

const INITIAL_INSIGHTS: AiSuggestedInsight[] = [
  {
    id: 'insight-1',
    category: 'focus',
    title: 'Optimal Deep-Work Window Detected',
    insightText:
      'Modo noticed that you complete deep focus sessions 40% more consistently between 9:00 AM and 11:00 AM with zero reschedule fatigue.',
    recommendedValue: '9:00 AM – 11:00 AM is my peak focus window',
    sourceReason: 'Derived privately from 14 days of calendar completion patterns',
    status: 'pending',
  },
];

const INITIAL_TRANSLATED_TASKS: AdaptedTask[] = [
  {
    id: 'task-comp-1',
    goal: 'Prepare Competitor Research & Analysis Presentation',
    deadline: 'Friday, 5:00 PM',
    priority: 'High',
    steps: [
      'Identify and catalog top 5 competitor platforms & pricing models',
      'Compare core features, positioning, and UX strengths vs weaknesses',
      'Structure an 8–10 slide summary deck highlighting market opportunities',
      'Add bulleted executive takeaways and share preview draft with manager',
    ],
    expectedOutput: '8–10 slides presentation deck with 5 competitor breakdown tables',
    suggestedFirstAction: 'Start by listing the 5 competitor names in a scratchpad (5–10 mins)',
    originalRequest: 'Prepare competitor research and presentation by Friday.',
    assignedBy: 'Alex (Design Lead)',
    assignedTo: 'Thai',
    targetDate: getTomorrowDateString(),
    startTime: '10:00',
    endTime: '11:30',
    createdAt: new Date().toISOString(),
  },
];

interface WorkModeState {
  activeRole: 'employee' | 'manager';
  passport: WorkplacePassport;
  suggestedInsights: AiSuggestedInsight[];
  translatedTasks: AdaptedTask[];

  // Actions
  setActiveRole: (role: 'employee' | 'manager') => void;
  updateCategoryData: <K extends keyof CategoryVisibilitySettings>(
    categoryKey: K,
    data: Partial<WorkplacePassport[K]>
  ) => void;
  setCategoryVisibility: (categoryKey: keyof CategoryVisibilitySettings, visibility: SharingVisibility) => void;
  approveAiInsight: (insightId: string) => void;
  dismissAiInsight: (insightId: string) => void;
  translateManagerTask: (
    rawText: string,
    deadline?: string,
    priority?: 'High' | 'Medium' | 'Low',
    assignedTo?: string
  ) => AdaptedTask;
  deleteTranslatedTask: (taskId: string) => void;
  resetToDemoPassport: () => void;
}

export const useWorkModeStore = create<WorkModeState>()(
  persist(
    (set, get) => ({
      activeRole: 'employee',
      passport: DEFAULT_PASSPORT,
      suggestedInsights: INITIAL_INSIGHTS,
      translatedTasks: INITIAL_TRANSLATED_TASKS,

      setActiveRole: (role) => set({ activeRole: role }),

      updateCategoryData: (categoryKey, data) => {
        set((state) => ({
          passport: {
            ...state.passport,
            [categoryKey]: {
              ...(state.passport[categoryKey] as any),
              ...data,
            },
            lastUpdated: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          },
        }));
      },

      setCategoryVisibility: (categoryKey, visibility) => {
        set((state) => ({
          passport: {
            ...state.passport,
            visibility: {
              ...state.passport.visibility,
              [categoryKey]: visibility,
            },
          },
        }));
      },

      approveAiInsight: (insightId) => {
        set((state) => {
          const insight = state.suggestedInsights.find((i) => i.id === insightId);
          if (!insight) return state;

          const updatedPassport = { ...state.passport };
          if (insight.category === 'focus') {
            updatedPassport.focus = {
              ...updatedPassport.focus,
              bestFocusTime: '09:00 - 11:00',
              customNote: `${updatedPassport.focus.customNote || ''} (AI Verified: 9:00 - 11:00 AM peak focus window)`.trim(),
            };
          }

          return {
            passport: updatedPassport,
            suggestedInsights: state.suggestedInsights.map((i) =>
              i.id === insightId ? { ...i, status: 'approved' as const } : i
            ),
          };
        });
      },

      dismissAiInsight: (insightId) => {
        set((state) => ({
          suggestedInsights: state.suggestedInsights.map((i) =>
            i.id === insightId ? { ...i, status: 'dismissed' as const } : i
          ),
        }));
      },

      translateManagerTask: (rawText, deadline = 'Tomorrow, 5:00 PM', priority = 'High', assignedTo = 'Thai') => {
        const state = get();
        const passport = state.passport;

        // Deterministic neuro-inclusive AI task translator based on user's passport preferences
        const taskSteps = generateMicroSteps(rawText, passport);
        const expectedOutput = generateExpectedOutput(rawText);
        const suggestedFirstAction = generateFirstAction(rawText, taskSteps[0]);

        const newTask: AdaptedTask = {
          id: `task-${Date.now()}`,
          goal: rawText.length > 60 ? `${rawText.slice(0, 57)}...` : rawText,
          deadline,
          priority,
          steps: taskSteps,
          expectedOutput,
          suggestedFirstAction,
          originalRequest: rawText,
          assignedBy: 'Alex (Design Lead)',
          assignedTo,
          targetDate: getTomorrowDateString(),
          startTime: '09:30',
          endTime: '11:00',
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          translatedTasks: [newTask, ...s.translatedTasks],
        }));

        return newTask;
      },

      deleteTranslatedTask: (taskId) => {
        set((state) => ({
          translatedTasks: state.translatedTasks.filter((t) => t.id !== taskId),
        }));
      },

      resetToDemoPassport: () => {
        set({
          activeRole: 'employee',
          passport: DEFAULT_PASSPORT,
          suggestedInsights: INITIAL_INSIGHTS,
          translatedTasks: INITIAL_TRANSLATED_TASKS,
        });
      },
    }),
    {
      name: 'modo_work_mode_storage_v1',
    }
  )
);

// Helper heuristics to generate structured breakdown from raw manager instructions
function generateMicroSteps(raw: string, _passport: WorkplacePassport): string[] {
  const lower = raw.toLowerCase();
  if (lower.includes('competitor') || lower.includes('research')) {
    return [
      'Step 1: Identify and list 5 key competitor products',
      'Step 2: Compare pricing tiers, core feature offerings, and positioning',
      'Step 3: Document top 3 UX strengths and weaknesses for each',
      'Step 4: Synthesize summary recommendations into presentation format',
    ];
  }
  if (lower.includes('bug') || lower.includes('fix') || lower.includes('refactor')) {
    return [
      'Step 1: Reproduce issue locally and isolate root cause component',
      'Step 2: Draft unit tests covering the failure condition',
      'Step 3: Implement clean fix and verify test suite passes',
      'Step 4: Open pull request with concise summary and verification notes',
    ];
  }
  if (lower.includes('slide') || lower.includes('presentation') || lower.includes('deck')) {
    return [
      'Step 1: Outline core message and 3 key takeaways on paper',
      'Step 2: Draft slide structure (Problem → Approach → Results)',
      'Step 3: Insert diagrams and concise bullet points',
      'Step 4: Do a 5-minute timed run-through',
    ];
  }

  // Default structured breakdown
  return [
    `Step 1: Clarify scope & gather required reference materials for "${raw.slice(0, 30)}"`,
    'Step 2: Complete first core draft in a dedicated 45-minute focus block',
    'Step 3: Self-review against expected output criteria',
    'Step 4: Finalize deliverable and share update with team',
  ];
}

function generateExpectedOutput(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('presentation') || lower.includes('deck') || lower.includes('slide')) {
    return '8–10 slides structured deck with clear visual takeaways';
  }
  if (lower.includes('research') || lower.includes('competitor')) {
    return 'Detailed competitor comparison table with executive summary bullet points';
  }
  if (lower.includes('bug') || lower.includes('fix')) {
    return 'PR with passing automated tests and verification diff';
  }
  return 'Clear completed deliverable matching the specified milestone checklist';
}

function generateFirstAction(_raw: string, firstStep: string): string {
  return `Start with: "${firstStep}" (Spend just 5–10 minutes getting initial momentum)`;
}
