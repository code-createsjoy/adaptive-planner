import React, { useState } from 'react';
import { PatternObservation } from '@/types/insights';
import { ChevronDown, ChevronUp, Info, Sparkles, Sprout } from 'lucide-react';

interface ConfidencePatternBadgeProps {
  pattern: PatternObservation;
}

export const ConfidencePatternBadge: React.FC<ConfidencePatternBadgeProps> = ({ pattern }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const isEarly = pattern.maturity === 'EARLY';

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        isEarly
          ? 'bg-emerald-500/5 border-emerald-500/20 text-foreground'
          : 'bg-indigo-500/5 border-indigo-500/20 text-foreground'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
          {isEarly ? (
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {pattern.tag}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {pattern.tag}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Bằng chứng</span>
          {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-sm font-medium leading-relaxed mb-1">
        {pattern.observation}
      </p>

      {isEarly && (
        <p className="text-[11px] text-muted-foreground italic">
          💡 Modo đang quan sát các ca làm việc đầu tuần để nhận diện nhịp điệu của bạn mà không vội vàng kết luận.
        </p>
      )}

      {showEvidence && (
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2 bg-background/50 p-2.5 rounded-lg">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{pattern.evidenceDetail}</span>
        </div>
      )}
    </div>
  );
};
