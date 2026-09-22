import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccessibilityProfile, SensoryMode, ResolvedAccessibilityConfig } from '@/types/planner';

const DEFAULT_PROFILE: AccessibilityProfile = {
  visualDensity: 'medium',
  sensorySensitivity: 'high',
  focusSupport: 'now-next',
  scheduleStructure: 'flexible',
  notificationStyle: 'gentle',
  communicationStyle: 'empathetic',
  onboardingCompleted: false,
};

function computeResolvedConfig(currentMode: SensoryMode, profile: AccessibilityProfile): ResolvedAccessibilityConfig {
  if (currentMode === 'calm') {
    return {
      mode: 'calm',
      animationState: 'reduced',
      taskDisplayLimit: 2, // Now + Next only
      hideSecondaryWidgets: true,
      soundVolumeLevel: 'gentle-432hz',
      themePalette: 'sensory-calm',
      communicationTone: 'empathetic',
    };
  }

  if (currentMode === 'focus') {
    return {
      mode: 'focus',
      animationState: 'none',
      taskDisplayLimit: 1, // Single active task only
      hideSecondaryWidgets: true,
      soundVolumeLevel: 'muted',
      themePalette: 'standard',
      communicationTone: 'concise',
    };
  }

  // Balanced mode reflects baseline profile
  return {
    mode: 'balanced',
    animationState: profile.sensorySensitivity === 'high' ? 'reduced' : 'full',
    taskDisplayLimit: profile.focusSupport === 'single-task' ? 1 : profile.focusSupport === 'now-next' ? 2 : 0,
    hideSecondaryWidgets: false,
    soundVolumeLevel: profile.notificationStyle === 'gentle' ? 'gentle-432hz' : 'standard',
    themePalette: profile.sensorySensitivity === 'high' ? 'sensory-calm' : 'standard',
    communicationTone: profile.communicationStyle,
  };
}

interface AccessibilityState {
  profile: AccessibilityProfile;
  currentMode: SensoryMode;
  isModeOverridden: boolean;
  isOnboardingOpen: boolean;
  resolvedConfig: ResolvedAccessibilityConfig;

  setProfile: (profile: Partial<AccessibilityProfile>) => void;
  setMode: (mode: SensoryMode) => void;
  resetToBaseline: () => void;
  setIsOnboardingOpen: (open: boolean) => void;
  getResolvedConfig: () => ResolvedAccessibilityConfig;
}

function applyDOMAttributes(mode: SensoryMode, profile: AccessibilityProfile) {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.sensoryMode = mode;
  const isReducedMotion = mode === 'calm' || profile.sensorySensitivity === 'high';
  document.documentElement.dataset.reducedMotion = isReducedMotion ? 'true' : 'false';

  const isLowDensity = mode === 'calm' || profile.visualDensity === 'low';
  document.documentElement.dataset.visualDensity = isLowDensity ? 'calm' : 'standard';
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      currentMode: 'balanced',
      isModeOverridden: false,
      isOnboardingOpen: false,
      resolvedConfig: computeResolvedConfig('balanced', DEFAULT_PROFILE),

      setProfile: (newProfile) => {
        set((state) => {
          const updatedProfile = { ...state.profile, ...newProfile };
          applyDOMAttributes(state.currentMode, updatedProfile);
          return {
            profile: updatedProfile,
            resolvedConfig: computeResolvedConfig(state.currentMode, updatedProfile),
          };
        });
      },

      setMode: (mode) => {
        set((state) => {
          applyDOMAttributes(mode, state.profile);
          return {
            currentMode: mode,
            isModeOverridden: mode !== 'balanced',
            resolvedConfig: computeResolvedConfig(mode, state.profile),
          };
        });
      },

      resetToBaseline: () => {
        set((state) => {
          applyDOMAttributes('balanced', state.profile);
          return {
            currentMode: 'balanced',
            isModeOverridden: false,
            resolvedConfig: computeResolvedConfig('balanced', state.profile),
          };
        });
      },

      setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),

      getResolvedConfig: () => {
        return get().resolvedConfig;
      },
    }),
    {
      name: 'modo_accessibility_profile_v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const mode = state.currentMode || 'balanced';
          const prof = state.profile || DEFAULT_PROFILE;
          applyDOMAttributes(mode, prof);
          state.resolvedConfig = computeResolvedConfig(mode, prof);
        }
      },
    }
  )
);
