import React from 'react';
import { FunctionalProfileDto } from '@/types/auth';
import { Sparkles, Compass, ShieldCheck, Check, ArrowRight, Sliders, Layers, Clock } from 'lucide-react';

interface FunctionalProfileRevealCardProps {
  profile: FunctionalProfileDto;
  onFinish: () => void;
}

export const FunctionalProfileRevealCard: React.FC<FunctionalProfileRevealCardProps> = ({
  profile,
  onFinish,
}) => {
  const dimensions = [
    { label: 'Attention Filter', score: profile.attentionScore, color: 'from-amber-400 to-amber-500' },
    { label: 'Task Initiation', score: profile.initiationScore, color: 'from-teal-400 to-emerald-500' },
    { label: 'Time Awareness', score: profile.timeAwarenessScore, color: 'from-sky-400 to-blue-500' },
    { label: 'Context Recovery', score: profile.contextSwitchScore, color: 'from-indigo-400 to-violet-500' },
    { label: 'Sensory Sensitivity', score: profile.sensorySensitivityScore, color: 'from-rose-400 to-pink-500' },
    { label: 'Need for Structure', score: profile.structureNeedScore, color: 'from-emerald-400 to-teal-500' },
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Your Modo Functional Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Here is how Modo has calibrated your initial workspace to protect your energy and flow.
        </p>
      </div>

      {/* Preset Recommendations Summary Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-sky-500/10 border border-teal-500/20 space-y-4">
        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs font-bold tracking-wider uppercase">
          <Compass className="w-4 h-4" />
          <span>Tailored Adaptations Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Sensory Atmosphere
            </span>
            <div className="font-bold text-sm text-slate-900 dark:text-white capitalize">
              {profile.recommendedSensoryMode.toLowerCase()} Mode
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Pacing Strategy
            </span>
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {profile.recommendedPacing.replace('_', ' ')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Layout Density
            </span>
            <div className="font-bold text-sm text-slate-900 dark:text-white capitalize">
              {profile.recommendedDensity.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-teal-500/10">
          {profile.supportiveSummary}
        </p>
      </div>

      {/* 6 Dimension Scales */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cognitive & Sensory Dimensions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {dimensions.map((dim) => (
            <div key={dim.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{dim.label}</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {Math.round(dim.score)} / 100
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${dim.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(10, dim.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traits & Accommodations */}
      {profile.traitsSummary && profile.traitsSummary.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detected Functional Patterns
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.traitsSummary.map((trait, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Non-Diagnostic Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="leading-relaxed">{profile.medicalDisclaimer}</p>
      </div>

      {/* Finish CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-600/25 transition-all cursor-pointer"
        >
          <span>Open My Adaptive Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
