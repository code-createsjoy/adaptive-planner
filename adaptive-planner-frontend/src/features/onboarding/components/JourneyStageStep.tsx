import React, { useState } from 'react';
import { JourneyStage } from '@/types/auth';
import { Compass, FileCheck, Sparkles, Heart, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface JourneyStageStepProps {
  initialStage?: JourneyStage | null;
  onSave: (stage: JourneyStage) => Promise<void>;
  onBack: () => void;
  onSkip: () => void;
}

interface StageOption {
  value: JourneyStage;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STAGES: StageOption[] = [
  {
    value: 'STUDYING',
    title: 'Studying',
    description: 'School, university, or self-directed coursework.',
    icon: Compass,
  },
  {
    value: 'EXPLORING_CAREERS',
    title: 'Exploring career options',
    description: 'Looking into new fields and discovering work styles.',
    icon: Sparkles,
  },
  {
    value: 'JOB_SEARCHING',
    title: 'Looking for work',
    description: 'Active job hunting and applying for positions.',
    icon: Compass,
  },
  {
    value: 'INTERVIEW_PREPARATION',
    title: 'Preparing for interviews',
    description: 'Practicing conversations and structuring time.',
    icon: FileCheck,
  },
  {
    value: 'STARTING_NEW_JOB',
    title: 'Starting a new job',
    description: 'Onboarding and settling into a new routine.',
    icon: Sparkles,
  },
  {
    value: 'CURRENTLY_WORKING',
    title: 'Currently working',
    description: 'Managing daily workload and protecting focus.',
    icon: Heart,
  },
  {
    value: 'OTHER',
    title: 'Something else',
    description: 'Personal projects or other daily rhythms.',
    icon: HelpCircle,
  },
  {
    value: 'PREFER_NOT_TO_SAY',
    title: 'Prefer not to say',
    description: 'Keep it open and explore the space freely.',
    icon: HelpCircle,
  },
];

export const JourneyStageStep: React.FC<JourneyStageStepProps> = ({
  initialStage,
  onSave,
  onBack,
  onSkip,
}) => {
  const [selected, setSelected] = useState<JourneyStage>(initialStage || 'CURRENTLY_WORKING');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSave(selected);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 text-xs font-semibold">
          <span>Step 1 of 3</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Where are you on your journey?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This helps us provide the most compassionate and relevant guidance. You can change this anytime.
        </p>
      </div>

      {/* Options Cards */}
      <div className="space-y-2.5">
        {STAGES.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {opt.title}
                  </h3>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

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
