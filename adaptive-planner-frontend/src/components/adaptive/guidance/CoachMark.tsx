import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useGuidanceStore } from '@/store/useGuidanceStore';

export interface CoachMarkProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  detailedExplanation?: string;
  currentStep: number;
  totalSteps: number;
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onSkip: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  targetRect?: DOMRect | null;
}

export const CoachMark: React.FC<CoachMarkProps> = ({
  icon,
  title,
  description,
  detailedExplanation,
  currentStep,
  totalSteps,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  onSkip,
  placement = 'bottom',
  targetRect,
}) => {
  const { guidanceStyle } = useGuidanceStore();
  const [showDetailed, setShowDetailed] = React.useState(false);

  // Keyboard accessibility: Escape to skip/dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  // Calculate dynamic floating position relative to targetRect for desktop
  const getFloatingStyle = (): React.CSSProperties => {
    if (!targetRect || placement === 'center' || typeof window === 'undefined') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const margin = 16;
    const isMobile = window.innerWidth < 640;

    if (isMobile) {
      // Anchored bottom sheet on mobile screens
      return {
        bottom: '16px',
        left: '12px',
        right: '12px',
        maxWidth: 'calc(100vw - 24px)',
      };
    }

    // Desktop positioning
    const { top, bottom, left, right, width, height } = targetRect;

    switch (placement) {
      case 'bottom':
        return {
          top: `${Math.min(window.innerHeight - 240, bottom + margin)}px`,
          left: `${Math.max(16, Math.min(window.innerWidth - 380, left + width / 2 - 180))}px`,
        };
      case 'top':
        return {
          top: `${Math.max(16, top - margin - 180)}px`,
          left: `${Math.max(16, Math.min(window.innerWidth - 380, left + width / 2 - 180))}px`,
        };
      case 'right':
        return {
          top: `${Math.max(16, Math.min(window.innerHeight - 240, top + height / 2 - 90))}px`,
          left: `${Math.min(window.innerWidth - 380, right + margin)}px`,
        };
      case 'left':
        return {
          top: `${Math.max(16, Math.min(window.innerHeight - 240, top + height / 2 - 90))}px`,
          left: `${Math.max(16, left - margin - 360)}px`,
        };
      default:
        return {
          top: `${bottom + margin}px`,
          left: `${Math.max(16, left)}px`,
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={getFloatingStyle()}
        className="fixed z-[10001] w-full max-w-[360px] rounded-2xl bg-white/95 dark:bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-md border border-teal-500/30 dark:border-teal-400/20 text-zinc-900 dark:text-zinc-100"
      >
        {/* Header: Icon + Title + Step dots + Close */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {icon && (
              <span className="flex-shrink-0 text-lg flex items-center justify-center size-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
                {icon}
              </span>
            )}
            <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Step dots (● ● ○ ○ ○) */}
            <div className="flex items-center gap-1" aria-label={`Bước ${currentStep + 1} trên ${totalSteps}`}>
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <span
                  key={idx}
                  className={`size-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'bg-teal-600 dark:bg-teal-400 w-3'
                      : idx < currentStep
                      ? 'bg-teal-400/60 dark:bg-teal-600/60'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onSkip}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Đóng / Bỏ qua hướng dẫn (Esc)"
              aria-label="Đóng hướng dẫn"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content: single sentence body (strictly short for low cognitive load) */}
        {guidanceStyle !== 'minimal' && (
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mb-3">
            {description}
          </p>
        )}

        {/* Optional 'Why?' expander for detailed guidance preference */}
        {guidanceStyle === 'detailed' && detailedExplanation && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowDetailed(!showDetailed)}
              className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="size-3" />
              {showDetailed ? 'Ẩn chi tiết' : 'Tại sao lại cần điều này?'}
            </button>
            {showDetailed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-1 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                {detailedExplanation}
              </motion.div>
            )}
          </div>
        )}

        {/* Footer: Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1">
            {secondaryActionLabel && onSecondaryAction && currentStep > 0 && (
              <button
                type="button"
                onClick={onSecondaryAction}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" />
                {secondaryActionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="px-2 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Bỏ qua
            </button>
          </div>

          <button
            type="button"
            autoFocus
            onClick={onPrimaryAction}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-sm hover:shadow-teal-500/20 transition-all flex items-center gap-1"
          >
            {primaryActionLabel}
            {currentStep < totalSteps - 1 && <ChevronRight className="size-3.5" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
