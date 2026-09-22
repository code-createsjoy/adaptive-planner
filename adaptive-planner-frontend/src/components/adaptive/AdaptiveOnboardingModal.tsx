import React, { useState } from 'react';
import { OnboardingAnswers } from '@/types/planner';
import { useSubmitOnboardingMutation } from '@/hooks/useAccessibilityProfile';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Eye,
  Bell,
  Calendar,
  Heart,
  ShieldCheck,
  Volume2,
  Minimize2,
  Layers,
  Smile,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdaptiveOnboardingModal: React.FC<AdaptiveOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const submitMutation = useSubmitOnboardingMutation();
  const profile = useAccessibilityStore((state) => state.profile);
  const setProfile = useAccessibilityStore((state) => state.setProfile);

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    infoStyle: 'MIXED',
    distractionSensitivity: 'HIGH',
    reminderPreference: 'GENTLE',
    schedulePreference: 'FLEXIBLE',
  });

  React.useEffect(() => {
    if (isOpen && profile) {
      setStep(1);
      setAnswers({
        infoStyle: profile.visualDensity === 'high' ? 'VISUAL' : profile.visualDensity === 'low' ? 'TEXT' : 'MIXED',
        distractionSensitivity: profile.sensorySensitivity === 'high' ? 'HIGH' : profile.sensorySensitivity === 'medium' ? 'MEDIUM' : 'LOW',
        reminderPreference: profile.notificationStyle === 'gentle' ? 'GENTLE' : profile.notificationStyle === 'persistent' ? 'PERSISTENT' : 'STANDARD',
        schedulePreference: profile.scheduleStructure === 'flexible' ? 'FLEXIBLE' : profile.scheduleStructure === 'structured' ? 'STRUCTURED' : 'BALANCED',
      });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await submitMutation.mutateAsync(answers);
      setProfile({ onboardingCompleted: true });
      onClose();
    } catch (err) {
      console.error('Failed to save onboarding profile:', err);
      setProfile({ onboardingCompleted: true });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] relative"
      >
        {/* Progress Bar & Header */}
        <div className="p-5 sm:p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                M
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Personal Accessibility Setup
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-primary shadow-xs'
                    : i < step
                    ? 'w-4 bg-primary/60'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Info Style */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Question 1 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    How do you prefer information presented?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modo will adapt visual density and timetable block layouts to your liking.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'VISUAL',
                      title: '🎨 Visual & Color-Rich',
                      desc: 'Icons, progress bars, and rich visual timeline blocks for intuitive overview.',
                    },
                    {
                      id: 'TEXT',
                      title: '📝 Structured & Minimal Text',
                      desc: 'Clean typography, low saturation, minimal decorative noise.',
                    },
                    {
                      id: 'MIXED',
                      title: '✨ Balanced & Mixed',
                      desc: 'Harmonious combination of visual timelines and precise checklists.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.infoStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, infoStyle: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Distraction Sensitivity */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Question 2 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    How sensitive are you to cognitive overload & distractions?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Helps determine the number of concurrent tasks and motion effects.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'HIGH',
                      title: '🌪️ Sensitive (Needs quiet & focused space)',
                      desc: 'Show Now → Next task only, reduce motion, hide non-essential side panels.',
                    },
                    {
                      id: 'MEDIUM',
                      title: '⚖️ Moderate (Occasional wandering focus)',
                      desc: 'Half-day timeline window with gentle transition prompts.',
                    },
                    {
                      id: 'LOW',
                      title: '🍃 Resilient (High focus & broad overview)',
                      desc: 'Full 24-hour timeline display with multiple concurrent task panels.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.distractionSensitivity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, distractionSensitivity: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Reminder Preference */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Question 3 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    How would you like reminder chimes & notifications?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avoid startling buzzers to support sensory well-being.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'GENTLE',
                      title: '🕊️ Gentle (432Hz Sine Tone & Subtle Toast)',
                      desc: 'Calming harmonic tone with 10-minute early heads-up for smooth context switching.',
                    },
                    {
                      id: 'STANDARD',
                      title: '🔔 Standard (Visual + Moderate Chime)',
                      desc: 'Corner toast notification with clean chime right at start time.',
                    },
                    {
                      id: 'PERSISTENT',
                      title: '⏰ Persistent (Multi-stage Reminders)',
                      desc: 'Staged alerts (30m, 10m, start) to ensure critical commitments are never missed.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.reminderPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, reminderPreference: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Schedule Preference */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Question 4 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    What timetable structure fits your flow best?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shapes how the AI suggests daily schedule reorganizations.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'FLEXIBLE',
                      title: '🌊 Adaptive & Buffer-Rich',
                      desc: 'Includes 10-15m transition buffers; easily reschedules tasks without pressure.',
                    },
                    {
                      id: 'BALANCED',
                      title: '⚖️ Balanced Flow',
                      desc: 'Anchored morning/evening routines with adaptive flexibility throughout the afternoon.',
                    },
                    {
                      id: 'STRUCTURED',
                      title: '📐 Structured & Timetabled',
                      desc: 'Clear time slots with protected priority blocks locked in place.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.schedulePreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, schedulePreference: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 5: Profile Summary Reveal */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center py-2"
              >
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                  <Sparkles className="size-8" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-foreground">
                    Your Adaptive Profile is Ready!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Modo configured your workspace and AI companion to harmonize with your cognitive style.
                  </p>
                </div>

                {/* Generated Profile Summary Card */}
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" /> Personal Accessibility Profile
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/15 text-primary">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Eye className="size-3" /> Visual Density:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.infoStyle === 'VISUAL' ? 'Visual' : answers.infoStyle === 'TEXT' ? 'Minimal Text' : 'Balanced'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Zap className="size-3 text-amber-500" /> Focus Support:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.distractionSensitivity === 'HIGH' ? 'Now → Next tasks' : 'Full timeline'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Volume2 className="size-3 text-teal-500" /> Chime Style:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.reminderPreference === 'GENTLE' ? '432Hz Sine Chime' : 'Standard'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="size-3 text-primary" /> Daily Flow:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.schedulePreference === 'FLEXIBLE' ? 'Adaptive + Buffers' : 'Structured'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 sm:p-5 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {submitMutation.isPending ? 'Saving...' : 'Start using Modo'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
