import React, { useState } from 'react';
import {
  GoalRebalanceResponse,
  GoalRebalanceOption,
  ProjectGoal,
} from '@/types/planner';
import {
  Sparkles,
  Check,
  X,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface SmartRebalanceCompanionModalProps {
  goal: ProjectGoal;
  rebalanceData: GoalRebalanceResponse;
  isOpen: boolean;
  onClose: () => void;
  onApplyRebalance: (option: GoalRebalanceOption) => void;
}

export const SmartRebalanceCompanionModal: React.FC<
  SmartRebalanceCompanionModalProps
> = ({ goal, rebalanceData, isOpen, onClose, onApplyRebalance }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    rebalanceData.options[0]?.id || 'smart_rebalance'
  );

  if (!isOpen) return null;

  const activeOption =
    rebalanceData.options.find((o) => o.id === selectedOptionId) ||
    rebalanceData.options[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border-2 border-primary/40 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 flex items-start justify-between bg-muted/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <h3 className="font-display text-base font-extrabold text-foreground">
                Adaptive Smart Rebalance Companion
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Dự án: <strong className="text-foreground">{goal.title}</strong> · Hạn chót: {goal.officialDeadline}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Empathetic AI Message Box */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1.5 leading-relaxed">
            <p className="font-bold text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
              <span>🤖 Trợ lý Adaptive:</span>
            </p>
            <p className="text-sm font-medium">{rebalanceData.companionMessage}</p>
          </div>

          {/* Option Selector Cards */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Chọn phương án phục hồi ({rebalanceData.options.length} phương án)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {rebalanceData.options.map((opt) => {
                const isSelected = opt.id === selectedOptionId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-2 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                        : 'border-border/80 bg-background/80 hover:bg-card'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-foreground truncate">
                          {opt.title.split('(')[0]}
                        </span>
                        {opt.badge === 'RECOMMENDED' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            ✨ Tối ưu
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {opt.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-primary font-semibold">
                      {opt.impactSummary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Modified Days */}
          {activeOption && activeOption.modifiedDays && activeOption.modifiedDays.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Xem trước các ngày bị điều chỉnh (Schedule Diff)
              </p>

              <div className="space-y-2">
                {activeOption.modifiedDays.map((d, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-3.5 rounded-2xl bg-muted/20 border border-border/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-foreground">
                        {d.dayOfWeek}, {d.formattedDate}
                      </span>
                      {d.isBufferDay ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          🛡️ Dùng ngày đệm
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          ✓ Bảo vệ giờ nghỉ
                        </span>
                      )}
                    </div>

                    {d.blocks.map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-2.5 rounded-xl bg-card border border-border/60 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-foreground">{b.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {b.startTime} – {b.endTime} ({b.durationMinutes}p)
                          </p>
                        </div>
                        <span className="text-[10px] text-primary italic font-medium">
                          {b.note}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeOption) {
                onApplyRebalance(activeOption);
                onClose();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Check className="size-4 text-emerald-400" />
            <span>Áp dụng tái cân bằng (Apply Rebalance)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
