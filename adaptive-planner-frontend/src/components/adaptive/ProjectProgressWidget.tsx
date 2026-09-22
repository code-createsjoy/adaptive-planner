import React, { useState } from 'react';
import { ProjectGoal, ProjectSubtask } from '@/types/planner';
import {
  Sparkles,
  Target,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  Check,
  ListTodo,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectProgressWidgetProps {
  goal: ProjectGoal;
  todaySubtasks?: ProjectSubtask[];
  selectedDate?: string;
  onToggleSubtask?: (subtaskId: number, completed: boolean) => void;
  onOpenRebalance?: (goal: ProjectGoal) => void;
  onCompleteGoal?: (goalId: number) => void;
}

export const ProjectProgressWidget: React.FC<ProjectProgressWidgetProps> = ({
  goal,
  todaySubtasks = [],
  selectedDate,
  onToggleSubtask,
  onOpenRebalance,
  onCompleteGoal,
}) => {
  const isLocked = goal.status === 'COMPLETED';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'byDate' | 'byMilestone'>('today');
  const [isListExpanded, setIsListExpanded] = useState<boolean>(!isLocked);
  const [collapsedDateGroups, setCollapsedDateGroups] = useState<Record<string, boolean>>({});
  const [collapsedMilestoneGroups, setCollapsedMilestoneGroups] = useState<Record<string, boolean>>({});

  const toggleDateGroup = (dateKey: string) => {
    setCollapsedDateGroups((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const toggleMilestoneGroup = (milestoneKey: string) => {
    setCollapsedMilestoneGroups((prev) => ({ ...prev, [milestoneKey]: !prev[milestoneKey] }));
  };

  const isAllSubtasksDone = (goal.subtasks && goal.subtasks.length > 0)
    ? goal.subtasks.every((s) => s.completed)
    : false;
  const isCompleted = isLocked || goal.progressPercentage >= 100 || isAllSubtasksDone;
  const isTight = goal.feasibilityStatus === 'TIGHT';

  const allSubtasks = goal.subtasks || [];
  const todayTotalCount = todaySubtasks.length;
  const todayCompletedCount = todaySubtasks.filter((s) => s.completed).length;

  const totalCompletedAll = allSubtasks.filter((s) => s.completed).length;
  const totalSubtasksAll = allSubtasks.length;

  // Group subtasks by scheduledDate
  const subtasksByDate = allSubtasks.reduce<Record<string, ProjectSubtask[]>>((acc, st) => {
    const key = st.scheduledDate || 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});

  // Group subtasks by milestone
  const subtasksByMilestone = allSubtasks.reduce<Record<string, ProjectSubtask[]>>((acc, st) => {
    const key = st.milestoneName || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});

  const getDayLabel = (dateStr: string) => {
    if (!dateStr || dateStr === 'Unassigned') return 'Unassigned';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[date.getDay()];
      const isToday = selectedDate ? dateStr === selectedDate : false;
      return `${dayName} (${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')})${isToday ? ' · Today' : ''}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/90 backdrop-blur-md p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-primary/15 text-primary shrink-0">
              <Target className="size-4" />
            </span>
            <h4 className="font-bold text-sm text-foreground truncate">
              {goal.title}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium flex-wrap">
            <span>Deadline: <strong>{goal.officialDeadline}</strong></span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {goal.remainingBufferDays} buffer days
            </span>
            <span>•</span>
            <span>{totalCompletedAll}/{totalSubtasksAll} completed</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLocked ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="size-3.5" />
              Completed & Archived
            </span>
          ) : (
            <>
              {isAllSubtasksDone ? (
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  size="sm"
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 px-3 py-1 animate-pulse"
                >
                  <Sparkles className="size-3.5" />
                  Mark Complete
                </Button>
              ) : (
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    isTight
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  {isTight ? '⚠️ Tight' : '⚡ On track'}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Locked Celebration & Notice Banner */}
      {isLocked && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <ShieldCheck className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Project successfully completed!</p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Archived to decision history with locked edits. Associated timetable tasks have been cleared to keep your daily view uncluttered.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar Derived */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">
            Milestone: <strong className="text-foreground">{goal.currentMilestone}</strong>
          </span>
          <span className="font-bold text-primary">
            {goal.progressPercentage}% ({Math.round(goal.completedEstimatedMinutes / 60)}h / {Math.round(goal.totalEstimatedMinutes / 60)}h)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Collapsible Subtasks / History List Section */}
      {!isListExpanded ? (
        <div
          onClick={() => setIsListExpanded(true)}
          className="p-3.5 rounded-2xl bg-muted/25 hover:bg-muted/40 border border-border/70 flex items-center justify-between cursor-pointer transition-all text-xs select-none group shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ListTodo className="size-4" />
            </div>
            <div>
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <span>{isLocked ? 'Completed Activity History' : 'Detailed Task Breakdown'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                  {totalCompletedAll}/{totalSubtasksAll} done
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isLocked
                  ? 'Collapsed to save space • Click to view history details'
                  : 'Click to open and check off progress'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-xs group-hover:underline">
            <span>View Tasks</span>
            <ChevronDown className="size-4" />
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* View Mode Segmented Controls + Collapse Button */}
          <div className="flex items-center justify-between pt-1 border-t border-border/60 flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setViewMode('today')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'today'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListTodo className="size-3" />
                <span>Today ({todayCompletedCount}/{todayTotalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('byDate')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'byDate'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="size-3" />
                <span>By Day ({totalCompletedAll}/{totalSubtasksAll})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('byMilestone')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'byMilestone'
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="size-3" />
                <span>By Milestone</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {todayCompletedCount < todayTotalCount && onOpenRebalance && (
                <button
                  type="button"
                  onClick={() => onOpenRebalance(goal)}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold text-xs"
                >
                  <RefreshCw className="size-3" />
                  <span className="hidden sm:inline">Rebalance</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsListExpanded(false)}
                className="px-2.5 py-1 rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px] font-medium transition-all"
                title="Collapse list"
              >
                <span>Collapse</span>
                <ChevronUp className="size-3" />
              </button>
            </div>
          </div>

          {/* 1. Mode: Today's Subtasks Checklist */}
          {viewMode === 'today' && (
            <div className="space-y-2">
              {todayTotalCount === 0 ? (
                <div className="p-3 text-center rounded-2xl bg-muted/20 border border-border/60 text-xs text-muted-foreground">
                  No subtasks scheduled for today. Switch to the <strong>"By Day"</strong> tab to view the week's distribution or check off tasks in advance!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {todaySubtasks.map((st) => (
                    <label
                      key={st.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all select-none ${
                        isLocked
                          ? 'bg-muted/30 border-border/30 opacity-75 cursor-default'
                          : st.completed
                          ? 'bg-muted/40 border-border/40 opacity-70 cursor-pointer'
                          : 'bg-background border-border/80 hover:border-primary/50 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        disabled={isLocked}
                        onChange={(e) =>
                          !isLocked && onToggleSubtask && onToggleSubtask(st.id, e.target.checked)
                        }
                        className={`mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/20 ${
                          isLocked ? 'cursor-default opacity-80' : 'cursor-pointer'
                        }`}
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p
                          className={`font-medium text-foreground truncate ${
                            st.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {st.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {st.milestoneName} · {st.estimatedMinutes}m
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Mode: Grouped Day-by-Day Detailed Schedule */}
          {viewMode === 'byDate' && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(subtasksByDate).map(([dateKey, tasks]) => {
                const isDateToday = selectedDate ? dateKey === selectedDate : false;
                const completedCount = tasks.filter((t) => t.completed).length;
                const allDoneInDate = completedCount === tasks.length;
                const isCollapsed = !!collapsedDateGroups[dateKey];

                return (
                  <div
                    key={dateKey}
                    className={`p-3 rounded-2xl border space-y-2 transition-all ${
                      isDateToday
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/60 bg-muted/15'
                    }`}
                  >
                    <div
                      onClick={() => toggleDateGroup(dateKey)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <span className="font-bold text-xs text-foreground font-mono flex items-center gap-1.5">
                        {isCollapsed ? (
                          <ChevronRight className="size-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-3 text-muted-foreground" />
                        )}
                        <Calendar className="size-3 text-primary" />
                        <span>{getDayLabel(dateKey)}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          allDoneInDate
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {completedCount}/{tasks.length} done
                      </span>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-1.5 pt-1">
                        {tasks.map((st) => (
                          <label
                            key={st.id}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all select-none ${
                              isLocked
                                ? 'bg-muted/30 border-border/30 opacity-75 cursor-default'
                                : st.completed
                                ? 'bg-muted/40 border-border/40 opacity-70 cursor-pointer'
                                : 'bg-card border-border/80 hover:border-primary/50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              disabled={isLocked}
                              onChange={(e) =>
                                !isLocked && onToggleSubtask && onToggleSubtask(st.id, e.target.checked)
                              }
                              className={`mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/20 ${
                                isLocked ? 'cursor-default opacity-80' : 'cursor-pointer'
                              }`}
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <p
                                className={`font-medium text-foreground truncate ${
                                  st.completed ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {st.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {st.milestoneName} · {st.estimatedMinutes}m
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Mode: Grouped By Milestone */}
          {viewMode === 'byMilestone' && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(subtasksByMilestone).map(([milestoneName, tasks]) => {
                const completedCount = tasks.filter((t) => t.completed).length;
                const milestoneTotal = tasks.length;
                const allDone = completedCount === milestoneTotal;
                const isCollapsed = !!collapsedMilestoneGroups[milestoneName];

                return (
                  <div
                    key={milestoneName}
                    className="p-3 rounded-2xl border border-border/60 bg-muted/15 space-y-2 transition-all"
                  >
                    <div
                      onClick={() => toggleMilestoneGroup(milestoneName)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        {isCollapsed ? (
                          <ChevronRight className="size-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-3 text-muted-foreground" />
                        )}
                        <Layers className="size-3 text-primary" />
                        <span>{milestoneName}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          allDone
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {completedCount}/{milestoneTotal} done
                      </span>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-1.5 pt-1">
                        {tasks.map((st) => (
                          <label
                            key={st.id}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all select-none ${
                              isLocked
                                ? 'bg-muted/30 border-border/30 opacity-75 cursor-default'
                                : st.completed
                                ? 'bg-muted/40 border-border/40 opacity-70 cursor-pointer'
                                : 'bg-card border-border/80 hover:border-primary/50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              disabled={isLocked}
                              onChange={(e) =>
                                !isLocked && onToggleSubtask && onToggleSubtask(st.id, e.target.checked)
                              }
                              className={`mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/20 ${
                                isLocked ? 'cursor-default opacity-80' : 'cursor-pointer'
                              }`}
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <p
                                className={`font-medium text-foreground truncate ${
                                  st.completed ? 'line-through text-muted-foreground' : ''
                                }`}
                              >
                                {st.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {st.scheduledDate ? getDayLabel(st.scheduledDate) : 'Unassigned'} · {st.estimatedMinutes}m
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog before Finalizing & Locking Goal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border-border shadow-2xl">
          <DialogHeader>
            <div className="size-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-2">
              <CheckCircle2 className="size-6" />
            </div>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Confirm Project Completion?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed space-y-3">
              <p>
                You are about to mark project <strong>"{goal.title}"</strong> as complete ({totalCompletedAll}/{totalSubtasksAll} tasks).
              </p>
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 space-y-2 text-xs text-foreground">
                <div className="flex items-start gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Permanently save to <strong>Decision History</strong> and lock editing (Read-only).</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Clear</strong> remaining project subtasks from the timetable for a clean schedule.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Send a celebration alert to the <strong>Notification Center</strong>.</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="rounded-xl"
            >
              Review
            </Button>
            <Button
              onClick={() => {
                setShowConfirmModal(false);
                if (onCompleteGoal) {
                  onCompleteGoal(goal.id);
                }
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
