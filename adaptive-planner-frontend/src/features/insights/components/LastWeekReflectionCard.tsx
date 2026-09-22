import React, { useState } from 'react';
import { LastWeekReflection } from '@/types/insights';
import { CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp, ArrowRight, Lightbulb, Compass } from 'lucide-react';

interface LastWeekReflectionCardProps {
  lastWeek: LastWeekReflection;
  onApplySuggestion?: (suggestionId: string) => void;
}

export const LastWeekReflectionCard: React.FC<LastWeekReflectionCardProps> = ({
  lastWeek,
  onApplySuggestion,
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const {
    weekStart,
    weekEnd,
    completedTasks,
    scheduledTasks,
    completionRate,
    totalFocusMinutes,
    dominantPattern,
    whyReason,
    suggestion,
  } = lastWeek;

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}p`;
    if (h > 0) return `${h}h`;
    return `${m}p`;
  };

  const formatDateRange = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
              Tuần trước (Reflection & Learning)
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              {formatDateRange(weekStart, weekEnd)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-1">
            Nhìn lại & Đúc kết
          </h2>
        </div>

        <div className="text-xs text-muted-foreground italic">
          Không áp lực hiệu suất · Nhận diện mẫu hình lặp lại
        </div>
      </div>

      {/* Retrospective Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Nỗ lực đã hoàn thành tuần trước</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{completedTasks}</span>
            <span className="text-xs text-muted-foreground">/ {scheduledTasks} việc ({completionRate}%)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Tổng thời gian tập trung</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatHoursMinutes(totalFocusMinutes)}</span>
            <span className="text-xs text-muted-foreground">trong cả tuần</span>
          </div>
        </div>
      </div>

      {/* Pattern Observed */}
      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Mẫu hình nhận thấy
          </span>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
          >
            <span>Tại sao Modo nhận thấy điều này?</span>
            {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-sm font-medium text-foreground leading-relaxed">
          {dominantPattern}
        </p>

        {showWhy && (
          <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground bg-background/60 p-2.5 rounded-lg mt-2">
            💡 {whyReason}
          </div>
        )}
      </div>

      {/* 1-Click Actionable Suggestion */}
      {suggestion && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-xs">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Gợi ý thích ứng cho tuần tới</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground">{suggestion.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {suggestion.description}
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => onApplySuggestion?.(suggestion.id)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
              <span>{suggestion.actionLabel || 'Áp dụng mẫu hình này → Xem trước'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
