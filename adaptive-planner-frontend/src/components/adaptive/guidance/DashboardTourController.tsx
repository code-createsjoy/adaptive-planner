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
    title: 'Bắt đầu tại đây',
    description: 'Đây là công việc cần sự chú ý của bạn ngay lúc này.',
    detailedExplanation: 'Modo luôn giữ tiêu điểm vào một công việc duy nhất để hạn chế tình trạng quá tải nhận thức (executive dysfunction).',
    primaryActionLabel: 'Đã hiểu',
    placement: 'bottom',
  },
  {
    id: 'next',
    targetSelector: '[data-tour="next-preview"]',
    fallbackSelector: '[data-tour="now-hero"]',
    icon: '⏭️',
    title: 'Việc tiếp theo',
    description: 'Modo giữ bước tiếp theo luôn trong tầm mắt để bạn an tâm.',
    detailedExplanation: 'Khoảng thời gian đệm (buffer) giữa các việc được tính toán để bạn có thời gian chuyển tiếp thoải mái.',
    primaryActionLabel: 'Tiếp tục',
    secondaryActionLabel: 'Quay lại',
    placement: 'top',
  },
  {
    id: 'create-task',
    targetSelector: '[data-tour="quick-add-task"]',
    fallbackSelector: 'header',
    icon: '➕',
    title: 'Thêm việc cần làm',
    description: 'Thêm một việc bạn cần làm hôm nay một cách nhanh chóng.',
    detailedExplanation: 'Bạn có thể bấm tạo tác vụ trực tiếp hoặc nhắn câu ngắn tự nhiên vào AI chat.',
    primaryActionLabel: 'Thử ngay',
    secondaryActionLabel: 'Quay lại',
    placement: 'bottom',
  },
  {
    id: 'focus',
    targetSelector: '[data-tour="start-focus-btn"]',
    fallbackSelector: '[data-tour="now-hero"]',
    icon: '⚡',
    title: 'Sẵn sàng tập trung?',
    description: 'Tập trung vào từng việc một cùng bộ đếm giờ và nhạc nền êm dịu.',
    detailedExplanation: 'Chế độ Focus ẩn đi toàn bộ chi tiết thừa để bạn bắt tay vào việc với lực ma sát nhỏ nhất.',
    primaryActionLabel: 'Tiếp theo',
    secondaryActionLabel: 'Quay lại',
    placement: 'top',
  },
  {
    id: 'ask-modo',
    targetSelector: '[data-tour="ask-modo-input"]',
    fallbackSelector: 'main',
    icon: '💬',
    title: 'Cần hỗ trợ?',
    description: 'Nhắn cho Modo để lên lịch, chia nhỏ việc khó hoặc dời giờ khi mệt.',
    detailedExplanation: 'Chỉ cần gõ câu tự nhiên ngắn gọn (ví dụ: mai 7h cafe 2h, 8h họp), Modo sẽ tự phân tích và bảo vệ các giờ nghỉ của bạn.',
    primaryActionLabel: 'Tiếp tục',
    secondaryActionLabel: 'Quay lại',
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
            title="Bạn đã sẵn sàng!"
            description="Modo sẽ chỉ giới thiệu các công cụ khác khi bạn thực sự cần đến chúng."
            currentStep={DASHBOARD_TOUR_STEPS.length}
            totalSteps={DASHBOARD_TOUR_STEPS.length}
            primaryActionLabel="Bắt đầu sử dụng"
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
