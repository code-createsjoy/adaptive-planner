import React, { useState } from 'react';
import { CognitiveLoadAssessment } from '@/types/planner';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Feather,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TodayWorkloadCardProps {
  assessment?: CognitiveLoadAssessment | null;
  isLoading?: boolean;
  onReviewSchedule: () => void;
}

export const TodayWorkloadCard: React.FC<TodayWorkloadCardProps> = ({
  assessment,
  isLoading = false,
  onReviewSchedule,
}) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded-md" />
        <div className="h-10 bg-muted/60 rounded-xl" />
        <div className="h-8 bg-muted/40 rounded-xl" />
      </div>
    );
  }

  if (!assessment) return null;

  const { score, level, summary, bulletPoints, metrics } = assessment;

  const levelConfig = {
    LIGHT: {
      label: 'Light & Calm',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: <Feather className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      borderClass: 'border-emerald-500/20',
      bgGradient: 'from-emerald-500/5 via-background to-card',
    },
    MODERATE: {
      label: 'Balanced',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      icon: <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      borderClass: 'border-amber-500/20',
      bgGradient: 'from-amber-500/5 via-background to-card',
    },
    HEAVY: {
      label: 'Demanding & High Load',
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
      borderClass: 'border-rose-500/30 shadow-xs',
      bgGradient: 'from-rose-500/10 via-background to-card',
    },
  }[level] || {
    label: 'Balanced',
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
    icon: <Brain className="w-3.5 h-3.5 text-primary" />,
    borderClass: 'border-border',
    bgGradient: 'from-primary/5 via-background to-card',
  };

  return (
    <div
      className={`p-4 sm:p-4.5 rounded-3xl bg-gradient-to-br ${levelConfig.bgGradient} border ${levelConfig.borderClass} shadow-xs space-y-3.5 transition-all`}
    >
      {/* Top Header: Title & Level Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-card border border-border/80 flex items-center justify-center shadow-2xs">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Today's Workload
          </h3>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${levelConfig.badgeClass}`}
        >
          {levelConfig.icon}
          {levelConfig.label}
        </span>
      </div>

      {/* Empathetic qualitative summary */}
      <p className="text-xs text-foreground/90 font-medium leading-relaxed">
        {summary}
      </p>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
        <div className="p-2 rounded-xl bg-card/80 border border-border/60 text-center">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            🧠 Deep Focus
          </span>
          <p className="text-xs font-bold text-foreground mt-0.5">
            {metrics.highFocusHours > 0 ? `${metrics.highFocusHours}h` : '0h'}
          </p>
        </div>

        <div className="p-2 rounded-xl bg-card/80 border border-border/60 text-center">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            📅 Meetings
          </span>
          <p className="text-xs font-bold text-foreground mt-0.5">
            {metrics.meetingCount}
          </p>
        </div>

        <div className="p-2 rounded-xl bg-card/80 border border-border/60 text-center">
          <span className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            ⏱ Buffers
          </span>
          <p className="text-xs font-bold text-foreground mt-0.5">
            {metrics.totalBufferMinutes}m
          </p>
        </div>
      </div>

      {/* Collapsible "Why?" Root-Cause Breakdown */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground font-semibold py-1 transition-colors cursor-pointer"
          >
            <span>Load Factor Breakdown ({bulletPoints.length})</span>
            {isWhyExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <AnimatePresence>
            {isWhyExpanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 space-y-1.5 text-xs text-muted-foreground pl-1 border-l-2 border-primary/20 overflow-hidden"
              >
                {bulletPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 pl-1.5">
                    <span className="text-primary font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Row: Discreet Score + Review Button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground font-mono">
          Est. Load: <strong className="text-foreground">{score}/100</strong>
        </span>

        <button
          type="button"
          onClick={onReviewSchedule}
          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
        >
          Optimize Schedule <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
