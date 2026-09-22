import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { Sparkles, Bot, Send, Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskTranslationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assigneeName?: string;
}

const PRESET_TASKS = [
  {
    title: 'Competitor Analysis',
    prompt: 'Prepare competitor research and analysis presentation by Friday.',
    deadline: 'Friday, 5:00 PM',
    priority: 'High' as const,
  },
  {
    title: 'Refactor Auth State',
    prompt: 'Fix the session refresh token race condition and write unit tests.',
    deadline: 'Tomorrow, 3:00 PM',
    priority: 'High' as const,
  },
  {
    title: 'Sprint Retrospective Deck',
    prompt: 'Draft 5 slides summarizing sprint takeaways and design improvements.',
    deadline: 'Thursday, 12:00 PM',
    priority: 'Medium' as const,
  },
];

export function TaskTranslationModal({
  open,
  onOpenChange,
  assigneeName = 'Thai',
}: TaskTranslationModalProps) {
  const [rawText, setRawText] = useState('Prepare competitor research and presentation by Friday.');
  const [deadline, setDeadline] = useState('Friday, 5:00 PM');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [isTranslating, setIsTranslating] = useState(false);

  const { translateManagerTask } = useWorkModeStore();

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setIsTranslating(true);
    setTimeout(() => {
      translateManagerTask(rawText.trim(), deadline, priority, assigneeName);
      setIsTranslating(false);
      toast.success('Task adapted & restructured using Workplace Passport preferences!');
      onOpenChange(false);
    }, 600);
  };

  const applyPreset = (preset: typeof PRESET_TASKS[0]) => {
    setRawText(preset.prompt);
    setDeadline(preset.deadline);
    setPriority(preset.priority);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-3xl border-border/80 bg-background/95 backdrop-blur-xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Bot className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              AI Task Translator for {assigneeName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Enter a standard manager task request. Modo reads {assigneeName}'s approved Work Mode preferences to restructure it into clear micro-milestones with zero ambiguity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTranslate} className="space-y-4 py-2">
          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> Quick Sample Prompts
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TASKS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-primary/5 text-xs text-foreground font-medium transition-all"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Raw Task Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Manager Request / Objective
            </label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Prepare competitor research and presentation by Friday..."
              className="min-h-[90px] rounded-xl bg-card/60 border-border text-xs leading-relaxed"
              required
            />
          </div>

          {/* Deadline & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" /> Deadline
              </label>
              <Input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Friday, 5:00 PM"
                className="h-10 rounded-xl bg-card/60 border-border text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <div className="flex gap-1.5 h-10">
                {(['High', 'Medium', 'Low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-xl text-xs font-semibold border transition-all ${
                      priority === p
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-card/60 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isTranslating || !rawText.trim()}
              className="rounded-xl bg-primary text-primary-foreground font-semibold gap-1.5 shadow-xs"
            >
              <Sparkles className="size-3.5" />
              {isTranslating ? 'Translating...' : 'Translate & Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
