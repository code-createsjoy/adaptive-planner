import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuidanceStyle = 'minimal' | 'guided' | 'detailed';

export interface GuidanceState {
  isTourActive: boolean;
  currentTourStep: number;
  tourDismissed: boolean;
  tourCompleted: boolean;
  guidanceStyle: GuidanceStyle;
  seenTips: Record<string, boolean>;
  isHelpDrawerOpen: boolean;

  // Actions
  startTour: (step?: number) => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetAllGuidance: () => void;
  markTipSeen: (tipId: string) => void;
  setHelpDrawerOpen: (open: boolean) => void;
  setGuidanceStyle: (style: GuidanceStyle) => void;
}

export const useGuidanceStore = create<GuidanceState>()(
  persist(
    (set) => ({
      isTourActive: false,
      currentTourStep: 0,
      tourDismissed: false,
      tourCompleted: false,
      guidanceStyle: 'guided',
      seenTips: {},
      isHelpDrawerOpen: false,

      startTour: (step = 0) =>
        set({
          isTourActive: true,
          currentTourStep: step,
          tourDismissed: false,
        }),

      nextTourStep: () =>
        set((state) => ({
          currentTourStep: state.currentTourStep + 1,
        })),

      prevTourStep: () =>
        set((state) => ({
          currentTourStep: Math.max(0, state.currentTourStep - 1),
        })),

      skipTour: () =>
        set({
          isTourActive: false,
          tourDismissed: true,
        }),

      completeTour: () =>
        set({
          isTourActive: false,
          tourCompleted: true,
          tourDismissed: false,
        }),

      resetAllGuidance: () =>
        set({
          isTourActive: true,
          currentTourStep: 0,
          tourDismissed: false,
          tourCompleted: false,
          seenTips: {},
        }),

      markTipSeen: (tipId: string) =>
        set((state) => ({
          seenTips: {
            ...state.seenTips,
            [tipId]: true,
          },
        })),

      setHelpDrawerOpen: (open: boolean) =>
        set({ isHelpDrawerOpen: open }),

      setGuidanceStyle: (style: GuidanceStyle) =>
        set({ guidanceStyle: style }),
    }),
    {
      name: 'modo-guidance-storage',
      partialize: (state) => ({
        tourDismissed: state.tourDismissed,
        tourCompleted: state.tourCompleted,
        guidanceStyle: state.guidanceStyle,
        seenTips: state.seenTips,
      }),
    }
  )
);
