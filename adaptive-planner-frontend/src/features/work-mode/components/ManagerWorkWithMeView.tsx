import React, { useState } from 'react';
import { useWorkModeStore } from '../store/useWorkModeStore';
import { TaskTranslationModal } from './TaskTranslationModal';
import { AdaptedTaskCard } from './AdaptedTaskCard';
import {
  UserCheck,
  Sparkles,
  ListChecks,
  MessageSquare,
  Clock,
  MessageCircle,
  Layers,
  Bot,
  Plus,
  ShieldCheck,
  EyeOff,
  CheckCircle2,
  Zap,
  Check,
  X,
  Target,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ManagerTab = 'ai-brief' | 'assigning' | 'focus-meetings' | 'strengths-feedback' | 'tasks';

export function ManagerWorkWithMeView() {
  const [activeTab, setActiveTab] = useState<ManagerTab>('ai-brief');
  const { passport, translatedTasks, suggestedInsights } = useWorkModeStore();
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

  const approvedInsights = suggestedInsights.filter((i) => i.status === 'approved');

  // Check which categories are shared (manager or team)
  const isFocusShared = passport.visibility.focus !== 'private';
  const isCommShared = passport.visibility.communication !== 'private';
  const isTaskShared = passport.visibility.task !== 'private';
  const isFeedbackShared = passport.visibility.feedback !== 'private';
  const isMeetingShared = passport.visibility.meeting !== 'private';
  const isSwitchingShared = passport.visibility.contextSwitching !== 'private';
  const isStrengthsShared = passport.visibility.strengths !== 'private';

  const tabs: { id: ManagerTab; label: string; icon: typeof Zap; count?: number }[] = [
    { id: 'ai-brief', label: 'AI Executive Brief', icon: Sparkles },
    { id: 'assigning', label: 'Assigning & Communication', icon: ListChecks },
    { id: 'focus-meetings', label: 'Focus & Meetings', icon: Clock },
    { id: 'strengths-feedback', label: 'Strengths & Feedback', icon: Lightbulb },
    { id: 'tasks', label: `Adapted Tasks (${translatedTasks.length})`, icon: Bot, count: translatedTasks.length },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Manager Guide Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl overflow-hidden ring-2 ring-primary/30 shrink-0">
            <img
              src={passport.avatarUrl || '/thai-avatar.jpg'}
              alt={passport.userName}
              className="size-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="size-3" /> Manager Guide
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Updated {passport.lastUpdated}
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground">
              How to Work with {passport.userName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Synthesized by Modo AI based on {passport.userName}'s approved Work Mode profile.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsTranslateModalOpen(true)}
          className="rounded-2xl bg-primary text-primary-foreground font-bold text-xs h-9 px-4 gap-2 shadow-xs shrink-0 hover:bg-primary/90 cursor-pointer"
        >
          <Bot className="size-4" />
          Assign & Translate Task
        </Button>
      </div>

      {/* Approved AI Insights Display (Only shown after employee approval) */}
      {approvedInsights.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 animate-in fade-in">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                AI-Verified Working Pattern
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                ✓ Approved by {passport.userName}
              </span>
            </div>
            {approvedInsights.map((ins) => (
              <p key={ins.id} className="text-xs text-foreground font-medium leading-relaxed mt-0.5">
                {ins.insightText}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Low-stimulation Tab Navigation */}
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
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: AI Executive Brief (30-second manager summary) */}
      {activeTab === 'ai-brief' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Executive Summary Card */}
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/70 to-primary/5 p-5 backdrop-blur-md shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
              <Bot className="size-4" />
              <span>Modo AI Executive Synthesis (30-Second Brief)</span>
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              <strong>{passport.userName}</strong> is a high-focus analytical contributor who delivers exceptional depth when tasks have <strong>clear written micro-milestones</strong> and protected morning focus blocks (<strong>{passport.focus.bestFocusTime || '9:00 - 11:00 AM'}</strong>). To maximize output and minimize cognitive friction, avoid sudden mid-day priority shifts and assign complex architecture via structured written briefs.
            </p>
          </div>

          {/* DOs & DON'Ts Cheatsheet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DOs */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                <Check className="size-4" />
                <span>Best Collaboration Practices (DOs)</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span><strong>Break tasks into 3–5 milestones:</strong> Provide a clear expected tangible output (e.g. 8-10 slides, specific Figma mockup).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span><strong>Send written bullet points:</strong> Use chat/email for important task parameters rather than long verbal meetings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span><strong>Protect {passport.focus.bestFocusTime || '9:00 - 11:00 AM'}:</strong> Keep mornings free of non-urgent sync calls.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span><strong>Deliver feedback privately:</strong> Include specific examples and clear next actionable steps.</span>
                </li>
              </ul>
            </div>

            {/* DON'Ts */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
                <X className="size-4" />
                <span>What to Avoid (DON'Ts)</span>
              </div>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">✗</span>
                  <span><strong>Don't assign open-ended vague goals:</strong> Avoid requests like "Just take a look at competitor research" without output criteria.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">✗</span>
                  <span><strong>Avoid sudden task switching:</strong> Changing priorities mid-afternoon causes high context-switching friction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">✗</span>
                  <span><strong>Avoid back-to-back meetings:</strong> Allow a 10–15 minute transition buffer between collaborative syncs and deep work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold mt-0.5">✗</span>
                  <span><strong>Don't give public impromptu feedback:</strong> Private written review leads to the best receptivity and action.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Optimal Task Matchmaker */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-5 backdrop-blur-md space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
              <Target className="size-4" />
              <span>Optimal Project & Task Assignments for {passport.userName}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Complex System Architecture',
                'Deep-dive Research & Synthesis',
                'Untangling Messy Product Workflows',
                'Detail-oriented Technical Execution',
                'Pattern Recognition & Benchmarking',
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
                >
                  ⚡ {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assigning & Communication */}
      {activeTab === 'assigning' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Best ways to assign work */}
          {isTaskShared ? (
            <div className="rounded-3xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <ListChecks className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Best Ways to Assign Work</h3>
              </div>
              <div className="space-y-1.5">
                {passport.task.preferences.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              {passport.task.customNote && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{passport.task.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Task Preferences" />
          )}

          {/* Communication Guide */}
          {isCommShared ? (
            <div className="rounded-3xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <MessageSquare className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Communication Preferences</h3>
              </div>
              <div className="space-y-1.5">
                {[...passport.communication.channels, ...passport.communication.formats].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              {passport.communication.customNote && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{passport.communication.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Communication Preferences" />
          )}
        </div>
      )}

      {/* Tab 3: Focus & Meetings */}
      {activeTab === 'focus-meetings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Focus */}
          {isFocusShared ? (
            <div className="rounded-3xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Clock className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Peak Focus Windows</h3>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 text-xs">
                <p className="font-bold text-primary">
                  Strongest Focus Window: {passport.focus.bestFocusTime || '09:00 - 11:00'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Avoid non-urgent meetings or sudden context shifts during this block.
                </p>
              </div>
              {passport.focus.preferredEnvironment.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase">
                    Ideal Environment
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {passport.focus.preferredEnvironment.map((e) => (
                      <span
                        key={e}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-card border border-border/70 text-foreground"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {passport.focus.customNote && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{passport.focus.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Focus Preferences" />
          )}

          {/* Meetings & Context Switching */}
          {isMeetingShared || isSwitchingShared ? (
            <div className="rounded-3xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Layers className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Meeting & Transition Rules</h3>
              </div>
              <div className="space-y-1.5 text-xs text-foreground">
                {isMeetingShared &&
                  passport.meeting.preferences.map((p) => (
                    <div key={p} className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                {isSwitchingShared &&
                  passport.contextSwitching.preferences.map((p) => (
                    <div key={p} className="flex items-center gap-2 font-medium text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{p}</span>
                    </div>
                  ))}
              </div>
              {passport.meeting.customNote && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{passport.meeting.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Meeting Preferences" />
          )}
        </div>
      )}

      {/* Tab 4: Strengths & Feedback */}
      {activeTab === 'strengths-feedback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Cognitive Strengths */}
          {isStrengthsShared ? (
            <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-primary/5 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/15 border border-primary/25">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Key Cognitive Strengths</h3>
                  <p className="text-[11px] text-muted-foreground">Where {passport.userName} excels most</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {passport.strengths.strengths.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-xl bg-card border border-primary/25 text-xs font-bold text-primary shadow-xs"
                  >
                    ⭐ {s}
                  </span>
                ))}
              </div>
              {passport.strengths.customNote && (
                <p className="text-xs text-foreground/90 font-medium bg-background/60 p-2.5 rounded-2xl border border-border/60">
                  "{passport.strengths.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Cognitive Strengths" />
          )}

          {/* Feedback Delivery */}
          {isFeedbackShared ? (
            <div className="rounded-3xl border border-border/80 bg-card/50 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <MessageCircle className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Feedback & Review Style</h3>
              </div>
              <div className="space-y-1.5">
                {passport.feedback.preferences.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              {passport.feedback.customNote && (
                <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{passport.feedback.customNote}"
                </p>
              )}
            </div>
          ) : (
            <PrivateCardPlaceholder title="Feedback Preferences" />
          )}
        </div>
      )}

      {/* Tab 5: Adapted Tasks List */}
      {activeTab === 'tasks' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Review and manage tasks translated by Modo AI for {passport.userName}.
            </p>
            <Button
              size="sm"
              onClick={() => setIsTranslateModalOpen(true)}
              className="rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold h-8 px-3 gap-1.5 border border-primary/30"
            >
              <Plus className="size-3.5" />
              Translate New Task
            </Button>
          </div>

          {translatedTasks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-3xl border border-border/60 bg-card/30 text-muted-foreground space-y-2">
              <Bot className="size-8 mx-auto opacity-40" />
              <p className="text-xs font-medium">No translated tasks yet.</p>
              <Button
                size="sm"
                onClick={() => setIsTranslateModalOpen(true)}
                className="rounded-xl text-xs"
              >
                Assign first task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {translatedTasks.map((task) => (
                <AdaptedTaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Translation Modal */}
      <TaskTranslationModal
        open={isTranslateModalOpen}
        onOpenChange={setIsTranslateModalOpen}
        assigneeName={passport.userName}
      />
    </div>
  );
}

function PrivateCardPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/60 bg-muted/20 p-5 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
      <EyeOff className="size-5 text-muted-foreground opacity-50" />
      <p className="text-xs font-bold text-muted-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground/70 max-w-xs">
        Marked as Private by employee. Only shared categories appear in the manager guide.
      </p>
    </div>
  );
}
