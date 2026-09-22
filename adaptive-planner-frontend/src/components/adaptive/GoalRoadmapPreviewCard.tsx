import React, { useState } from 'react';
import {
  GoalScenarioOption,
  GoalMilestone,
  GoalDecompositionResponse,
} from '@/types/planner';
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  X,
  Layers,
  ChevronRight,
  Zap,
  Coffee,
  ArrowRight,
} from 'lucide-react';

interface GoalRoadmapPreviewCardProps {
  decomposition: GoalDecompositionResponse;
  selectedScenario: GoalScenarioOption;
  isApplying?: boolean;
  onApply: (scenario: GoalScenarioOption) => void;
  onClose?: () => void;
}

export const GoalRoadmapPreviewCard: React.FC<GoalRoadmapPreviewCardProps> = ({
  decomposition,
  selectedScenario,
  isApplying = false,
  onApply,
  onClose,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  const getBadgeClasses = (badge: GoalScenarioOption['badge']) => {
    switch (badge) {
      case 'RECOMMENDED':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'FASTER':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25';
      case 'LOW_PRESSURE':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getBlockTypeChip = (type: string) => {
    switch (type) {
      case 'EXISTING_WORK_FIT':
        return {
          label: '✓ Tận dụng Routine có sẵn',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'DEDICATED_DEEP_WORK':
        return {
          label: '⚡ Deep Work Session',
          className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        };
      case 'BUFFER':
        return {
          label: '🛡️ Protected Buffer',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold',
        };
      default:
        return {
          label: 'Linh hoạt',
          className: 'bg-muted text-muted-foreground border-border',
        };
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
            <h3 className="font-display text-base font-extrabold text-foreground truncate max-w-[280px] sm:max-w-[360px]">
              {decomposition.goalTitle}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground font-medium flex items-center gap-2">
            <span>Hạn chót: <strong>{decomposition.officialDeadline}</strong></span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Đích hoàn thành: {selectedScenario.internalTargetDate}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getBadgeClasses(
              selectedScenario.badge
            )}`}
          >
            {selectedScenario.badge === 'RECOMMENDED'
              ? '✨ Khuyên dùng'
              : selectedScenario.badge === 'FASTER'
              ? '⚡ Xong sớm'
              : '🌱 Thong thả'}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              title="Đóng"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scenario Strategy Rationale */}
      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 text-xs text-foreground/90 space-y-1.5 shrink-0">
        <p className="font-semibold text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
          <span>💡 Chiến lược phân bổ:</span>
        </p>
        <p className="leading-relaxed">{selectedScenario.description}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded-md bg-background border border-border text-foreground font-bold">
            ⏱️ Tổng thời lượng: {Math.round(selectedScenario.totalPlannedMinutes / 60)} giờ
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
            🛡️ {selectedScenario.bufferDays} ngày đệm dự phòng
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
            {selectedScenario.daysCount} ngày làm việc
          </span>
        </div>
      </div>

      {/* Multi-Day Roadmap List */}
      <div className="space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center justify-between">
          <span>Lộ trình chi tiết theo từng ngày ({selectedScenario.roadmapDays.length} ngày)</span>
          <span className="text-[10px] text-muted-foreground/70 lowercase font-normal">
            Bấm ngày để xem chi tiết
          </span>
        </p>

        <div className="space-y-2.5 overflow-y-auto pr-1.5 flex-1 custom-scrollbar">
          {selectedScenario.roadmapDays.map((day, dIdx) => (
            <div
              key={dIdx}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                day.isBufferDay
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-border/80 bg-background/70 hover:bg-card shadow-2xs'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground">
                    {day.dayOfWeek}, {day.formattedDate}
                  </span>
                  {day.isBufferDay && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      🛡️ Protected Buffer
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {day.blocks.length} phiên làm việc
                </span>
              </div>

              {/* Day Blocks */}
              <div className="space-y-2">
                {day.blocks.map((b, bIdx) => {
                  const chip = getBlockTypeChip(b.blockType);
                  return (
                    <div
                      key={bIdx}
                      className="p-2.5 rounded-xl bg-card border border-border/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">
                            {b.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {b.startTime} – {b.endTime} ({b.durationMinutes}p)
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold border shrink-0 ${chip.className}`}
                        >
                          {chip.label}
                        </span>
                      </div>

                      {b.subtaskTitles && b.subtaskTitles.length > 0 && (
                        <div className="pt-1 border-t border-border/40 space-y-1">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                            Nhiệm vụ trọng tâm:
                          </p>
                          <ul className="space-y-0.5 pl-1">
                            {b.subtaskTitles.map((st, sIdx) => (
                              <li
                                key={sIdx}
                                className="text-[11px] text-foreground/80 flex items-center gap-1.5"
                              >
                                <span className="size-1 rounded-full bg-primary shrink-0" />
                                <span className="truncate">{st}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {b.note && (
                        <p className="text-[10px] text-muted-foreground/80 italic">
                          • {b.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2 pt-2 border-t border-border/80 shrink-0">
        <button
          type="button"
          disabled={isApplying}
          onClick={() => onApply(selectedScenario)}
          className="w-full py-3 px-4 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          <Check className="size-4 text-emerald-400" />
          <span>
            {isApplying
              ? 'Đang tạo kế hoạch...'
              : 'Áp dụng lộ trình này (Apply Roadmap)'}
          </span>
        </button>
      </div>
    </div>
  );
};
