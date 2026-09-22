import React from 'react';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { Sparkles, Check, X, ShieldAlert, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PrivateInsightBanner() {
  const { suggestedInsights, approveAiInsight, dismissAiInsight } = useWorkModeStore();
  const pendingInsight = suggestedInsights.find((i) => i.status === 'pending');

  if (!pendingInsight) return null;

  const handleApprove = () => {
    approveAiInsight(pendingInsight.id);
    toast.success('Insight added to your Workplace Passport! 🎉');
  };

  const handleDismiss = () => {
    dismissAiInsight(pendingInsight.id);
    toast.info('Insight dismissed.');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/80 to-primary/5 p-4 sm:p-5 shadow-sm backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-primary/15 text-primary border border-primary/20 shrink-0 mt-0.5">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
                Private AI Insight
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                <EyeOff className="size-2.5" /> Only visible to you
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-snug">
              {pendingInsight.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {pendingInsight.insightText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            onClick={handleApprove}
            className="rounded-xl bg-primary text-primary-foreground font-bold text-xs h-9 px-3.5 shadow-xs gap-1.5 hover:bg-primary/90"
          >
            <Check className="size-3.5" />
            Add to Passport
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="rounded-xl border-border text-muted-foreground hover:text-foreground text-xs h-9 px-3"
          >
            <X className="size-3.5 mr-1" />
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
