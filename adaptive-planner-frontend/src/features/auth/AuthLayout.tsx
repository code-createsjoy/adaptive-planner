import React from 'react';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-teal-100 dark:selection:bg-teal-900">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-md shadow-teal-500/5 border border-teal-100 dark:border-teal-900/40 backdrop-blur-sm mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="ml-3 font-bold text-2xl tracking-tight text-slate-800 dark:text-slate-100">
              Modo
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800">
          {children}
        </div>

        {/* Footer Principles */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-teal-500" />
            Adaptive to your brain
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            100% Private & Safe
          </span>
        </div>
      </div>
    </div>
  );
};
