import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { useGuidanceStore } from '@/store/useGuidanceStore';

export interface FirstUseTipProps {
  tipId: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const FirstUseTip: React.FC<FirstUseTipProps> = ({
  tipId,
  icon,
  title,
  description,
  actionLabel = 'Đã hiểu',
  onAction,
  className = '',
}) => {
  const { seenTips, markTipSeen } = useGuidanceStore();

  const isSeen = !!seenTips[tipId];

  if (isSeen) {
    return null;
  }

  const handleDismiss = () => {
    markTipSeen(tipId);
    if (onAction) {
      onAction();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`rounded-2xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/25 p-3.5 sm:p-4 text-zinc-800 dark:text-zinc-200 shadow-xs flex items-start justify-between gap-3 ${className}`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-8 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            {icon || <Lightbulb className="size-4" />}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
              {title}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Đóng (không hiện lại)"
            aria-label="Đóng mẹo"
          >
            <X className="size-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
