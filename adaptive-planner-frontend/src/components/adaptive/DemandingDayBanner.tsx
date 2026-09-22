import React from 'react';
import { CognitiveLoadAssessment } from '@/types/planner';
import { Sparkles, Flame, ArrowRight, ShieldAlert, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemandingDayBannerProps {
  assessment?: CognitiveLoadAssessment | null;
  onReviewSchedule: () => void;
  onDismiss?: () => void;
}

export const DemandingDayBanner: React.FC<DemandingDayBannerProps> = ({
  assessment,
  onReviewSchedule,
  onDismiss,
}) => {
  if (!assessment || assessment.level !== 'HEAVY') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-primary/15 border border-rose-500/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
            Lịch trình hôm nay có mật độ khá dày đặc
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              Tải trọng: {assessment.score}/100
            </span>
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={onReviewSchedule}
          className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Xem đề xuất giảm tải
        </button>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
