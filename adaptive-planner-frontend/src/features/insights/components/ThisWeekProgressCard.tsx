import React from 'react';
import { CurrentWeekProgress } from '@/types/insights';
import { DaytimeRhythmBar } from './DaytimeRhythmBar';
import { ConfidencePatternBadge } from './ConfidencePatternBadge';
import { CheckCircle2, Clock, Flame, Calendar } from 'lucide-react';

interface ThisWeekProgressCardProps {
  currentWeek: CurrentWeekProgress;
}

export const ThisWeekProgressCard: React.FC<ThisWeekProgressCardProps> = ({ currentWeek }) => {
  const {
    weekStart,
    weekEnd,
    dayIndex,
    totalDaysInWeek,
    completedTasks,
    scheduledTasks,
    completionRate,
    totalFocusMinutes,
    focusSessionsCount,
    daypartRhythm,
    pattern,
  } = currentWeek;

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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Tuần này (Live Flow)
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateRange(weekStart, weekEnd)}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground mt-1">
            Nhịp điệu đang diễn ra
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl text-xs font-medium">
          <span className="text-muted-foreground">Tiến trình tuần:</span>
          <span className="font-bold text-foreground">Ngày {dayIndex} / {totalDaysInWeek}</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Nỗ lực hoàn tất</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{completedTasks}</span>
            <span className="text-xs text-muted-foreground">/ {scheduledTasks} việc ({completionRate}%)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span>Thời lượng Deep Focus</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{formatHoursMinutes(totalFocusMinutes)}</span>
            <span className="text-xs text-muted-foreground">tổng cộng</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Phiên tập trung</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{focusSessionsCount}</span>
            <span className="text-xs text-muted-foreground">phiên đã thực hiện</span>
          </div>
        </div>
      </div>

      {/* Daytime Rhythm Bar */}
      <DaytimeRhythmBar rhythm={daypartRhythm} />

      {/* Confidence Pattern Badge */}
      {pattern && <ConfidencePatternBadge pattern={pattern} />}
    </div>
  );
};
