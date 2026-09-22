import React from 'react';
import { DaypartRhythm } from '@/types/insights';
import { Sun, Sunset, Moon, Sparkles } from 'lucide-react';

interface DaytimeRhythmBarProps {
  rhythm: DaypartRhythm;
}

export const DaytimeRhythmBar: React.FC<DaytimeRhythmBarProps> = ({ rhythm }) => {
  const { morningFocusMinutes, afternoonFocusMinutes, eveningFocusMinutes, dominantPeriod } = rhythm;
  const totalMinutes = morningFocusMinutes + afternoonFocusMinutes + eveningFocusMinutes;

  const morningPercent = totalMinutes > 0 ? (morningFocusMinutes / totalMinutes) * 100 : 33.33;
  const afternoonPercent = totalMinutes > 0 ? (afternoonFocusMinutes / totalMinutes) * 100 : 33.33;
  const eveningPercent = totalMinutes > 0 ? (eveningFocusMinutes / totalMinutes) * 100 : 33.34;

  const formatHours = (mins: number) => {
    if (mins <= 0) return '0p';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}p`;
    if (h > 0) return `${h}h`;
    return `${m}p`;
  };

  const periodDescriptions: Record<string, { label: string; icon: any }> = {
    MORNING: { label: 'Buổi Sáng (06:00 - 12:00)', icon: Sun },
    AFTERNOON: { label: 'Buổi Chiều (12:00 - 18:00)', icon: Sunset },
    EVENING: { label: 'Buổi Tối (18:00 - 24:00)', icon: Moon },
    BALANCED: { label: 'Phân bổ đồng đều trong ngày', icon: Sparkles },
  };

  const activePeriodInfo = periodDescriptions[dominantPeriod] || periodDescriptions.BALANCED;
  const PeriodIcon = activePeriodInfo.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <PeriodIcon className="w-3.5 h-3.5 text-amber-500" />
          Nhịp điệu trong ngày
        </span>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
          Năng lượng cao nhất: {activePeriodInfo.label}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex p-0.5 gap-1">
        {totalMinutes === 0 ? (
          <div className="w-full h-full bg-muted/40 rounded-full flex items-center justify-center text-[10px] text-muted-foreground/60">
            Chưa có phiên tập trung nào được ghi nhận
          </div>
        ) : (
          <>
            {morningFocusMinutes > 0 && (
              <div
                style={{ width: `${morningPercent}%` }}
                title={`Sáng: ${formatHours(morningFocusMinutes)}`}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-sm transition-all duration-500 hover:brightness-110"
              />
            )}
            {afternoonFocusMinutes > 0 && (
              <div
                style={{ width: `${afternoonPercent}%` }}
                title={`Chiều: ${formatHours(afternoonFocusMinutes)}`}
                className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-sm transition-all duration-500 hover:brightness-110"
              />
            )}
            {eveningFocusMinutes > 0 && (
              <div
                style={{ width: `${eveningPercent}%` }}
                title={`Tối: ${formatHours(eveningFocusMinutes)}`}
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-sm transition-all duration-500 hover:brightness-110"
              />
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-[11px] text-muted-foreground">Sáng (06-12h)</div>
            <div className="font-semibold text-foreground">{formatHours(morningFocusMinutes)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-500/5 border border-sky-500/10">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-[11px] text-muted-foreground">Chiều (12-18h)</div>
            <div className="font-semibold text-foreground">{formatHours(afternoonFocusMinutes)}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-[11px] text-muted-foreground">Tối (18-24h)</div>
            <div className="font-semibold text-foreground">{formatHours(eveningFocusMinutes)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
