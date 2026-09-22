import React, { useState } from 'react';
import { TimeBlock } from '@/types/planner';
import { TimelineTemporalState } from '@/lib/temporal';
import {
  Sparkles,
  Clock3,
  Play,
  CheckCircle2,
  ListTodo,
  ChevronRight,
  Coffee,
  AlertCircle,
  Zap,
  Layers,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NowHeroCardProps {
  timelineState: TimelineTemporalState;
  onToggleMicroStep?: (blockId: string, stepId: string, completed: boolean) => void;
  onBreakdownTask?: (block: TimeBlock) => void;
  onStartFocusTimer?: (block: TimeBlock) => void;
  onOpenQuickPrompt?: () => void;
}

export const NowHeroCard: React.FC<NowHeroCardProps> = ({
  timelineState,
  onToggleMicroStep,
  onBreakdownTask,
  onStartFocusTimer,
  onOpenQuickPrompt,
}) => {
  const [allStepsModalOpen, setAllStepsModalOpen] = useState(false);

  const {
    activeBlock,
    nextBlock,
    progressPercent,
    remainingMinutes,
    isTransitionWarning,
    isFreeTime,
  } = timelineState;

  // Render Free Time / Compassionate Empty State if no active task
  if (isFreeTime || !activeBlock) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-500/10 via-background to-emerald-500/5 border border-teal-500/20 shadow-xs relative overflow-hidden animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="size-11 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Open Buffer Time
                </span>
                <span className="text-xs text-muted-foreground">Right now</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Nothing needs your urgent attention right now.
              </h2>
              {nextBlock ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>Next up:</span>
                  <strong className="text-foreground">{nextBlock.title}</strong>
                  <span>at {nextBlock.startTime}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your afternoon schedule is clear. Take a gentle break or plan something when ready.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {onOpenQuickPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenQuickPrompt}
                className="rounded-xl text-xs font-semibold h-9 px-3.5 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" />
                Plan something
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Task Calculations
  const steps = activeBlock.microSteps || [];
  const completedStepsCount = steps.filter((s) => s.done).length;
  const totalStepsCount = steps.length;
  // Chunked display: only show first 1-2 uncompleted steps
  const visibleSteps = steps.slice(0, 2);

  return (
    <>
      <div data-tour="now-hero" className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-card via-card to-teal-500/5 border border-border shadow-md space-y-4 relative overflow-hidden animate-fadeIn">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-600 text-white shadow-xs flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white animate-pulse" />
              NOW
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {activeBlock.startTime} – {activeBlock.endTime}
            </span>
            {activeBlock.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-muted text-muted-foreground capitalize">
                {activeBlock.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isTransitionWarning && (
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Wrapping up in {remainingMinutes}m
              </span>
            )}
            <span className="text-xs font-bold text-foreground">
              {remainingMinutes} min remaining
            </span>
          </div>
        </div>

        {/* Hero Task Title & Visual Progress */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
            {activeBlock.title}
          </h1>

          {/* Visual Elapsed Progress Bar */}
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Level 2: Chunked Micro-Steps (Max 1-2 visible) */}
        {totalStepsCount > 0 ? (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Actionable Micro-Steps
              </span>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                {completedStepsCount} of {totalStepsCount} complete
              </span>
            </div>

            <div className="space-y-1.5">
              {visibleSteps.map((step) => (
                <label
                  key={step.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-background/80 transition-colors cursor-pointer text-xs font-medium text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={(e) =>
                      onToggleMicroStep &&
                      onToggleMicroStep(activeBlock.id, step.id, e.target.checked)
                    }
                    className="size-4 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={step.done ? 'line-through text-muted-foreground' : ''}>
                    {step.text}
                  </span>
                </label>
              ))}
            </div>

            {totalStepsCount > 2 && (
              <button
                type="button"
                onClick={() => setAllStepsModalOpen(true)}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer pt-0.5"
              >
                <span>View all {totalStepsCount} steps</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          onBreakdownTask && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Feeling friction getting started?
              </span>
              <button
                type="button"
                data-tour="breakdown-btn"
                onClick={() => onBreakdownTask(activeBlock)}
                className="font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
              >
                Break it down
              </button>
            </div>
          )
        )}

        {/* Level 1 Bottom Preview: NEXT Task + Actions */}
        <div data-tour="next-preview" className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/50 text-xs">
          {nextBlock ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-bold text-foreground">NEXT:</span>
              <span>{nextBlock.title}</span>
              <span className="text-[11px]">({nextBlock.startTime})</span>
              {nextBlock.reminderMinutesBefore && nextBlock.reminderMinutesBefore.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  +15m Buffer
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Last scheduled block of the day</span>
          )}

          <div className="flex items-center gap-2">
            {onStartFocusTimer && (
              <Button
                size="sm"
                data-tour="start-focus-btn"
                onClick={() => onStartFocusTimer(activeBlock)}
                className="rounded-xl text-xs font-semibold h-9 px-4 bg-teal-600 hover:bg-teal-500 text-white shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                Start Focus Timer
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* All Micro-Steps Modal (Progressive Disclosure) */}
      <Dialog open={allStepsModalOpen} onOpenChange={setAllStepsModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              All Task Micro-Steps
            </DialogTitle>
            <DialogDescription className="text-xs">
              {activeBlock.title} · {completedStepsCount} of {totalStepsCount} completed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3 max-h-[60vh] overflow-y-auto">
            {steps.map((step, idx) => (
              <label
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border/70 hover:bg-muted/50 transition-colors cursor-pointer text-xs font-medium text-foreground"
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={(e) =>
                    onToggleMicroStep &&
                    onToggleMicroStep(activeBlock.id, step.id, e.target.checked)
                  }
                  className="size-4 mt-0.5 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span className={step.done ? 'line-through text-muted-foreground' : ''}>
                  {idx + 1}. {step.text}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllStepsModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
