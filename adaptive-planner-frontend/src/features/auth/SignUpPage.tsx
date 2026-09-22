import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPlus, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signup, setAuthView, authError, setAuthError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setAuthError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    try {
      setSubmitting(true);
      await signup({ name: name.trim(), email: email.trim(), password });
    } catch {
      // Error handled in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your Modo space"
      subtitle="A compassionate companion that adapts to how your mind actually works."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {authError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-800 dark:text-amber-200 text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{authError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="≥ 6 characters"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all text-sm"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span>
            I accept the <span className="text-teal-600 dark:text-teal-400 font-medium hover:underline">Terms of Service</span> and{' '}
            <span className="text-teal-600 dark:text-teal-400 font-medium hover:underline">Privacy Policy</span>.
          </span>
        </label>

        <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300">
          <Sparkles className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
          <span>No pressure. You can customize all sensory and workflow settings anytime.</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create account</span>
            </>
          )}
        </button>

        <div className="pt-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              Sign in <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
