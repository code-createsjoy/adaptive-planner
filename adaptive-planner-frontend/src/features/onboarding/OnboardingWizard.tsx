import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import {
  JourneyStage,
  NeurodivergenceSelfIdRequest,
  AssessmentSubmissionRequest,
  FunctionalProfileDto,
} from '@/types/auth';
import { WelcomeStep } from './components/WelcomeStep';
import { JourneyStageStep } from './components/JourneyStageStep';
import { NeurodivergenceSelfIdStep } from './components/NeurodivergenceSelfIdStep';
import { FunctionalAssessmentStep } from './components/FunctionalAssessmentStep';
import { FunctionalProfileRevealCard } from './components/FunctionalProfileRevealCard';
import { Sparkles, X } from 'lucide-react';

type WizardStep =
  | 'WELCOME'
  | 'JOURNEY_STAGE'
  | 'NEURODIVERGENCE_SELF_ID'
  | 'FUNCTIONAL_ASSESSMENT'
  | 'PROFILE_REVEAL';

export const OnboardingWizard: React.FC = () => {
  const { user, updateUser, setOnboardingCompleted } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<WizardStep>('WELCOME');
  const [generatedProfile, setGeneratedProfile] = useState<FunctionalProfileDto | null>(null);

  const handleSkipAll = async () => {
    try {
      await api.completeOnboarding();
      setOnboardingCompleted(true);
    } catch {
      setOnboardingCompleted(true);
    }
  };

  const handleSaveJourneyStage = async (stage: JourneyStage) => {
    try {
      const updatedUser = await api.saveJourneyStage({ stage });
      updateUser({ journeyStage: updatedUser.journeyStage });
      setCurrentStep('NEURODIVERGENCE_SELF_ID');
    } catch (e) {
      console.error('Failed to save journey stage', e);
      setCurrentStep('NEURODIVERGENCE_SELF_ID');
    }
  };

  const handleSaveNeurodivergenceSelfId = async (data: NeurodivergenceSelfIdRequest) => {
    try {
      await api.saveNeurodivergenceSelfId(data);
      setCurrentStep('FUNCTIONAL_ASSESSMENT');
    } catch (e) {
      console.error('Failed to save self id', e);
      setCurrentStep('FUNCTIONAL_ASSESSMENT');
    }
  };

  const handleSubmitAssessment = async (submission: AssessmentSubmissionRequest) => {
    try {
      const profile = await api.submitAssessment(submission);
      setGeneratedProfile(profile);
      setCurrentStep('PROFILE_REVEAL');
      return profile;
    } catch (e) {
      console.error('Failed to submit assessment', e);
      // If error occurs, still allow finishing
      handleFinish();
      throw e;
    }
  };

  const handleFinish = async () => {
    try {
      await api.completeOnboarding();
      setOnboardingCompleted(true);
    } catch {
      setOnboardingCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-teal-100 dark:selection:bg-teal-900">
      <div className="w-full max-w-2xl">
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">
              Modo Setup
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkipAll}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Skip onboarding"
          >
            <span>Skip to dashboard</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Wizard Container */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800">
          {currentStep === 'WELCOME' && (
            <WelcomeStep
              userName={user?.name || ''}
              onNext={() => setCurrentStep('JOURNEY_STAGE')}
              onSkipAll={handleSkipAll}
            />
          )}

          {currentStep === 'JOURNEY_STAGE' && (
            <JourneyStageStep
              initialStage={user?.journeyStage}
              onSave={handleSaveJourneyStage}
              onBack={() => setCurrentStep('WELCOME')}
              onSkip={() => setCurrentStep('NEURODIVERGENCE_SELF_ID')}
            />
          )}

          {currentStep === 'NEURODIVERGENCE_SELF_ID' && (
            <NeurodivergenceSelfIdStep
              onSave={handleSaveNeurodivergenceSelfId}
              onBack={() => setCurrentStep('JOURNEY_STAGE')}
              onSkip={() => setCurrentStep('FUNCTIONAL_ASSESSMENT')}
            />
          )}

          {currentStep === 'FUNCTIONAL_ASSESSMENT' && (
            <FunctionalAssessmentStep
              onSubmit={handleSubmitAssessment}
              onBack={() => setCurrentStep('NEURODIVERGENCE_SELF_ID')}
              onSkip={handleFinish}
            />
          )}

          {currentStep === 'PROFILE_REVEAL' && generatedProfile && (
            <FunctionalProfileRevealCard
              profile={generatedProfile}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  );
};
