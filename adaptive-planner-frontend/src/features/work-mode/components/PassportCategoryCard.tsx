import React from 'react';
import { SharingVisibility } from '../types';
import { PrivacyBadgeSelector } from './PrivacyBadgeSelector';
import { LucideIcon, Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PassportCategoryCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  visibility: SharingVisibility;
  onVisibilityChange: (v: SharingVisibility) => void;
  availableOptions: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  customNote?: string;
  onNoteChange: (note: string) => void;
  notePlaceholder?: string;
  extraField?: React.ReactNode;
}

export function PassportCategoryCard({
  icon: Icon,
  title,
  subtitle,
  visibility,
  onVisibilityChange,
  availableOptions,
  selectedOptions,
  onToggleOption,
  customNote,
  onNoteChange,
  notePlaceholder = 'Add a custom note or concrete example...',
  extraField,
}: PassportCategoryCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-5 backdrop-blur-md shadow-xs space-y-4 hover:border-primary/30 transition-all">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Icon className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-normal">{subtitle}</p>
          </div>
        </div>

        {/* Individual Card Privacy Control */}
        <div className="shrink-0">
          <PrivacyBadgeSelector visibility={visibility} onChange={onVisibilityChange} />
        </div>
      </div>

      {/* Extra Field (e.g. Best Focus Time Selector) */}
      {extraField && <div className="pt-1">{extraField}</div>}

      {/* Chip Selectors */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          Preferences & Options
        </label>
        <div className="flex flex-wrap gap-1.5">
          {availableOptions.map((opt) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleOption(opt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs ring-1 ring-primary'
                    : 'bg-background/80 hover:bg-muted text-foreground border border-border/70 hover:border-border'
                }`}
              >
                {isSelected ? (
                  <Check className="size-3 text-primary-foreground" />
                ) : (
                  <Plus className="size-3 text-muted-foreground opacity-60" />
                )}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal Note / Concrete Example */}
      <div className="space-y-1 pt-1">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          Personal Guidance Note
        </label>
        <Input
          value={customNote || ''}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={notePlaceholder}
          className="h-9 rounded-xl bg-background/80 border-border/80 text-xs placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}
