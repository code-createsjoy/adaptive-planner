import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  Zap,
  Target,
} from 'lucide-react';
import { useGuidanceStore, GuidanceStyle } from '@/store/useGuidanceStore';

interface HelpAndGuidanceSettingsCardProps {
  onReplayTour?: () => void;
}

export const HelpAndGuidanceSettingsCard: React.FC<HelpAndGuidanceSettingsCardProps> = ({
  onReplayTour,
}) => {
  const {
    guidanceStyle,
    setGuidanceStyle,
    resetAllGuidance,
    startTour,
  } = useGuidanceStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReplayTour = () => {
    startTour(0);
    if (onReplayTour) {
      onReplayTour();
    }
  };

  const handleResetTips = () => {
    resetAllGuidance();
    showToast('All guidance tips have been reset to default!');
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-border/80 shadow-sm space-y-5 text-foreground relative overflow-hidden">
      {toastMessage && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 animate-fadeIn">
          <Check className="size-4" />
          {toastMessage}
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">
              Help & Guidance
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize Modo's guidance density and replay interactive tours anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 pt-1 border-t border-border/60">
        {/* Section 1: Guidance Density */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <HelpCircle className="size-3.5 text-teal-600 dark:text-teal-400" />
            Guidance Detail Level
          </label>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tailored to your cognitive preferences without rigid diagnostic labels.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(
              [
                { id: 'minimal', label: 'Minimal', desc: 'Action only' },
                { id: 'guided', label: 'Standard', desc: '1-sentence note' },
                { id: 'detailed', label: 'Detailed', desc: 'With "Why" expander' },
              ] as { id: GuidanceStyle; label: string; desc: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGuidanceStyle(opt.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  guidanceStyle === opt.id
                    ? 'border-teal-500 bg-teal-500/15 text-teal-800 dark:text-teal-200 shadow-2xs'
                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Replay Actions */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-foreground">
            Replay Guidance Experiences
          </label>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleReplayTour}
              className="w-full px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Play className="size-3.5 fill-white" />
                Replay Dashboard Tour (5 steps)
              </span>
              <span className="text-[10px] opacity-80 font-normal">30-45s</span>
            </button>

            <button
              type="button"
              onClick={handleResetTips}
              className="w-full px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted active:scale-98 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer text-foreground"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="size-3.5 text-muted-foreground" />
                Reset all guidance tips
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
