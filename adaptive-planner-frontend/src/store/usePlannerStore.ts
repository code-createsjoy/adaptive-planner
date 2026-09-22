import { create } from 'zustand';
import { TimeBlock, ScenarioOption, DisruptionState } from '@/types/planner';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const mockScenarios: ScenarioOption[] = [
  {
    id: 'opt-a',
    title: 'Balanced Adaptation (Recommended)',
    description: 'Shorten non-urgent items, slide dinner smoothly, and protect your evening recharge.',
    energyImpact: 'medium',
    highlightText: 'Protects evening recharge time while accommodating the urgent schedule change.',
    tag: 'Optimized',
    blocks: [],
  },
  {
    id: 'opt-b',
    title: 'Low-Demand / Zero-Guilt Mode',
    description: 'Postpone flexible tasks to tomorrow with zero guilt. Give yourself a quiet buffer.',
    energyImpact: 'low',
    highlightText: 'Saves spoons for tomorrow when your cognitive tank is recharged.',
    tag: 'Low-Demand',
    blocks: [],
  },
];

interface PlannerState {
  timeBlocks: TimeBlock[];
  selectedBlockId: string | null;
  disruptionState: DisruptionState;
  selectedScenarioIndex: number;
  scenarios: ScenarioOption[];
  currentTimeStr: string;
  selectedDate: string; // "YYYY-MM-DD"
  activeView: 'timeline' | 'calendar';
  isRoutineModalOpen: boolean;

  setTimeBlocks: (blocks: TimeBlock[]) => void;
  setSelectedBlockId: (id: string | null) => void;
  setDisruptionState: (state: DisruptionState) => void;
  setSelectedScenarioIndex: (index: number) => void;
  setSelectedDate: (date: string) => void;
  setActiveView: (view: 'timeline' | 'calendar') => void;
  setIsRoutineModalOpen: (open: boolean) => void;
  addBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteBlock: (id: string) => void;
  setScenarios: (scenarios: ScenarioOption[]) => void;
  toggleMicroStep: (blockId: string, stepId: string) => void;
  addMicroStep: (blockId: string, text: string) => void;
  updateMicroSteps: (blockId: string, microSteps: Array<{ id: string; text: string; done: boolean }>) => void;
  applyScenario: (scenarioIndex: number) => void;
  resetDisruption: () => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  timeBlocks: [],
  selectedBlockId: null,
  disruptionState: 'idle',
  selectedScenarioIndex: 0,
  scenarios: mockScenarios,
  currentTimeStr: '10:15',
  selectedDate: getTodayDateString(),
  activeView: 'timeline',
  isRoutineModalOpen: false,

  setTimeBlocks: (blocks) => set({ timeBlocks: blocks }),
  setSelectedBlockId: (id) => set({ selectedBlockId: id }),
  setDisruptionState: (state) => set({ disruptionState: state }),
  setSelectedScenarioIndex: (index) => set({ selectedScenarioIndex: index }),
  setScenarios: (scenarios) => set({ scenarios }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveView: (view) => set({ activeView: view }),
  setIsRoutineModalOpen: (open) => set({ isRoutineModalOpen: open }),

  addBlock: (blockData) =>
    set((state) => ({
      timeBlocks: [
        ...state.timeBlocks,
        { ...blockData, id: `block-${Date.now()}` },
      ].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })),

  updateBlock: (id: string, updates: Partial<TimeBlock>) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  deleteBlock: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.filter((b) => b.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
    })),

  toggleMicroStep: (blockId, stepId) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) => {
        if (b.id !== blockId || !b.microSteps) return b;
        return {
          ...b,
          microSteps: b.microSteps.map((s) =>
            s.id === stepId ? { ...s, done: !s.done } : s
          ),
        };
      }),
    })),

  addMicroStep: (blockId, text) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) => {
        if (b.id !== blockId) return b;
        const newStep = { id: `ms-${Date.now()}`, text, done: false };
        return {
          ...b,
          microSteps: [...(b.microSteps || []), newStep],
        };
      }),
    })),

  updateMicroSteps: (blockId, microSteps) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) =>
        b.id === blockId ? { ...b, microSteps } : b
      ),
    })),

  applyScenario: (scenarioIndex) =>
    set((state) => {
      const scenario = state.scenarios[scenarioIndex];
      if (!scenario) return state;
      return {
        timeBlocks: scenario.blocks,
        disruptionState: 'adapted',
      };
    }),

  resetDisruption: () => set({ disruptionState: 'idle' }),
}));
