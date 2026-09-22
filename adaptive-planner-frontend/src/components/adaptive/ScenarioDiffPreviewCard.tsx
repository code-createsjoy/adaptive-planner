import React, { useState } from 'react';
import { TimeBlock, ScenarioOption } from '@/types/planner';
import {
  calculateScheduleDiff,
  ScheduleDiffItem,
} from '@/lib/calculateScheduleDiff';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  AlertCircle,
  Calendar,
  Layers,
  ExternalLink,
  X,
  MapPin,
  Tag,
  Zap,
  Coffee,
  ShieldCheck,
} from 'lucide-react';

interface ScenarioDiffPreviewCardProps {
  scenario: ScenarioOption;
  scenarioIndex?: number;
  currentBlocks: TimeBlock[];
  pendingActivity?: Omit<TimeBlock, 'id'> | null;
  targetDate?: string;
  isApplying?: boolean;
  onApply: (scenario: ScenarioOption) => void;
  onClose?: () => void;
}

export const ScenarioDiffPreviewCard: React.FC<ScenarioDiffPreviewCardProps> = ({
  scenario,
  scenarioIndex = 0,
  currentBlocks,
  pendingActivity,
  targetDate,
  isApplying = false,
  onApply,
  onClose,
}) => {
  const [isFullTimelineOpen, setIsFullTimelineOpen] = useState(false);

  const diffResult = calculateScheduleDiff(
    currentBlocks,
    scenario.blocks,
    pendingActivity
  );

  const getBadgeClasses = (color: ScheduleDiffItem['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'amber':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25';
      case 'sky':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25';
      case 'violet':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25';
      case 'rose':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="rounded-3xl border-2 border-primary/40 bg-card/95 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4 max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3.5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/15 text-primary">
              <Sparkles className="size-4" />
            </span>
            <h3 className="font-display text-base font-extrabold text-foreground">
              Xem trước thay đổi lịch (Impact Preview)
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground font-medium">
            {scenario.title || 'Phương án tối ưu hóa lịch trình'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {scenarioIndex === 0 ? '✨ Đề xuất tối ưu' : `Lựa chọn #${scenarioIndex + 1}`}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Đóng xem trước (Close)"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rationale / Explanation Box */}
      {scenario.description && (
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs text-foreground/90 space-y-1.5 shrink-0">
          <p className="font-semibold text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
            <span>💡 Kế hoạch điều chỉnh:</span>
          </p>
          <p className="leading-relaxed">{scenario.description}</p>
        </div>
      )}

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono shrink-0">
        {diffResult.newAddedCount > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
            +{diffResult.newAddedCount} mới thêm
          </span>
        )}
        {diffResult.totalShiftedCount > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
            {diffResult.totalShiftedCount} dời giờ
          </span>
        )}
        {diffResult.totalCompressedCount > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold">
            {diffResult.totalCompressedCount} rút ngắn
          </span>
        )}
        {diffResult.totalDeferredCount > 0 && (
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold">
            {diffResult.totalDeferredCount} hoãn sang mai
          </span>
        )}
      </div>

      {/* Diff Items List */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
          Chi tiết các lịch trình bị ảnh hưởng ({diffResult.items.length})
        </p>

        {diffResult.items.length === 0 ? (
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 text-center text-xs text-muted-foreground">
            Không có lịch trình nào bị xung đột hay thay đổi.
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto pr-1.5 flex-1 custom-scrollbar">
            {diffResult.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-border/80 bg-background/70 hover:bg-card transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {item.title}
                    </p>
                    {item.detail && (
                      <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="size-2.5 opacity-60 shrink-0" />
                        <span>{item.detail}</span>
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${getBadgeClasses(
                      item.badgeColor
                    )}`}
                  >
                    {item.badgeLabel}
                  </span>
                </div>

                {/* Before & After Time Range Comparison */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {item.changeType === 'NEW' ? (
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {item.newStartTime} – {item.newEndTime}
                    </span>
                  ) : item.changeType === 'DEFERRED' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground line-through">
                        {item.oldStartTime} – {item.oldEndTime}
                      </span>
                      <ArrowRight className="size-3 text-rose-500" />
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold">
                        Tomorrow Inbox
                      </span>
                    </div>
                  ) : item.oldStartTime && item.newStartTime ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {item.oldStartTime} – {item.oldEndTime}
                      </span>
                      <ArrowRight className="size-3 text-primary" />
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary font-bold">
                        {item.newStartTime} – {item.newEndTime}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{item.newStartTime} – {item.newEndTime}</span>
                  )}
                </div>

                {/* Micro reason explanation */}
                {item.explanationReason && (
                  <p className="text-[10px] text-muted-foreground/90 italic">
                    • {item.explanationReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="space-y-2 pt-2 border-t border-border/80">
        <button
          type="button"
          disabled={isApplying}
          onClick={() => onApply(scenario)}
          className="w-full py-3 px-4 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
        >
          <Check className="size-4 text-emerald-400" />
          <span>{isApplying ? 'Đang áp dụng...' : 'Áp dụng phương án này (Apply changes)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFullTimelineOpen(true)}
          className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="size-3.5" />
          <span>Xem toàn bộ timeline cả ngày (View full timeline)</span>
        </button>
      </div>

      {/* Full Timeline Modal */}
      {isFullTimelineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Toàn bộ timeline sau khi áp dụng kịch bản
                </h4>
                <p className="text-xs text-muted-foreground">
                  {scenario.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullTimelineOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              {[...scenario.blocks]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold bg-muted px-2 py-1 rounded-md text-[11px]">
                        {b.startTime} – {b.endTime}
                      </span>
                      <span className="font-semibold">{b.title}</span>
                    </div>
                    {b.priority === 'PROTECTED' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold">
                        PROTECTED
                      </span>
                    )}
                  </div>
                ))}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFullTimelineOpen(false)}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
