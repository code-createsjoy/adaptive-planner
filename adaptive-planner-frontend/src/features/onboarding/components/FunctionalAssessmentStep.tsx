import React, { useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '../data/assessmentQuestions';
import { AssessmentSubmissionRequest, FunctionalProfileDto } from '@/types/auth';
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface FunctionalAssessmentStepProps {
  onSubmit: (data: AssessmentSubmissionRequest) => Promise<FunctionalProfileDto>;
  onBack: () => void;
  onSkip: () => void;
}

export const FunctionalAssessmentStep: React.FC<FunctionalAssessmentStepProps> = ({
  onSubmit,
  onBack,
  onSkip,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQ = ASSESSMENT_QUESTIONS[currentIndex];
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (score: number) => {
    const nextAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(nextAnswers);

    // Auto advance smoothly after short delay if not last question
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      const submission: AssessmentSubmissionRequest = {
        answers: ASSESSMENT_QUESTIONS.map((q) => ({
          questionId: q.id,
          dimension: q.dimension,
          scoreValue: answers[q.id] || 2, // default neutral if skipped
        })),
      };
      await onSubmit(submission);
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentAnswered = answers[currentQ.id] !== undefined;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-400">({answeredCount} answered)</span>
          </div>
          <span className="text-teal-600 dark:text-teal-400 font-bold">{progressPercent}%</span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-5">
        <div className="space-y-1.5">
          <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {currentQ.dimensionLabel}
          </span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
            {currentQ.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {currentQ.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.scoreValue;
            return (
              <button
                key={opt.scoreValue}
                type="button"
                onClick={() => handleSelectOption(opt.scoreValue)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {opt.label}
                  </div>
                  {opt.sublabel && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {opt.sublabel}
                    </div>
                  )}
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'border-teal-600 bg-teal-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
        <span>
          <strong>Functional Pattern Screening:</strong> Results adapt your workflow settings and are not a clinical diagnosis.
        </span>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex((prev) => prev - 1);
            } else {
              onBack();
            }
          }}
          className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentIndex === 0 ? 'Back to Self-ID' : 'Previous'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Skip assessment
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!isCurrentAnswered}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="py-2.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Analyzing Patterns...' : 'Reveal My Profile'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
