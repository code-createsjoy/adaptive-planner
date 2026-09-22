import React, { useState } from 'react';
import { NeurodivergenceSelfIdRequest, DiagnosticStatus } from '@/types/auth';
import { Lock, ArrowRight, ArrowLeft, Check, Sparkles, Brain, Zap, ShieldCheck } from 'lucide-react';

interface NeurodivergenceSelfIdStepProps {
  onSave: (data: NeurodivergenceSelfIdRequest) => Promise<void>;
  onBack: () => void;
  onSkip: () => void;
}

const STATUS_OPTIONS: { value: DiagnosticStatus; title: string; desc: string }[] = [
  {
    value: 'PROFESSIONAL_DIAGNOSIS',
    title: 'I have a professional diagnosis',
    desc: 'Diagnosed with ADHD, Autism, Dyslexia, or related traits by a clinician.',
  },
  {
    value: 'SELF_IDENTIFIED',
    title: "I identify as neurodivergent, but don't have a formal diagnosis",
    desc: 'Lived experience, personal research, or self-identified neurotype.',
  },
  {
    value: 'THINK_MAY_BE',
    title: 'I think I may be neurodivergent',
    desc: 'Exploring and noticing patterns in attention, sensory processing, or executive function.',
  },
  {
    value: 'NEUROTYPICAL',
    title: 'I consider myself neurotypical',
    desc: 'Here for a clean, calm, and distraction-free adaptive daily planner.',
  },
  {
    value: 'NOT_SURE',
    title: "I'm not sure",
    desc: 'Still figuring out what works best for my mind and energy.',
  },
  {
    value: 'PREFER_NOT_TO_SAY',
    title: 'Prefer not to say',
    desc: 'Keep details completely private.',
  },
];

const CONDITION_OPTIONS = [
  'ADHD',
  'Autism',
  'Dyslexia',
  'Dyspraxia / DCD',
  'Dyscalculia',
  'Tourette syndrome',
  'Other',
  'Prefer not to specify',
];

export const NeurodivergenceSelfIdStep: React.FC<NeurodivergenceSelfIdStepProps> = ({
  onSave,
  onBack,
  onSkip,
}) => {
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatus>('SELF_IDENTIFIED');
  const [identifiedTraits, setIdentifiedTraits] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleCondition = (item: string) => {
    if (identifiedTraits.includes(item)) {
      setIdentifiedTraits(identifiedTraits.filter((x) => x !== item));
    } else {
      setIdentifiedTraits([...identifiedTraits, item]);
    }
  };

  const isDiagnosedOrSelfId =
    diagnosticStatus === 'PROFESSIONAL_DIAGNOSIS' || diagnosticStatus === 'SELF_IDENTIFIED';

  const isExploringOrUnsure =
    diagnosticStatus === 'THINK_MAY_BE' || diagnosticStatus === 'NOT_SURE';

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSave({
        identifiedTraits,
        diagnosticStatus,
        primaryChallenges: [],
        strengths: [],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 text-xs font-semibold">
            Step 2 of 3
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>100% Private to you</span>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          How would you describe your experience with neurodivergence?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          This information is completely optional and never shared with employers or third parties.
        </p>
      </div>

      {/* 6 Radio Cards */}
      <div className="space-y-2.5">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = diagnosticStatus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDiagnosticStatus(opt.value)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {opt.title}
                  </h3>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conditional Multi-select: If Diagnosed or Self-Identified */}
      {isDiagnosedOrSelfId && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Would you like to tell Modo more? (Optional)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((item) => {
              const active = identifiedTraits.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCondition(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditional Screening Prompt: If Unsure / Exploring */}
      {isExploringOrUnsure && (
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2 animate-fadeIn text-xs text-teal-900 dark:text-teal-200">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Would you like to explore your patterns?</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Modo can guide you through a short screening-style assessment to help identify patterns in attention, sensory needs, task initiation, and structure preferences. <strong>This is not a medical diagnosis.</strong>
          </p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{saving ? 'Saving...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
