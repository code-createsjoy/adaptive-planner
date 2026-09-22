import React from 'react';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { UserCheck, ShieldCheck, ArrowRightLeft, Sparkles, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RoleSwitcherWidget() {
  const { activeRole, setActiveRole, passport } = useWorkModeStore();

  const isEmployee = activeRole === 'employee';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-3xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-3">
        <div className="relative size-10 rounded-2xl overflow-hidden ring-2 ring-primary/30 shrink-0">
          <img
            src={isEmployee ? passport.avatarUrl || '/thai-avatar.jpg' : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
            alt="Role Avatar"
            className="size-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background ${
              isEmployee ? 'bg-primary' : 'bg-emerald-500'
            }`}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1">
              {isEmployee ? <User className="size-3" /> : <Briefcase className="size-3" />}
              {isEmployee ? 'Employee View' : 'Manager View'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
              Live Demo Mode
            </span>
          </div>
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            {isEmployee ? `Thai (${passport.userRole})` : `Alex (Design & Engineering Lead)`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveRole(isEmployee ? 'manager' : 'employee')}
          className="rounded-xl border-primary/30 hover:bg-primary/10 hover:text-primary gap-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <ArrowRightLeft className="size-3.5 text-primary" />
          Switch to {isEmployee ? 'Manager View (Alex)' : 'Employee View (Thai)'}
        </Button>
      </div>
    </div>
  );
}
