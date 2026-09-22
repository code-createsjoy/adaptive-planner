import React from 'react';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { RoleSwitcherWidget } from './RoleSwitcherWidget';
import { WorkplacePassportView } from './WorkplacePassportView';
import { ManagerWorkWithMeView } from './ManagerWorkWithMeView';
import { Briefcase, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export function WorkModeView() {
  const { activeRole } = useWorkModeStore();

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              My Work Mode
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collaborative workplace communication compatibility layer (Employee ↔ Modo AI ↔ Manager).
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <RoleSwitcherWidget />
        </div>
      </div>

      {/* Main Content Area */}
      {activeRole === 'employee' ? (
        <WorkplacePassportView />
      ) : (
        <ManagerWorkWithMeView />
      )}
    </div>
  );
}
