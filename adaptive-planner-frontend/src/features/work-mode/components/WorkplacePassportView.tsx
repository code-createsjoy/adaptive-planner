import React, { useState } from 'react';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { PassportCategoryCard } from './PassportCategoryCard';
import { PrivateInsightBanner } from './PrivateInsightBanner';
import {
  Clock,
  MessageSquare,
  ListChecks,
  MessageCircle,
  Video,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PassportTab = 'focus' | 'communication' | 'tasks' | 'strengths';

export function WorkplacePassportView() {
  const [activeTab, setActiveTab] = useState<PassportTab>('focus');
  const {
    passport,
    updateCategoryData,
    setCategoryVisibility,
    resetToDemoPassport,
  } = useWorkModeStore();

  const toggleArrayItem = <
    K extends 'communication' | 'task' | 'feedback' | 'meeting' | 'contextSwitching' | 'strengths'
  >(
    category: K,
    field: string,
    currentList: string[],
    item: string
  ) => {
    const updated = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
    updateCategoryData(category, { [field]: updated } as any);
  };

  const tabs: { id: PassportTab; label: string; icon: typeof Zap; count?: number }[] = [
    { id: 'focus', label: 'Focus & Energy', icon: Zap },
    { id: 'communication', label: 'Communication & Meetings', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks & Feedback', icon: ListChecks },
    { id: 'strengths', label: 'My Strengths', icon: Sparkles },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner: Concise & Calm */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">
              Workplace Passport
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize your work style preferences. You decide who sees each card using the privacy badges.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetToDemoPassport();
            toast.success('Passport reset to default presentation state');
          }}
          className="rounded-xl border-border text-xs h-8 px-3 gap-1 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Reset Defaults
        </Button>
      </div>

      {/* Private AI Insights Banner */}
      <PrivateInsightBanner />

      {/* Clean low-stimulation Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/40 border border-border/70 backdrop-blur-md overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? 'text-primary' : 'opacity-60'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Focus & Energy Rhythms */}
      {activeTab === 'focus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Focus */}
          <PassportCategoryCard
            icon={Clock}
            title="Focus & Energy Rhythms"
            subtitle="Define peak deep-work windows, environment preferences, and meeting-free boundaries."
            visibility={passport.visibility.focus}
            onVisibilityChange={(v) => setCategoryVisibility('focus', v)}
            availableOptions={[
              'Noise-cancelling headphones',
              'Async chat only',
              'Quiet room',
              'No surprise calls',
              'Mornings preferred meeting-free',
              'Afternoons for collaborative sync',
            ]}
            selectedOptions={passport.focus.preferredEnvironment}
            onToggleOption={(opt) => {
              const current = passport.focus.preferredEnvironment || [];
              const next = current.includes(opt) ? current.filter((i) => i !== opt) : [...current, opt];
              updateCategoryData('focus', { preferredEnvironment: next });
            }}
            customNote={passport.focus.customNote}
            onNoteChange={(note) => updateCategoryData('focus', { customNote: note })}
            notePlaceholder="e.g. 9:00 AM – 11:00 AM is my strongest focus period for complex tasks."
            extraField={
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-background/50 border border-border/50 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Best Focus Time</label>
                  <Input
                    value={passport.focus.bestFocusTime}
                    onChange={(e) => updateCategoryData('focus', { bestFocusTime: e.target.value })}
                    placeholder="09:00 - 11:00"
                    className="h-8 rounded-lg bg-card border-border text-xs font-semibold mt-0.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">Deep Work Duration</label>
                  <Input
                    value={passport.focus.deepWorkDuration}
                    onChange={(e) => updateCategoryData('focus', { deepWorkDuration: e.target.value })}
                    placeholder="90 mins"
                    className="h-8 rounded-lg bg-card border-border text-xs font-semibold mt-0.5"
                  />
                </div>
              </div>
            }
          />

          {/* Context Switching */}
          <PassportCategoryCard
            icon={Layers}
            title="Context Switching & Transitions"
            subtitle="Protecting focus buffers and minimizing abrupt cognitive interruptions."
            visibility={passport.visibility.contextSwitching}
            onVisibilityChange={(v) => setCategoryVisibility('contextSwitching', v)}
            availableOptions={[
              'Prefer fewer task switches',
              'Need 10-15m transition buffer',
              'Batch similar tasks together',
              'Avoid sudden mid-day priority changes',
              'Async heads-up before urgent requests',
            ]}
            selectedOptions={passport.contextSwitching.preferences}
            onToggleOption={(opt) =>
              toggleArrayItem('contextSwitching', 'preferences', passport.contextSwitching.preferences, opt)
            }
            customNote={passport.contextSwitching.customNote}
            onNoteChange={(note) => updateCategoryData('contextSwitching', { customNote: note })}
            notePlaceholder="e.g. A short transition buffer between meetings and deep work helps reset focus."
          />
        </div>
      )}

      {/* Tab 2: Communication & Meetings */}
      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Communication */}
          <PassportCategoryCard
            icon={MessageSquare}
            title="Communication Preferences"
            subtitle="Preferred channels and formats for receiving important project instructions."
            visibility={passport.visibility.communication}
            onVisibilityChange={(v) => setCategoryVisibility('communication', v)}
            availableOptions={[
              'Written communication',
              'Async chat (Slack/Discord)',
              'Short bullet points',
              'Step-by-step instructions',
              'Visual diagrams / sketches',
              'Brief voice memo summary',
            ]}
            selectedOptions={[...passport.communication.channels, ...passport.communication.formats]}
            onToggleOption={(opt) => {
              const isFormat = [
                'Short bullet points',
                'Step-by-step instructions',
                'Visual diagrams / sketches',
              ].includes(opt);
              if (isFormat) {
                toggleArrayItem('communication', 'formats', passport.communication.formats, opt);
              } else {
                toggleArrayItem('communication', 'channels', passport.communication.channels, opt);
              }
            }}
            customNote={passport.communication.customNote}
            onNoteChange={(note) => updateCategoryData('communication', { customNote: note })}
            notePlaceholder="e.g. For important tasks, written bullet points help me process calmly."
          />

          {/* Meetings */}
          <PassportCategoryCard
            icon={Video}
            title="Meeting & Discussion Boundaries"
            subtitle="Preferences for pre-meeting context, post-meeting summaries, and camera comfort."
            visibility={passport.visibility.meeting}
            onVisibilityChange={(v) => setCategoryVisibility('meeting', v)}
            availableOptions={[
              'Agenda before meeting',
              'Written notes after meeting',
              'Camera optional',
              'Short meetings (< 30m)',
              'Processing time before answering',
              'Avoid back-to-back meetings',
            ]}
            selectedOptions={passport.meeting.preferences}
            onToggleOption={(opt) =>
              toggleArrayItem('meeting', 'preferences', passport.meeting.preferences, opt)
            }
            customNote={passport.meeting.customNote}
            onNoteChange={(note) => updateCategoryData('meeting', { customNote: note })}
            notePlaceholder="e.g. Having an agenda bullet beforehand allows me to prep thoughts calmly."
          />
        </div>
      )}

      {/* Tab 3: Tasks & Feedback */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Task Preferences */}
          <PassportCategoryCard
            icon={ListChecks}
            title="Task & Execution Style"
            subtitle="How tasks should be structured to support executive function and reduce overwhelm."
            visibility={passport.visibility.task}
            onVisibilityChange={(v) => setCategoryVisibility('task', v)}
            availableOptions={[
              'One priority at a time',
              'Break large tasks into smaller steps',
              'Clear deadline',
              'Clear expected output',
              'Visual task progress',
              'Checklist format',
              'Time-blocking',
              'Flexible pacing',
            ]}
            selectedOptions={passport.task.preferences}
            onToggleOption={(opt) => toggleArrayItem('task', 'preferences', passport.task.preferences, opt)}
            customNote={passport.task.customNote}
            onNoteChange={(note) => updateCategoryData('task', { customNote: note })}
            notePlaceholder="e.g. Large tasks work much better when broken into clear micro-milestones."
          />

          {/* Feedback */}
          <PassportCategoryCard
            icon={MessageCircle}
            title="Feedback & Review Style"
            subtitle="Constructive feedback channels that encourage growth without triggering defensiveness."
            visibility={passport.visibility.feedback}
            onVisibilityChange={(v) => setCategoryVisibility('feedback', v)}
            availableOptions={[
              'Private feedback',
              'Direct & actionable',
              'Specific examples',
              'Written notes first',
              'Include concrete next steps',
              'Allow processing time before discussion',
            ]}
            selectedOptions={passport.feedback.preferences}
            onToggleOption={(opt) =>
              toggleArrayItem('feedback', 'preferences', passport.feedback.preferences, opt)
            }
            customNote={passport.feedback.customNote}
            onNoteChange={(note) => updateCategoryData('feedback', { customNote: note })}
            notePlaceholder="e.g. I prefer feedback that clearly explains the issue with a concrete example."
          />
        </div>
      )}

      {/* Tab 4: My Strengths */}
      {activeTab === 'strengths' && (
        <div className="animate-in fade-in duration-200">
          <PassportCategoryCard
            icon={Sparkles}
            title="Core Cognitive Strengths"
            subtitle="Highlighting your greatest natural superpowers in problem solving, focus, and innovation."
            visibility={passport.visibility.strengths}
            onVisibilityChange={(v) => setCategoryVisibility('strengths', v)}
            availableOptions={[
              'Deep focus & flow',
              'Pattern recognition',
              'Creative problem solving',
              'Detail-oriented architecture',
              'Structured execution',
              'Thorough research',
              'Technical depth',
              'Visual thinking & system mapping',
              'Hyperfocus on hard challenges',
            ]}
            selectedOptions={passport.strengths.strengths}
            onToggleOption={(opt) => toggleArrayItem('strengths', 'strengths', passport.strengths.strengths, opt)}
            customNote={passport.strengths.customNote}
            onNoteChange={(note) => updateCategoryData('strengths', { customNote: note })}
            notePlaceholder="e.g. Excels at untangling complex product flows and deep technical architecture."
          />
        </div>
      )}
    </div>
  );
}
