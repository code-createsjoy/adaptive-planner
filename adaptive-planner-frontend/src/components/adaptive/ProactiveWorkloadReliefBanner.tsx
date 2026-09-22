import React from 'react';
import { ProactiveAdaptationResponse } from '@/types/planner';
import { Sparkles, HeartHandshake, ArrowRight, X, Moon, Coffee, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProactiveWorkloadReliefBannerProps {
  adaptation: ProactiveAdaptationResponse;
  onApplyRelief: (heavyBlockIds: number[]) => void;
  onDismiss: () => void;
  isApplying?: boolean;
}

export const ProactiveWorkloadReliefBanner: React.FC<ProactiveWorkloadReliefBannerProps> = ({
  adaptation,
  onApplyRelief,
  onDismiss,
  isApplying = false,
}) => {
  if (!adaptation || !adaptation.hasRecommendation) return null;

  const heavyBlockCount = adaptation.heavyBlockIds?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      className="mb-4 p-4 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-primary/10 shadow-lg relative overflow-hidden backdrop-blur-md"
    >
      {/* Decorative accent background */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0 mt-0.5 shadow-inner">
            <HeartHandshake className="w-5 h-5" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gợi ý chăm sóc thể trạng
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                AI Adaptive Companion
              </span>
            </div>

            <p className="text-sm font-semibold text-foreground leading-snug">
              {adaptation.reason}
            </p>

            {adaptation.proposedChangesSummary && adaptation.proposedChangesSummary.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                {adaptation.proposedChangesSummary.map((summary, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/60" />
                    <span>{summary}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
          aria-label="Đóng gợi ý"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Footer */}
      <div className="mt-3.5 pt-3 border-t border-rose-500/20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Coffee className="w-3.5 h-3.5 text-amber-500" />
          <span>Bảo toàn năng lượng để hồi phục thể trạng</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            Giữ nguyên lịch
          </button>

          <button
            type="button"
            onClick={() => onApplyRelief(adaptation.heavyBlockIds || [])}
            disabled={isApplying || heavyBlockCount === 0}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isApplying ? (
              'Đang điều chỉnh...'
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Áp dụng giảm tải ({heavyBlockCount} task)
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
