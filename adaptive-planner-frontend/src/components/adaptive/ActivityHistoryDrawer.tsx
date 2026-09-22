import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  History,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdaptationAction, TimeBlock } from "@/types/planner";

interface ActivityHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  adaptations: AdaptationAction[];
  onUndo: (actionId: number) => void;
  onViewConversation?: (conversationId: number) => void;
}

interface ParsedDiffItem {
  id: string;
  title: string;
  type: "added" | "moved" | "deferred" | "modified" | "unchanged";
  oldTime?: string;
  newTime?: string;
  note?: string;
}

export const ActivityHistoryDrawer: React.FC<ActivityHistoryDrawerProps> = ({
  isOpen,
  onClose,
  adaptations,
  onUndo,
  onViewConversation,
}) => {
  const [collapsedItems, setCollapsedItems] = useState<Record<number, boolean>>({});

  const toggleItemCollapse = (id: number) => {
    setCollapsedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  const calculateDiffs = (beforeJson?: string, afterJson?: string): ParsedDiffItem[] => {
    if (!beforeJson || !afterJson) return [];
    try {
      const before: TimeBlock[] = JSON.parse(beforeJson);
      const after: TimeBlock[] = JSON.parse(afterJson);

      const diffs: ParsedDiffItem[] = [];
      const beforeMap = new Map(before.map((b) => [b.id || b.title, b]));

      after.forEach((newBlock) => {
        const oldBlock = beforeMap.get(newBlock.id || newBlock.title);
        if (!oldBlock) {
          diffs.push({
            id: newBlock.id || `diff-${Date.now()}`,
            title: newBlock.title,
            type: "added",
            newTime: `${newBlock.startTime}–${newBlock.endTime}`,
            note: "Newly added block",
          });
        } else if (oldBlock.startTime !== newBlock.startTime || oldBlock.endTime !== newBlock.endTime) {
          diffs.push({
            id: newBlock.id,
            title: newBlock.title,
            type: "moved",
            oldTime: `${oldBlock.startTime}–${oldBlock.endTime}`,
            newTime: `${newBlock.startTime}–${newBlock.endTime}`,
            note: "Rescheduled time",
          });
        }
        beforeMap.delete(newBlock.id || newBlock.title);
      });

      beforeMap.forEach((missingBlock) => {
        diffs.push({
          id: missingBlock.id,
          title: missingBlock.title,
          type: "deferred",
          oldTime: `${missingBlock.startTime}–${missingBlock.endTime}`,
          note: "Moved to Inbox / Deferred",
        });
      });

      return diffs;
    } catch {
      return [];
    }
  };

  const parseReasons = (explanationJson?: string): string[] => {
    if (!explanationJson) return [];
    try {
      const exp = JSON.parse(explanationJson);
      if (Array.isArray(exp.reasons)) return exp.reasons;
      if (exp.whatWillHappen) return [exp.whatWillHappen];
      return [];
    } catch {
      return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Adaptation & Schedule History
              </h3>
              <p className="text-xs text-muted-foreground">
                Transparent AI decision log, diff previews, and undo support
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {adaptations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Layers className="h-10 w-10 mb-3 opacity-30 stroke-1" />
              <p className="text-sm font-medium">No schedule adaptations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                When you apply smart adaptive schedule changes from AI, decision records will appear here.
              </p>
            </div>
          ) : (
            adaptations.map((action) => {
              const diffs = calculateDiffs(action.beforeSnapshotJson, action.afterSnapshotJson);
              const reasons = parseReasons(action.explanationJson);
              const isUndone = action.status === "ROLLED_BACK" || action.status === "UNDONE";

              let formattedTime = "";
              try {
                formattedTime = format(parseISO(action.createdAt), "HH:mm, MMM dd yyyy", { locale: enUS });
              } catch {
                formattedTime = action.createdAt || "";
              }

              const isCollapsed = !!collapsedItems[action.id];

              return (
                <div
                  key={action.id}
                  className={`relative rounded-2xl border p-5 transition-all ${
                    isUndone
                      ? "border-border/40 bg-muted/20 opacity-75"
                      : "border-border/80 bg-card/60 shadow-sm hover:border-primary/40"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div
                      onClick={() => toggleItemCollapse(action.id)}
                      className="cursor-pointer select-none group flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formattedTime}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isUndone
                              ? "bg-muted text-muted-foreground"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isUndone ? "Undone" : "Applied"}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-foreground mt-1 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{action.scenarioTitle || action.reason || "Smart Schedule Adaptation"}</span>
                        {isCollapsed ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        ) : (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        )}
                      </h4>
                    </div>

                    {/* Actions: Undo & Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isUndone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUndo(action.id)}
                          className="h-8 gap-1.5 rounded-lg text-xs font-medium border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Undo</span>
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleItemCollapse(action.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title={isCollapsed ? "Expand details" : "Collapse details"}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      {/* Why AI made this decision */}
                      {reasons.length > 0 && (
                        <div className="mb-3.5 rounded-xl bg-muted/40 p-3 text-xs space-y-1.5 border border-border/30">
                          <p className="font-semibold text-foreground/90 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <span>Reasons for Adaptation (Why):</span>
                          </p>
                          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                            {reasons.map((r, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Before / After Diff Chips */}
                      {diffs.length > 0 && (
                        <div className="space-y-2 mb-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                            Change details:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {diffs.map((diff) => (
                              <div
                                key={diff.id}
                                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border ${
                                  diff.type === "added"
                                    ? "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300"
                                    : diff.type === "moved"
                                    ? "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300"
                                    : "bg-purple-500/5 border-purple-500/20 text-purple-700 dark:text-purple-300"
                                }`}
                              >
                                <span className="font-medium truncate mr-2">{diff.title}</span>
                                <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                                  {diff.oldTime && (
                                    <>
                                      <span className="line-through opacity-70">{diff.oldTime}</span>
                                      <ArrowRight className="h-3 w-3 opacity-60" />
                                    </>
                                  )}
                                  <span className="font-semibold">{diff.newTime || "Inbox"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Footer with Link to Conversation */}
                      {action.conversationId && onViewConversation && (
                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onViewConversation(action.conversationId!);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>View Conversation</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 p-4 bg-card/50 flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
