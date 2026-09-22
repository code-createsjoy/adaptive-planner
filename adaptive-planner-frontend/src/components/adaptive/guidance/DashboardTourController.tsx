import React, { useEffect, useState } from 'react';
import { useGuidanceStore } from '@/store/useGuidanceStore';
import { SpotlightOverlay } from './SpotlightOverlay';
import { CoachMark } from './CoachMark';

export interface TourStepConfig {
  id: string;
  targetSelector: string;
  fallbackSelector?: string;
  icon: string;
  title: string;
  description: string;
  detailedExplanation?: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionTrigger?: () => void;
}

const DASHBOARD_TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'now',
    targetSelector: '[data-tour="now-hero"]',
    fallbackSelector: 'main',
    icon: '🎯',
    title: 'Start Here',
    description: 'This is the task requiring your attention right now.',
    detailedExplanation: 'Modo maintains focus on a single task at a time to reduce cognitive overload and executive fatigue.',
    primaryActionLabel: 'Got it',
    placement: 'bottom',
  },
  {
    id: 'next',
    targetSelector: '[data-tour="next-preview"]',
    fallbackSelector: '[data-tour="now-hero"]',
    icon: '⏭️',
    title: 'Up Next',
    description: 'Modo keeps the next step in view so you always feel prepared.',
    detailedExplanation: 'Smart buffer intervals between tasks are automatically calculated for seamless transitions.',
    primaryActionLabel: 'Continue',
    secondaryActionLabel: 'Back',
    placement: 'top',
  },
  {
    id: 'create-task',
    targetSelector: '[data-tour="quick-add-task"]',
    fallbackSelector: 'header',
    icon: '➕',
    title: 'Add a Task',
    description: 'Quickly schedule an activity or task for today.',
    detailedExplanation: 'You can click to create a task directly or type natural phrases in the AI chat.',
    primaryActionLabel: 'Try it',
    secondaryActionLabel: 'Back',
    placement: 'bottom',
  },
  {
    id: 'focus',
    targetSelector: '[data-tour="start-focus-btn"]',
    fallbackSelector: '[data-tour="now-hero"]',
    icon: '⚡',
    title: 'Ready to Focus?',
    description: 'Enter flow state with gentle timers and calming ambient sound.',
    detailedExplanation: 'Focus Mode strips away unnecessary visual noise so you can start with zero friction.',
    primaryActionLabel: 'Next',
    secondaryActionLabel: 'Back',
    placement: 'top',
  },
  {
    id: 'ask-modo',
    targetSelector: '[data-tour="ask-modo-input"]',
    fallbackSelector: 'main',
    icon: '💬',
    title: 'Need Assistance?',
    description: 'Ask Modo to plan, break down challenging tasks, or rebalance when tired.',
    detailedExplanation: 'Type naturally (e.g., "coffee tomorrow 7am 2hrs, 9am meeting"), and Modo will automatically structure and protect your recovery blocks.',
    primaryActionLabel: 'Continue',
    secondaryActionLabel: 'Back',
    placement: 'top',
  },
];

interface DashboardTourControllerProps {
  onNavigateTab?: (tab: string) => void;
  onOpenAddTaskModal?: () => void;
  disabled?: boolean;
}

export const DashboardTourController: React.FC<DashboardTourControllerProps> = ({
  onNavigateTab,
  onOpenAddTaskModal,
  disabled = false,
}) => {
  const {
    isTourActive,
    currentTourStep,
    tourCompleted,
    tourDismissed,
    startTour,
    nextTourStep,
    prevTourStep,
    skipTour,
    completeTour,
  } = useGuidanceStore();

  const [isReadyStep, setIsReadyStep] = useState(false);

  // First-time auto start: subtle settling delay of 800ms
  useEffect(() => {
    if (disabled) return;
    if (!tourCompleted && !tourDismissed && !isTourActive) {
      const timer = setTimeout(() => {
        startTour(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [disabled, tourCompleted, tourDismissed, isTourActive, startTour]);

  if (disabled || !isTourActive) {
    return null;
  }

  // Final Tour Completion Step
  if (isReadyStep || currentTourStep >= DASHBOARD_TOUR_STEPS.length) {
    return (
      <SpotlightOverlay targetSelector="body">
        {() => (
          <CoachMark
            icon="✨"
            title="You're all set!"
            description="Modo will introduce additional tools only when you actually need them."
            currentStep={DASHBOARD_TOUR_STEPS.length}
            totalSteps={DASHBOARD_TOUR_STEPS.length}
            primaryActionLabel="Get Started"
            onPrimaryAction={() => {
              setIsReadyStep(false);
              completeTour();
            }}
            onSkip={() => {
              setIsReadyStep(false);
              completeTour();
            }}
            placement="center"
          />
        )}
      </SpotlightOverlay>
    );
  }

  const step = DASHBOARD_TOUR_STEPS[currentTourStep];

  // Resolve selector (if target element doesn't exist in current tab, check fallback)
  const resolvedSelector =
    typeof document !== 'undefined' && document.querySelector(step.targetSelector)
      ? step.targetSelector
      : step.fallbackSelector || 'body';

  const handlePrimaryAction = () => {
    // If Step 2 (Create task), optionally trigger the add modal so user sees it live
    if (step.id === 'create-task' && onOpenAddTaskModal) {
      onOpenAddTaskModal();
    }

    // If Step 4 (Ask Modo) and in different tab, switch to planner/chat tab
    if (step.id === 'focus' && onNavigateTab) {
      // User can see planner chat on next step
      onNavigateTab('planner');
    }

    if (currentTourStep === DASHBOARD_TOUR_STEPS.length - 1) {
      setIsReadyStep(true);
    } else {
      nextTourStep();
    }
  };

  return (
    <SpotlightOverlay
      targetSelector={resolvedSelector}
      onBackdropClick={() => {
        // Safe backdrop click: don't dismiss without confirmation, just keep focus
      }}
    >
      {(targetRect) => (
        <CoachMark
          icon={step.icon}
          title={step.title}
          description={step.description}
          detailedExplanation={step.detailedExplanation}
          currentStep={currentTourStep}
          totalSteps={DASHBOARD_TOUR_STEPS.length}
          primaryActionLabel={step.primaryActionLabel}
          onPrimaryAction={handlePrimaryAction}
          secondaryActionLabel={step.secondaryActionLabel}
          onSecondaryAction={prevTourStep}
          onSkip={skipTour}
          placement={step.placement}
          targetRect={targetRect}
        />
      )}
    </SpotlightOverlay>
  );
};
