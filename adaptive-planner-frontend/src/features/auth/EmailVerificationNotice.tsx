import React from 'react';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { MailCheck, ArrowRight, RotateCcw } from 'lucide-react';

export const EmailVerificationNotice: React.FC = () => {
  const { user, setAuthView } = useAuthStore();

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a verification link to activate your account."
    >
      <div className="text-center space-y-5">
        <div className="size-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {user?.email || 'your email'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Click the link in the message to confirm your address and unlock your full personalized space.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            <span>Proceed to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-2xl text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Resend verification email
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
