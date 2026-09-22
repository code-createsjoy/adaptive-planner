import React from 'react';
import { SharingVisibility } from '../types';
import { Lock, UserCheck, Users, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PrivacyBadgeSelectorProps {
  visibility: SharingVisibility;
  onChange: (v: SharingVisibility) => void;
  disabled?: boolean;
}

const VISIBILITY_CONFIG: Record<
  SharingVisibility,
  { label: string; icon: typeof Lock; badgeClass: string; desc: string }
> = {
  private: {
    label: 'Private',
    icon: Lock,
    badgeClass: 'bg-muted/80 text-muted-foreground border-border hover:bg-muted',
    desc: 'Visible only to you (hidden from manager & team)',
  },
  manager: {
    label: 'Manager',
    icon: UserCheck,
    badgeClass: 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/15',
    desc: 'Shared with your direct manager for task alignment',
  },
  team: {
    label: 'Team',
    icon: Users,
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15',
    desc: 'Shared openly with your entire team',
  },
};

export function PrivacyBadgeSelector({
  visibility,
  onChange,
  disabled = false,
}: PrivacyBadgeSelectorProps) {
  const current = VISIBILITY_CONFIG[visibility] || VISIBILITY_CONFIG.private;
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${current.badgeClass} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Icon className="size-3 shrink-0" />
        <span>{current.label}</span>
        {!disabled && <ChevronDown className="size-3 opacity-60 ml-0.5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-1.5 rounded-2xl bg-card/95 backdrop-blur-xl border-border shadow-xl">
        {(Object.keys(VISIBILITY_CONFIG) as SharingVisibility[]).map((key) => {
          const item = VISIBILITY_CONFIG[key];
          const ItemIcon = item.icon;
          const isSelected = visibility === key;

          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onChange(key)}
              className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted'
              }`}
            >
              <ItemIcon className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold leading-tight">{item.label}</p>
                  {isSelected && <span className="text-[10px] text-primary">✓</span>}
                </div>
                <p className="text-[11px] text-muted-foreground font-normal leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
