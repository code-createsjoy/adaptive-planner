import React from 'react';
import { DEMO_PERSONAS, useP2PChatStore } from '../store/useP2PChatStore';
import { PersonaId } from '../types';
import { RefreshCw, ArrowRightLeft, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PersonaSwitcherWidget() {
  const { activeUserId, setActiveUserId, resetDemoData } = useP2PChatStore();
  const currentPersona = DEMO_PERSONAS[activeUserId] || DEMO_PERSONAS['user-thai'];

  const togglePersona = () => {
    const nextId: PersonaId = activeUserId === 'user-thai' ? 'user-minh' : 'user-thai';
    setActiveUserId(nextId);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-3">
        <div className="relative size-10 rounded-xl overflow-hidden ring-2 ring-primary/30 shrink-0">
          <img
            src={currentPersona.avatarUrl || '/thai-avatar.jpg'}
            alt={currentPersona.name}
            className="size-full object-cover"
          />
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary font-mono flex items-center gap-1">
              <UserCheck className="size-3" /> Active Persona
            </span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
              Demo Mode
            </span>
          </div>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {currentPersona.name}
            <span className="text-xs font-normal text-muted-foreground">({currentPersona.email})</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePersona}
          className="rounded-xl border-primary/30 hover:bg-primary/10 hover:text-primary gap-1.5 text-xs font-semibold shadow-xs"
        >
          <ArrowRightLeft className="size-3.5 text-primary" />
          Switch to {activeUserId === 'user-thai' ? 'Minh (Friend)' : 'Thai (You)'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetDemoData}
          title="Reset demo chat data"
          className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
