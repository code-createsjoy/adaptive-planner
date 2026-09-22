import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, ArrowRight, SlidersHorizontal } from 'lucide-react';

interface WelcomeStepProps {
  userName: string;
  onNext: () => void;
  onSkipAll: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ userName, onNext, onSkipAll }) => {
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3.5 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome to Modo, {userName || 'friend'}!
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Traditional productivity apps expect everyone to think the same way. Modo is built differently — designed around how your brain naturally flows, focuses, and recharges.
        </p>
      </div>

      {/* Core Commitments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
            Adaptive Personalization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
            We adapt pacing, sensory levels, and layouts to fit your cognitive energy.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
            100% Private & Safe
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
            Your self-identification and responses are strictly private to you.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
            No Medical Diagnosis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
            Zero judgment or medical labels. We focus solely on functional support.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onSkipAll}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          I'll set this up later
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
        >
          <span>Begin Personalization</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
