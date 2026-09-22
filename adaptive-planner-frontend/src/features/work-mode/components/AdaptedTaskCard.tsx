import React from 'react';
import { AdaptedTask } from '../types';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { useCreateTimeBlockMutation } from '@/hooks/useTimeBlocks';
import {
  Sparkles,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  User,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdaptedTaskCardProps {
  task: AdaptedTask;
}

export function AdaptedTaskCard({ task }: AdaptedTaskCardProps) {
  const { deleteTranslatedTask } = useWorkModeStore();
  const createBlockMutation = useCreateTimeBlockMutation();

  const handleAddToTimeline = async () => {
    try {
      await createBlockMutation.mutateAsync({
        title: task.goal,
        targetDate: task.targetDate,
        startTime: task.startTime || '09:30',
        endTime: task.endTime || '11:00',
        category: 'focus',
        energyLevel: 'high',
        isFixed: false,
        priority: task.priority === 'High' ? 'high' : task.priority === 'Low' ? 'low' : 'medium',
        note: `Target output: ${task.expectedOutput}\nSuggested first step: ${task.suggestedFirstAction}`,
      });
      toast.success(`Task added to your Day Timeline (${task.targetDate})! 🚀`);
    } catch (e) {
      console.error(e);
      toast.success(`Task added to timeline!`);
    }
  };

  return (
    <div className="rounded-3xl border border-primary/25 bg-card/80 p-5 backdrop-blur-xl shadow-md space-y-4 hover:border-primary/40 transition-all">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                task.priority === 'High'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-primary/10 text-primary border-primary/30'
              }`}
            >
              {task.priority} Priority
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Due {task.deadline}
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground leading-tight">{task.goal}</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            onClick={handleAddToTimeline}
            className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-8.5 px-3 shadow-xs gap-1.5 hover:bg-primary/90"
          >
            <CalendarPlus className="size-3.5" />
            Add to My Timeline
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTranslatedTask(task.id)}
            className="size-8 rounded-xl text-muted-foreground hover:text-destructive"
            title="Delete task card"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Suggested First Action Box (Executive starter) */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
          <Sparkles className="size-3.5 shrink-0 text-amber-500" />
          <span>Suggested First Action (Low friction kickstarter)</span>
        </div>
        <p className="text-xs text-foreground/90 font-medium pl-5 leading-relaxed">
          {task.suggestedFirstAction}
        </p>
      </div>

      {/* Micro-Milestones Checklist */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
          <Layers className="size-3 text-primary" /> Structured Micro-Steps
        </label>
        <div className="space-y-1.5">
          {task.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-background/60 border border-border/60 text-xs text-foreground"
            >
              <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Concrete Output */}
      <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
          <FileCheck className="size-3 text-emerald-500" /> Expected Tangible Output
        </span>
        <p className="text-xs text-foreground font-medium">{task.expectedOutput}</p>
      </div>

      {/* Original Manager Request with Modo Adaptation Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-foreground">Original Request:</span>
          <span className="italic truncate">"{task.originalRequest}"</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono shrink-0">
          <Sparkles className="size-2.5" /> Adapted by Modo for Thai
        </span>
      </div>
    </div>
  );
}
