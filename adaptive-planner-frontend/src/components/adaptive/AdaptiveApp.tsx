"use client";

import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Coffee,
  Headphones,
  Lightbulb,
  ListChecks,
  Menu,
  MessageCircleQuestion,
  Mic,
  Play,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Trash2,
  Volume2,
  X,
  Zap,
  AlertTriangle,
  AlertCircle,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { usePlannerStore, getTodayDateString } from "@/store/usePlannerStore";
import {
  useTimeBlocksQuery,
  useCreateTimeBlockMutation,
  useDeleteTimeBlockMutation,
  useBatchApplyScenarioMutation,
  useParseIntentMutation,
  useRescheduleScenariosMutation,
  useBreakdownTaskMutation,
  useCheckHolidayQuery,
  usePauseAllRoutinesForDateMutation,
  useResumeAllRoutinesForDateMutation,
  useCancelRoutineForDateMutation,
  useRoutinesQuery,
} from "@/hooks/useTimeBlocks";
import { api } from "@/lib/api";
import { useRealTimeClock } from "@/hooks/useRealTimeClock";
import { calculateTimelineState, timeStringToMinutes, TimelineTemporalState } from "@/lib/temporal";
import { TimeBlock, DisruptionState, ScenarioOption, ExplanationDetails, RescheduleResponse } from "@/types/planner";
import { motion, AnimatePresence } from "framer-motion";
import { MonthCalendarView } from "./MonthCalendarView";
import { WeeklyRoutineModal } from "./WeeklyRoutineModal";
import { TomorrowInboxDrawer } from "./TomorrowInboxDrawer";
import { InterviewLab } from "@/components/interview/InterviewLab";
import avatarImage from "@/assets/thai-avatar.jpg";
import companionImage from "@/assets/adaptive-desk-companion.jpg";

// Gentle sensory-friendly audio chime generator (no harsh buzzer)
function playGentleChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz calming pitch
    osc.frequency.exponentialRampToValueAtTime(528, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // AudioContext not allowed before user gesture
  }
}

// ── Schedule Preview Panel: Diff Types & Utility ─────────────────────────────

type BlockChangeType = 'protected' | 'moved' | 'deferred' | 'new' | 'anchor';

interface BlockDiffItem {
  before?: TimeBlock;   // undefined for new urgent blocks (no before state)
  after?: TimeBlock;    // undefined for deferred-to-inbox blocks
  changeType: BlockChangeType;
  reasons: string[];    // 1–3 human-readable explanation bullets
}

/**
 * Pure O(n) diff utility. Compares before/after TimeBlock arrays and
 * returns only changed blocks + up to 2 unchanged adjacent anchors for context.
 * Match strategy: id (preferred) → title+startTime compound key (fallback).
 */
function computeDiff(before: TimeBlock[], after: TimeBlock[]): BlockDiffItem[] {
  const results: BlockDiffItem[] = [];

  const toMinutes = (t: string) => {
    const parts = t.split(':').map(Number);
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  };

  // Build lookup maps
  const beforeById = new Map(before.map(b => [b.id, b]));
  const afterById = new Map(after.map(b => [b.id, b]));
  const beforeByKey = new Map(before.map(b => [`${b.title}|${b.startTime}`, b]));
  const afterByKey = new Map(after.map(b => [`${b.title}|${b.startTime}`, b]));

  const matchAfter = (b: TimeBlock): TimeBlock | undefined =>
    afterById.get(b.id) ?? afterByKey.get(`${b.title}|${b.startTime}`);
  const matchBefore = (a: TimeBlock): TimeBlock | undefined =>
    beforeById.get(a.id) ?? beforeByKey.get(`${a.title}|${a.startTime}`);

  const generateReasons = (beforeBlock?: TimeBlock, afterBlock?: TimeBlock, changeType?: BlockChangeType): string[] => {
    const reasons: string[] = [];
    const block = beforeBlock || afterBlock;
    if (!block) return reasons;

    if (changeType === 'new') {
      reasons.push('Added as urgent event');
      return reasons;
    }
    if (changeType === 'protected') {
      if (block.category === 'rest' || block.energyLevel === 'low') reasons.push('Rest block — protected from disruption');
      else reasons.push('Marked as protected — not moved');
      return reasons;
    }

    // For moved/deferred
    const priority = (block as any).priority as string | undefined;
    const deadline = (block as any).deadline as string | undefined;
    const isMovable = (block as any).isMovable as boolean | undefined;
    const energy = block.energyLevel;

    if (priority === 'PROTECTED') reasons.push('Priority: Protected — cannot be moved');
    else if (priority === 'HIGH') reasons.push('High priority task preserved');
    else if (priority === 'FLEXIBLE' || isMovable === true) reasons.push('Marked as flexible — safe to reschedule');
    else if (isMovable === false) reasons.push('Marked as immovable — kept in place');

    if (deadline) {
      const dl = new Date(deadline);
      const now = new Date();
      const diffDays = Math.ceil((dl.getTime() - now.getTime()) / 86400000);
      if (diffDays <= 1) reasons.push('Deadline is today/tomorrow — high urgency');
      else if (diffDays <= 3) reasons.push(`Deadline in ${diffDays} days — moved to preserve flow`);
    }

    if (energy === 'low') reasons.push('Low-energy task — good candidate for deferral');
    else if (energy === 'high') reasons.push('High-focus task — kept to a calm slot');

    if (changeType === 'deferred' && reasons.length === 0) reasons.push('Moved to Tomorrow Inbox to clear space');
    if (changeType === 'moved' && afterBlock) {
      const fromMin = beforeBlock ? toMinutes(beforeBlock.startTime) : 0;
      const toMin = toMinutes(afterBlock.startTime);
      if (toMin > fromMin) reasons.push('Shifted later to make room for urgent event');
      else reasons.push('Shifted earlier to fit within day boundary');
    }

    return reasons.slice(0, 3);
  };

  const processedAfterIds = new Set<string>();

  // Walk before-blocks: find what changed
  const sortedBefore = [...before].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  for (const b of sortedBefore) {
    const a = matchAfter(b);
    if (!a) {
      // Deferred (removed from after)
      results.push({ before: b, changeType: 'deferred', reasons: generateReasons(b, undefined, 'deferred') });
    } else {
      processedAfterIds.add(a.id);
      const sameTime = a.startTime === b.startTime && a.endTime === b.endTime;
      const sameDate = !a.date || !b.date || a.date === b.date;
      if (sameTime && sameDate) {
        // Unchanged — candidate for anchor
        results.push({ before: b, after: a, changeType: 'anchor', reasons: [] });
      } else {
        // Moved
        results.push({ before: b, after: a, changeType: 'moved', reasons: generateReasons(b, a, 'moved') });
      }
    }
  }

  // Find new blocks (in after but not in before)
  for (const a of after) {
    if (!processedAfterIds.has(a.id) && !matchBefore(a)) {
      results.push({ after: a, changeType: 'new', reasons: generateReasons(undefined, a, 'new') });
    }
  }

  // Promote protected anchors adjacent to changed blocks; trim remaining anchors
  const changedIndices = new Set(results.map((r, i) => r.changeType !== 'anchor' ? i : -1).filter(i => i >= 0));
  let anchorCount = 0;
  const filtered = results.filter((item, i) => {
    if (item.changeType !== 'anchor') return true;
    const isAdjacent = changedIndices.has(i - 1) || changedIndices.has(i + 1);
    if (isAdjacent && anchorCount < 2) { anchorCount++; return true; }
    return false;
  });

  // Sort final list by startTime of whichever state is available
  filtered.sort((a, b) => {
    const aTime = toMinutes((a.before || a.after)?.startTime ?? '00:00');
    const bTime = toMinutes((b.before || b.after)?.startTime ?? '00:00');
    return aTime - bTime;
  });

  return filtered;
}

// ─────────────────────────────────────────────────────────────────────────────

const navigation = [
  { id: "today", label: "Day Timeline", icon: Clock3 },
  { id: "calendar", label: "Monthly Calendar", icon: CalendarDays },
  { id: "planner", label: "AI Planner", icon: ListChecks },
  { id: "interview", label: "Interview Lab", icon: Video },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

type ViewId = (typeof navigation)[number]["id"] | "profile" | "preferences" | "companion";
type PlannerMessage = { role: "user" | "assistant"; text: string };

const suggestions = [
  "I want to have coffee with my friend at 7 PM.",
  "Move my gym session to tomorrow.",
  "My meeting was extended by 1 hour.",
];

// Deterministic Local Rescheduling Engine with Smart Default & Bedtime Defense
function generateLocalAdaptiveScenarios(
  urgentBlock: Omit<TimeBlock, 'id'>,
  targetBlocks: TimeBlock[],
  conflicts: TimeBlock[],
  targetDate: string
): { recommended: ScenarioOption; alternatives: ScenarioOption[]; explanation: ExplanationDetails } {
  const toMin = (t?: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const toTimeStr = (min: number) => {
    const h = String(Math.floor(min / 60) % 24).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
  };

  const urgentStart = toMin(urgentBlock.startTime);
  const urgentEnd = toMin(urgentBlock.endTime);
  const bedtimeCutoffMin = 22 * 60 + 30; // 22:30 hard cutoff (Sleep 23:00-07:00 is PROTECTED)

  const urgentBlockWithId: TimeBlock = {
    ...urgentBlock,
    id: `urgent-${Date.now()}`,
    date: targetDate,
    sourceType: 'AI_ADDED',
    priority: 'HIGH',
    isMovable: false,
    status: 'ACTIVE',
  };

  const sortedBlocks = [...targetBlocks]
    .filter((b) => b.overrideType !== 'CANCELLED' && b.status !== 'DEFERRED')
    .sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  const recommendedBlocks: TimeBlock[] = [];
  const reasons: string[] = [];
  const shiftedTitles: string[] = [];
  const deferredTitles: string[] = [];

  let rippleCursor = urgentEnd + 15; // 15m transition buffer

  for (const b of sortedBlocks) {
    const bStart = toMin(b.startTime);
    const bEnd = toMin(b.endTime);
    const bDur = Math.max(30, bEnd - bStart);

    // If block ends before urgent event starts, untouched
    if (bEnd <= urgentStart) {
      recommendedBlocks.push(b);
      continue;
    }

    const isProtected =
      b.priority === 'PROTECTED' ||
      b.priority === 'Protected' ||
      b.isMovable === false ||
      (b.category === 'rest' && b.title.toLowerCase().includes('ngủ'));

    const hasTodayDeadline = Boolean(b.deadline && b.deadline.trim() !== '');

    if (isProtected) {
      recommendedBlocks.push(b);
      reasons.push(`Bảo vệ tuyệt đối khung giờ cố định/nghỉ ngơi: ${b.title}`);
      continue;
    }

    const newStartMin = Math.max(bStart, rippleCursor);
    const newEndMin = newStartMin + bDur;

    // Check bedtime violation
    if (newEndMin > bedtimeCutoffMin && !hasTodayDeadline) {
      deferredTitles.push(b.title);
      continue;
    }

    const newBStart = toTimeStr(newStartMin);
    const newBEnd = toTimeStr(newEndMin);
    rippleCursor = newEndMin + 15; // 15m buffer

    shiftedTitles.push(`${b.title} (${newBStart}–${newBEnd})`);

    recommendedBlocks.push({
      ...b,
      startTime: newBStart,
      endTime: newBEnd,
      date: targetDate,
      sourceType: 'AI_RESCHEDULED',
      status: 'ACTIVE',
    });
  }

  recommendedBlocks.push(urgentBlockWithId);
  recommendedBlocks.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  reasons.push("Bảo vệ tuyệt đối khung giờ ngủ (23:00–07:00) và các block Protected.");
  if (shiftedTitles.length > 0) {
    reasons.push(`Tự động dời ${shiftedTitles.join(', ')} kèm 15 phút đệm chuyển tiếp.`);
  }
  if (deferredTitles.length > 0) {
    reasons.push(`Hoãn ${deferredTitles.join(', ')} sang Tomorrow Inbox để không làm việc đêm muộn.`);
  }

  const explanation: ExplanationDetails = {
    whatChanged: `Sự kiện ${urgentBlock.title} (${urgentBlock.startTime}–${urgentBlock.endTime}) gây trùng lặp lịch tối.`,
    whatWillHappen: shiftedTitles.length > 0
      ? `Dời các hoạt động linh hoạt sang slot sau ${urgentBlock.endTime} và chèn 15m đệm.`
      : `Tối ưu hóa lịch trình và bảo toàn giờ nghỉ ngơi.`,
    reasons,
    confidenceLevel: 0.96,
  };

  const recommended: ScenarioOption = {
    id: 'recommended',
    title: '✦ Điều chỉnh thông minh (Khuyến nghị)',
    description: `Phương án cân bằng nhất: Xếp ${urgentBlock.title}, trượt các task liên quan và giữ nguyên giờ nghỉ ngơi.`,
    energyImpact: 'medium',
    highlightText: 'Bảo toàn năng lượng và hạn chót mà không gây quá tải não bộ.',
    tag: 'Optimized',
    blocks: recommendedBlocks,
  };

  // Alt 1: Cascade Shift All
  const altCascadeBlocks: TimeBlock[] = [];
  let altRipple = urgentEnd + 15;
  for (const b of sortedBlocks) {
    const bStart = toMin(b.startTime);
    const bEnd = toMin(b.endTime);
    const bDur = Math.max(30, bEnd - bStart);

    if (bEnd <= urgentStart) {
      altCascadeBlocks.push(b);
      continue;
    }

    const newBStart = toTimeStr(altRipple);
    const newBEndMin = altRipple + bDur;
    const newBEnd = toTimeStr(newBEndMin);
    altRipple = newBEndMin + 15;

    altCascadeBlocks.push({
      ...b,
      startTime: newBStart,
      endTime: newBEnd,
      date: targetDate,
      sourceType: 'AI_RESCHEDULED',
    });
  }
  altCascadeBlocks.push(urgentBlockWithId);
  altCascadeBlocks.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  const altCascade: ScenarioOption = {
    id: 'alt_cascade',
    title: 'Dời toàn bộ về sau (Cascade Shift)',
    description: `Trượt toàn bộ công việc bị trùng sang khung giờ muộn hơn kèm 15 phút đệm.`,
    energyImpact: 'medium',
    highlightText: 'Giữ trọn vẹn 100% công việc trong ngày.',
    tag: 'Alternative',
    blocks: altCascadeBlocks,
  };

  // Alt 2: Zero-Guilt / Defer to tomorrow
  const altDeferBlocks = targetBlocks.filter((b) => {
    if (b.overrideType === 'CANCELLED' || b.status === 'DEFERRED') return false;
    const bStart = toMin(b.startTime);
    const bEnd = toMin(b.endTime);
    return Math.max(urgentStart, bStart) >= Math.min(urgentEnd, bEnd);
  });
  altDeferBlocks.push(urgentBlockWithId);
  altDeferBlocks.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  const altDefer: ScenarioOption = {
    id: 'alt_defer',
    title: 'Zero-Guilt / Tạm hoãn sang ngày mai',
    description: `Tạm hoãn các hoạt động bị trùng sang Tomorrow Inbox để dồn tâm trí cho ${urgentBlock.title}.`,
    energyImpact: 'low',
    highlightText: 'Bảo vệ năng lượng nhận thức, không cảm thấy có lỗi.',
    tag: 'Low-Demand',
    blocks: altDeferBlocks,
  };

  return {
    recommended,
    alternatives: [altCascade, altDefer],
    explanation,
  };
}

export function AdaptiveApp() {
  const [view, setView] = useState<ViewId>("today");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [focusStarted, setFocusStarted] = useState(false);
  const [plannerMessages, setPlannerMessages] = useState<PlannerMessage[]>([
    {
      role: "assistant",
      text: "Xin chào! Mình là Adaptive Planner AI. Bạn có thể gõ siêu ngắn bất kỳ ý định nào (ví dụ: `mai 7h cafe 2h`, `8h java`, `t2 hop 9h`, `ngày 21 tôi có cuộc họp đột xuất từ 6h tới 8h tối`), AI sẽ phân tích và xếp lịch thông minh cho bạn.",
    },
  ]);
  const [plannerThinking, setPlannerThinking] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<Omit<TimeBlock, 'id'> | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<TimeBlock[]>([]);
  const [pendingScenarios, setPendingScenarios] = useState<ScenarioOption[]>([]);
  const [pendingRecommendedScenario, setPendingRecommendedScenario] = useState<ScenarioOption | null>(null);
  const [pendingAlternativeScenarios, setPendingAlternativeScenarios] = useState<ScenarioOption[]>([]);
  const [pendingExplanation, setPendingExplanation] = useState<ExplanationDetails | null>(null);
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    actionId: number | null;
    message: string;
    targetDate?: string;
  }>({ visible: false, actionId: null, message: "" });
  const [inboxBlocks, setInboxBlocks] = useState<TimeBlock[]>([]);
  const [undoTimeoutId, setUndoTimeoutId] = useState<number | null>(null);
  const [activityAdded, setActivityAdded] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [importantOn, setImportantOn] = useState(true);
  const [transitionOn, setTransitionOn] = useState(true);
  const [allowSuggestions, setAllowSuggestions] = useState(true);
  const [askFirst, setAskFirst] = useState(true);
  const [voiceTesting, setVoiceTesting] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);

  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const setSelectedDate = usePlannerStore((state) => state.setSelectedDate);
  const isRoutineModalOpen = usePlannerStore((state) => state.isRoutineModalOpen);
  const setIsRoutineModalOpen = usePlannerStore((state) => state.setIsRoutineModalOpen);
  const timeBlocks = usePlannerStore((state) => state.timeBlocks);
  const disruptionState = usePlannerStore((state) => state.disruptionState);
  const selectedScenarioIndex = usePlannerStore((state) => state.selectedScenarioIndex);
  const scenarios = usePlannerStore((state) => state.scenarios);
  const setDisruptionState = usePlannerStore((state) => state.setDisruptionState);
  const setSelectedScenarioIndex = usePlannerStore((state) => state.setSelectedScenarioIndex);
  const applyScenario = usePlannerStore((state) => state.applyScenario);
  const resetDisruption = usePlannerStore((state) => state.resetDisruption);
  const toggleComplete = usePlannerStore((state) => state.toggleComplete);
  const toggleMicroStep = usePlannerStore((state) => state.toggleMicroStep);

  // TanStack Query synchronization with Backend API & Groq AI Gateway
  const { refetch: refetchBlocks } = useTimeBlocksQuery(selectedDate);
  const { data: holidayData } = useCheckHolidayQuery(selectedDate);
  const createBlockMutation = useCreateTimeBlockMutation();
  const deleteBlockMutation = useDeleteTimeBlockMutation();
  const batchApplyMutation = useBatchApplyScenarioMutation();
  const parseIntentMutation = useParseIntentMutation();
  const rescheduleMutation = useRescheduleScenariosMutation();
  const breakdownMutation = useBreakdownTaskMutation();
  const pauseRoutineMutation = usePauseAllRoutinesForDateMutation();
  const resumeRoutineMutation = useResumeAllRoutinesForDateMutation();
  const cancelRoutineMutation = useCancelRoutineForDateMutation();

  const loadInboxBlocks = async () => {
    try {
      const data = await api.getInboxBlocks(selectedDate);
      setInboxBlocks(data || []);
    } catch {
      setInboxBlocks([]);
    }
  };

  useEffect(() => {
    loadInboxBlocks();
  }, [selectedDate]);

  // Real-time Clock & Temporal State Engine
  const { now, timeFormatted, dateFormatted, minuteTimestamp } = useRealTimeClock();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tmDate = new Date();
  tmDate.setDate(tmDate.getDate() + 1);
  const tomorrowStr = format(tmDate, 'yyyy-MM-dd');

  const formatDateForDisplay = (dStr?: string) => {
    if (!dStr) return "";
    if (dStr === todayStr) return `Hôm nay (${format(new Date(), 'dd/MM')})`;
    if (dStr === tomorrowStr) return `Ngày mai (${format(tmDate, 'dd/MM')})`;
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const timelineState = useMemo(() => {
    return calculateTimelineState(timeBlocks, now);
  }, [timeBlocks, minuteTimestamp, now]);

  const navigate = (next: ViewId) => {
    setView(next);
    setMobileOpen(false);
  };

  const handlePlannerSubmit = async ({ text }: { text: string }) => {
    const cleanText = text.trim();
    if (!cleanText || plannerThinking) return;
    setPlannerMessages((current) => [...current, { role: "user", text: cleanText }]);
    setPlannerThinking(true);

    try {
      // Direct call to Spring Boot Groq AI Gateway / Fallback NLP
      const parsedBlock = await parseIntentMutation.mutateAsync(cleanText);
      setPlannerThinking(false);

      if (parsedBlock && parsedBlock.title) {
        const targetDate = parsedBlock.date || selectedDate;
        const newBlock: Omit<TimeBlock, 'id'> = {
          title: parsedBlock.title,
          detail: parsedBlock.detail || "Scheduled via AI Planner",
          startTime: parsedBlock.startTime || "19:00",
          endTime: parsedBlock.endTime || "20:30",
          category: (parsedBlock.category as any) || "work",
          energyLevel: (parsedBlock.energyLevel as any) || "medium",
          priority: (parsedBlock.priority as any) || "Normal",
          reminderMinutesBefore: parsedBlock.reminderMinutesBefore || [30, 10, 0],
          isCompleted: false,
          isBufferBlock: parsedBlock.isBufferBlock || false,
          microSteps: parsedBlock.microSteps || [
            { id: "p-1", text: "Chuẩn bị công việc và không gian", done: false },
            { id: "p-2", text: "Bắt đầu từng bước nhỏ", done: false },
          ],
          date: targetDate,
        };

        setPendingActivity(newBlock);

        // Fetch day's existing blocks to check for schedule overlaps / conflicts
        let targetDayBlocks: TimeBlock[] = [];
        try {
          targetDayBlocks = await api.getTimeBlocks(targetDate);
        } catch {
          targetDayBlocks = timeBlocks;
        }

        const toMin = (t?: string) => {
          if (!t) return 0;
          const [h, m] = t.split(':').map(Number);
          return (h || 0) * 60 + (m || 0);
        };

        const newStart = toMin(newBlock.startTime);
        const newEnd = toMin(newBlock.endTime);

        const conflicts = (targetDayBlocks || []).filter((b) => {
          if (b.overrideType === 'CANCELLED') return false;
          const bStart = toMin(b.startTime);
          const bEnd = toMin(b.endTime);
          return Math.max(newStart, bStart) < Math.min(newEnd, bEnd);
        });

        if (conflicts.length > 0) {
          setPendingConflicts(conflicts);
          const localResult = generateLocalAdaptiveScenarios(newBlock, targetDayBlocks, conflicts, targetDate);
          setPendingRecommendedScenario(localResult.recommended);
          setPendingAlternativeScenarios(localResult.alternatives);
          setPendingExplanation(localResult.explanation);
          setPendingScenarios([localResult.recommended, ...localResult.alternatives]);

          try {
            const res = await rescheduleMutation.mutateAsync({
              urgentEvent: newBlock.title,
              targetTime: newBlock.startTime,
              durationMinutes: parsedBlock.durationMinutes || Math.max(30, newEnd - newStart),
              currentBlocks: targetDayBlocks,
            });
            if (res) {
              if (res.recommendedScenario) {
                setPendingRecommendedScenario(res.recommendedScenario);
              }
              if (res.alternativeScenarios && res.alternativeScenarios.length > 0) {
                setPendingAlternativeScenarios(res.alternativeScenarios);
              }
              if (res.explanation) {
                setPendingExplanation(res.explanation);
              }
              if (res.scenarios && res.scenarios.length > 0) {
                setPendingScenarios(res.scenarios);
              }
            }
          } catch (e) {
            console.warn("Using local Smart Default adaptation scenarios:", e);
          }

          const conflictDetails = conflicts.map((b) => `**${b.title}** (${b.startTime}–${b.endTime})`).join(', ');
          setPlannerMessages((current) => [
            ...current,
            {
              role: "assistant",
              text: `⚠️ **Phát hiện trùng khung giờ:** Sự kiện **${newBlock.title}** (${newBlock.startTime}–${newBlock.endTime}) vào ngày **${formatDateForDisplay(targetDate)}** bị trùng giờ với ${conflictDetails}.\n\nAI đã tính toán phương án điều chỉnh tối ưu nhất kèm giải thích minh bạch bên dưới để bạn duyệt 1-chạm:`,
            },
          ]);
        } else {
          setPendingConflicts([]);
          setPendingRecommendedScenario(null);
          setPendingAlternativeScenarios([]);
          setPendingExplanation(null);
          const dateSuffix = targetDate === todayStr ? "" : ` vào ngày **${formatDateForDisplay(targetDate)}**`;
          setPlannerMessages((current) => [
            ...current,
            {
              role: "assistant",
              text: `Got it! I found a calm opening for **${newBlock.title}**${dateSuffix} from **${newBlock.startTime}–${newBlock.endTime}**. It preserves your protected transition buffers intact. Please review and confirm below.`,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn("AI parse error, using smart fallback:", err);
      setPlannerThinking(false);
      setPendingConflicts([]);
      setPendingScenarios([]);
      setPendingRecommendedScenario(null);
      setPendingAlternativeScenarios([]);
      setPendingExplanation(null);
      const lower = cleanText.toLowerCase();

      // Heuristic date
      let targetDate = selectedDate;
      const today = new Date();
      if (lower.includes("ngày mai") || lower.includes(" mai") || lower.startsWith("mai ") || lower.includes("tomorrow")) {
        targetDate = tomorrowStr;
      } else if (lower.includes("ngày mốt") || lower.includes("ngày kia")) {
        const m = new Date(today);
        m.setDate(today.getDate() + 2);
        targetDate = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(m.getDate()).padStart(2, '0')}`;
      } else {
        const dmyMatch = cleanText.match(/(\d{1,2})[-/. ](\d{1,2})(?:[-/. ](\d{4}))?/);
        if (dmyMatch) {
          const d = String(dmyMatch[1]).padStart(2, '0');
          const m = String(dmyMatch[2]).padStart(2, '0');
          const y = dmyMatch[3] || today.getFullYear().toString();
          targetDate = `${y}-${m}-${d}`;
        } else {
          const singleDayMatch = cleanText.match(/(?:ngày|hôm|mùng)\s*(\d{1,2})\b/i);
          if (singleDayMatch) {
            const dNum = parseInt(singleDayMatch[1], 10);
            if (dNum >= 1 && dNum <= 31) {
              const d = String(dNum).padStart(2, '0');
              const m = String(today.getMonth() + 1).padStart(2, '0');
              const y = today.getFullYear().toString();
              targetDate = `${y}-${m}-${d}`;
            }
          }
        }
      }

      // Heuristic time
      let startTime = "19:00";
      let endTime = "20:30";
      const timeMatch = cleanText.match(/(?:từ\s*)?(\d{1,2})(?:h|:(\\d{2}))?\s*(?:-|–|đến|to|tới)\s*(\d{1,2})(?:h|:(\\d{2}))?(?:h)?\s*(am|pm|sáng|chiều|tối|đêm)?/i);
      if (timeMatch) {
        let sh = parseInt(timeMatch[1], 10);
        const sm = timeMatch[2] ? String(timeMatch[2]).padStart(2, '0') : "00";
        let eh = parseInt(timeMatch[3], 10);
        const em = timeMatch[4] ? String(timeMatch[4]).padStart(2, '0') : "00";
        const period = (timeMatch[5] || "").toLowerCase();

        const isEvening = period.includes("tối") || period.includes("đêm") || lower.includes("tối") || lower.includes("đêm") || (period.includes("pm") && eh <= 11);
        const isAfternoon = period.includes("chiều") || lower.includes("chiều");

        if (isEvening) {
          if (sh < 12) sh += 12;
          if (eh < 12) eh += 12;
        } else if (isAfternoon) {
          if (sh <= 5) sh += 12;
          if (eh <= 5) eh += 12;
        }

        startTime = `${String(sh).padStart(2, '0')}:${sm}`;
        endTime = `${String(eh).padStart(2, '0')}:${em}`;
      }

      const isPark = lower.includes("công viên") || lower.includes("park");
      const isCafe = lower.includes("cafe") || lower.includes("coffee") || lower.includes("cà phê");
      const isGym = lower.includes("gym") || lower.includes("tập") || lower.includes("workout");
      const isUrgentMeeting = lower.includes("đột xuất") || lower.includes("khẩn") || lower.includes("gấp");

      const newBlock: Omit<TimeBlock, 'id'> = {
        title: isPark ? "Đi dạo công viên" : isCafe ? "Đi cà phê" : isGym ? "Tập gym / Thể dục" : isUrgentMeeting ? "Cuộc họp đột xuất" : "Focused Work Session",
        detail: isPark ? "Thư giãn ngoài trời & hít thở không khí tự nhiên" : isCafe ? "The Workshop Cafe · Nạp lại năng lượng xã hội" : isGym ? "Rèn luyện thể lực & duy trì sức khỏe" : isUrgentMeeting ? "Cuộc họp phát sinh khẩn cấp cần ưu tiên xử lý" : "Dedicated priority task",
        startTime,
        endTime,
        category: isPark ? "rest" : isCafe ? "social" : isGym ? "health" : isUrgentMeeting ? "urgent" : "work",
        energyLevel: (isPark || isCafe) ? "low" : "high",
        priority: isUrgentMeeting ? "High" : "Normal",
        reminderMinutesBefore: [30, 10, 0],
        isCompleted: false,
        date: targetDate,
        microSteps: [
          { id: "p-1", text: "Chuẩn bị tài liệu và không gian", done: false },
          { id: "p-2", text: "Bắt đầu từng bước nhỏ", done: false },
        ],
      };

      setPendingActivity(newBlock);

      let targetDayBlocks: TimeBlock[] = [];
      try {
        targetDayBlocks = await api.getTimeBlocks(targetDate);
      } catch {
        targetDayBlocks = timeBlocks;
      }

      const toMin = (t?: string) => {
        if (!t) return 0;
        const [h, m] = t.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      const newStart = toMin(newBlock.startTime);
      const newEnd = toMin(newBlock.endTime);

      const conflicts = (targetDayBlocks || []).filter((b) => {
        if (b.overrideType === 'CANCELLED') return false;
        const bStart = toMin(b.startTime);
        const bEnd = toMin(b.endTime);
        return Math.max(newStart, bStart) < Math.min(newEnd, bEnd);
      });

      if (conflicts.length > 0) {
        setPendingConflicts(conflicts);
        const localResult = generateLocalAdaptiveScenarios(newBlock, targetDayBlocks, conflicts, targetDate);
        setPendingRecommendedScenario(localResult.recommended);
        setPendingAlternativeScenarios(localResult.alternatives);
        setPendingExplanation(localResult.explanation);
        setPendingScenarios([localResult.recommended, ...localResult.alternatives]);

        const conflictDetails = conflicts.map((b) => `**${b.title}** (${b.startTime}–${b.endTime})`).join(', ');
        setPlannerMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: `⚠️ **Phát hiện trùng khung giờ:** Sự kiện **${newBlock.title}** (${newBlock.startTime}–${newBlock.endTime}) vào ngày **${formatDateForDisplay(targetDate)}** bị trùng giờ với ${conflictDetails}.\n\nAI đã tính toán phương án điều chỉnh tối ưu nhất kèm giải thích minh bạch bên dưới để bạn duyệt 1-chạm:`,
          },
        ]);
      } else {
        setPendingConflicts([]);
        setPendingRecommendedScenario(null);
        setPendingAlternativeScenarios([]);
        setPendingExplanation(null);
        const dateSuffix = targetDate === todayStr ? "" : ` vào ngày **${formatDateForDisplay(targetDate)}**`;
        setPlannerMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: `Got it! I found a calm opening for **${newBlock.title}**${dateSuffix} from **${newBlock.startTime}–${newBlock.endTime}**. It preserves your protected transition buffers intact. Please review and confirm below.`,
          },
        ]);
      }
    }
  };

  const handleConfirmAdd = () => {
    if (pendingActivity) {
      const targetDate = pendingActivity.date || selectedDate;
      createBlockMutation.mutate({
        ...pendingActivity,
        date: targetDate,
      });
      if (pendingActivity.date && pendingActivity.date !== selectedDate) {
        setSelectedDate(pendingActivity.date);
      }
      setPendingActivity(null);
      setPendingConflicts([]);
      setPendingScenarios([]);
      setPendingRecommendedScenario(null);
      setPendingAlternativeScenarios([]);
      setPendingExplanation(null);
      setActivityAdded(true);
      playGentleChime();
      window.setTimeout(() => setActivityAdded(false), 4000);
      refetchBlocks();
      loadInboxBlocks();
    }
  };

  const handleApplyPlannerScenario = async (scenario: ScenarioOption) => {
    const targetDate = pendingActivity?.date || selectedDate;
    const blocksWithDate = scenario.blocks.map((b) => ({
      ...b,
      date: targetDate,
    }));

    let actionId: number | null = null;
    try {
      const res = await api.applyAdaptation({
        date: targetDate,
        reason: pendingActivity?.title || scenario.title,
        newBlocks: blocksWithDate,
      });
      if (res && res.actionId) {
        actionId = res.actionId;
      }
    } catch {
      await batchApplyMutation.mutateAsync(blocksWithDate);
    }

    if (targetDate && targetDate !== selectedDate) {
      setSelectedDate(targetDate);
    }
    setPendingActivity(null);
    setPendingConflicts([]);
    setPendingScenarios([]);
    setPendingRecommendedScenario(null);
    setPendingAlternativeScenarios([]);
    setPendingExplanation(null);

    playGentleChime();
    setView("today"); // Auto navigate to Day Timeline

    // Show 10-second Undo toast
    if (undoTimeoutId) {
      window.clearTimeout(undoTimeoutId);
    }
    setUndoToast({
      visible: true,
      actionId,
      message: `✓ Đã áp dụng: ${scenario.title}`,
      targetDate,
    });
    const tid = window.setTimeout(() => {
      setUndoToast((prev) => ({ ...prev, visible: false }));
    }, 10000);
    setUndoTimeoutId(tid);

    refetchBlocks();
    loadInboxBlocks();
  };

  const handleUndoAdaptation = async () => {
    if (!undoToast.actionId) {
      setUndoToast({ visible: false, actionId: null, message: "" });
      return;
    }
    try {
      await api.undoAdaptation(undoToast.actionId);
      playGentleChime();
      setUndoToast({
        visible: false,
        actionId: null,
        message: "Đã hoàn tác thành công",
      });
      refetchBlocks();
      loadInboxBlocks();
    } catch (e) {
      console.error("Failed to undo adaptation", e);
    }
  };

  const handleApplyScenario = (index: number) => {
    const scenario = scenarios[index];
    if (scenario) {
      batchApplyMutation.mutate(scenario.blocks);
    } else {
      applyScenario(index);
    }
    playGentleChime();
  };

  const handleTriggerDisruption = async () => {
    try {
      await rescheduleMutation.mutateAsync({
        urgentEvent: "Unexpected sync at 17:00 (30m)",
        currentBlocks: timeBlocks,
      });
    } catch {
      setDisruptionState("impact");
    }
  };

  const testVoice = () => {
    setVoiceTesting(true);
    playGentleChime();
    window.setTimeout(() => setVoiceTesting(false), 2400);
  };

  const title = useMemo(() => {
    const labels: Record<ViewId, string> = {
      today: "Good morning, Thai",
      calendar: "Your month, at a glance",
      planner: "Plan your day naturally",
      interview: "Interview Lab",
      insights: "Your day, at a glance",
      notifications: "Notifications",
      settings: "Settings",
      profile: "Your profile",
      preferences: "How should Adaptive plan for you?",
      companion: "Desk Companion",
    };
    return labels[view];
  }, [view]);

  return (
    <div className="app-canvas min-h-screen overflow-x-hidden bg-background text-foreground">
      {view !== "interview" && <><div className="ambient-shape ambient-shape-left" aria-hidden="true" /><div className="ambient-shape ambient-shape-right" aria-hidden="true" /></>}
      <div className={view === "interview" ? "relative mx-auto min-h-screen max-w-[1440px]" : "relative mx-auto flex min-h-screen max-w-[1440px] gap-5 px-4 py-4 sm:px-5 sm:py-5"}>
        {view !== "interview" && <DesktopSidebar active={view} onNavigate={navigate} voiceOn={voiceOn} />}

        {mobileOpen && view !== "interview" && (
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-[280px] bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <Brand />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></Button>
              </div>
              <NavItems active={view} onNavigate={navigate} className="mt-8" />
            </div>
          </div>
        )}

        <main className={view === "interview" ? "min-w-0" : "min-w-0 flex-1 pb-20 md:pb-4"}>
          {view !== "interview" && <header className="mb-7 flex items-start justify-between gap-4 pt-1">
            <div className="flex items-start gap-3">
              <Button className="mt-0.5 md:hidden" variant="outline" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button>
              <div className="rise">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{dateFormatted}</p>
                  <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary shadow-xs">
                    <Clock3 className="size-3 text-primary animate-pulse" /> {timeFormatted}
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {view === "today"
                    ? disruptionState === "impact"
                      ? "⚡ Schedule alert: 1 change needs your choice."
                      : timelineState.activeBlock
                      ? `Now in Focus: ${timelineState.activeBlock.title} (${timelineState.remainingMinutes} min left).`
                      : timelineState.nextBlock
                      ? `You're Free for the next ${timelineState.freeMinutesRemaining} min · Next: ${timelineState.nextBlock.title}.`
                      : "All scheduled activities completed for today."
                    : subtitleFor(view)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {view === "today" && <Button className="hidden rounded-full sm:inline-flex" onClick={() => setNowOpen(true)}><MessageCircleQuestion />What should I do now?</Button>}
              <Button variant="outline" size="icon" className="relative bg-card/60" onClick={() => navigate("notifications")} aria-label="Notifications">
                <Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-warning" />
              </Button>
              <button type="button" onClick={() => navigate("profile")} className="focus-ring size-10 overflow-hidden rounded-xl ring-1 ring-border" aria-label="Open profile">
                <img src={avatarImage} alt="Thai" width={512} height={512} className="size-full object-cover" />
              </button>
            </div>
          </header>}

          {view === "today" && (
            <TodayView
              blocks={timeBlocks}
              inboxBlocks={inboxBlocks}
              onScheduleInbox={loadInboxBlocks}
              onRefreshInbox={loadInboxBlocks}
              timelineState={timelineState}
              timeFormatted={timeFormatted}
              disruption={disruptionState}
              selectedOption={selectedScenarioIndex}
              scenarios={scenarios}
              reasoningOpen={reasoningOpen}
              onReasoning={() => setReasoningOpen((open) => !open)}
              onSelectOption={setSelectedScenarioIndex}
              onAdapt={() => handleApplyScenario(selectedScenarioIndex)}
              onReset={resetDisruption}
              onTrigger={handleTriggerDisruption}
              onNow={() => setNowOpen(true)}
              onTransition={() => setTransitionOpen(true)}
              onToggleComplete={toggleComplete}
              onToggleMicroStep={toggleMicroStep}
              onBreakdown={(blockId, taskTitle) => breakdownMutation.mutate({ blockId, taskTitle })}
              activityAdded={activityAdded}
              selectedDate={selectedDate}
              holidayData={holidayData}
              onPauseHoliday={() => pauseRoutineMutation.mutate(selectedDate)}
              onResumeHoliday={() => resumeRoutineMutation.mutate(selectedDate)}
              onCancelRoutine={(routineId) => cancelRoutineMutation.mutate({ routineId, date: selectedDate })}
              onDeleteBlock={(id) => deleteBlockMutation.mutate(id)}
              onOpenCalendar={() => navigate("calendar")}
              onOpenRoutineModal={() => setIsRoutineModalOpen(true)}
              onNavigateDate={(delta) => {
                const [y, m, d] = selectedDate.split('-').map(Number);
                const nextDate = new Date(y, m - 1, d + delta);
                const nextYear = nextDate.getFullYear();
                const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
                const nextDay = String(nextDate.getDate()).padStart(2, '0');
                setSelectedDate(`${nextYear}-${nextMonth}-${nextDay}`);
              }}
              onResetToday={() => setSelectedDate(getTodayDateString())}
            />
          )}
          {view === "calendar" && (
            <MonthCalendarView
              onSelectDate={(dateStr) => {
                setSelectedDate(dateStr);
                setView("today");
              }}
            />
          )}
          {view === "planner" && (
            <PlannerView
              messages={plannerMessages}
              thinking={plannerThinking}
              pendingActivity={pendingActivity}
              pendingConflicts={pendingConflicts}
              recommendedScenario={pendingRecommendedScenario}
              alternativeScenarios={pendingAlternativeScenarios}
              explanation={pendingExplanation}
              pendingScenarios={pendingScenarios}
              currentBlocks={timeBlocks}
              selectedDate={selectedDate}
              activityAdded={activityAdded}
              onSubmit={handlePlannerSubmit}
              onSuggestion={(text) => handlePlannerSubmit({ text })}
              onAdd={handleConfirmAdd}
              onCancel={() => {
                setPendingActivity(null);
                setPendingConflicts([]);
                setPendingScenarios([]);
                setPendingRecommendedScenario(null);
                setPendingAlternativeScenarios([]);
                setPendingExplanation(null);
              }}
              onApplyScenario={handleApplyPlannerScenario}
              onUpdatePending={setPendingActivity}
            />
          )}
          {view === "interview" && <InterviewLab />}
          {view === "insights" && <InsightsView />}
          {view === "notifications" && <NotificationsView read={readNotifications} setRead={setReadNotifications} transitionOn={transitionOn} setTransitionOn={setTransitionOn} importantOn={importantOn} setImportantOn={setImportantOn} />}
          {view === "settings" && <SettingsView onNavigate={navigate} />}
          {view === "preferences" && <PreferencesView voiceOn={voiceOn} setVoiceOn={setVoiceOn} askFirst={askFirst} setAskFirst={setAskFirst} allowSuggestions={allowSuggestions} setAllowSuggestions={setAllowSuggestions} />}
          {view === "companion" && <CompanionView voiceOn={voiceOn} setVoiceOn={setVoiceOn} importantOn={importantOn} setImportantOn={setImportantOn} transitionOn={transitionOn} setTransitionOn={setTransitionOn} testing={voiceTesting} onTest={testVoice} />}
          {view === "profile" && <ProfileView />}
        </main>
      </div>

      {view !== "interview" && <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur-xl md:hidden">
        {navigation.slice(0, 4).map((item) => (
          <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] ${view === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <item.icon className="size-4" />{item.label}
          </button>
        ))}
      </nav>}

      {/* 10-Second Transactional Undo Toast */}
      <AnimatePresence>
        {undoToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center justify-between gap-4 max-w-xl w-full p-4 rounded-2xl bg-foreground text-background shadow-2xl border border-border/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="size-4" />
                </div>
                <p className="text-sm font-medium truncate">
                  {undoToast.message}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-background/20 bg-background/10 hover:bg-background/20 text-background text-xs font-bold transition-all flex items-center gap-1.5 px-3 py-1.5"
                  onClick={handleUndoAdaptation}
                >
                  <RotateCcw className="size-3.5" />
                  Hoàn tác (Undo)
                </Button>
                <button
                  type="button"
                  onClick={() => setUndoToast((prev) => ({ ...prev, visible: false }))}
                  className="p-1 rounded-lg hover:bg-background/10 text-background/60 hover:text-background transition-colors"
                  title="Đóng thông báo"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NowDialog open={nowOpen} onOpenChange={setNowOpen} focusStarted={focusStarted} onStart={() => setFocusStarted(true)} onViewPlan={() => { setNowOpen(false); navigate("today"); }} />
      <TransitionDialog open={transitionOpen} onOpenChange={setTransitionOpen} />
      <WeeklyRoutineModal />
    </div>
  );
}

function Brand() {
  return <div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-extrabold text-primary-foreground">A</span><div><p className="font-display text-[15px] font-extrabold leading-none">Adaptive</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">YOUR DAY, WITH YOU</p></div></div>;
}

function DesktopSidebar({ active, onNavigate, voiceOn }: { active: ViewId; onNavigate: (id: ViewId) => void; voiceOn: boolean }) {
  return <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-56 shrink-0 flex-col justify-between md:flex">
    <div><Brand /><NavItems active={active} onNavigate={onNavigate} className="mt-9" /></div>
    <div className="space-y-1">
      <SidebarButton active={active === "companion"} icon={Headphones} label="Desk companion" onClick={() => onNavigate("companion")} suffix={voiceOn ? "ON" : "OFF"} />
      <SidebarButton active={active === "preferences"} icon={SlidersHorizontal} label="Preferences" onClick={() => onNavigate("preferences")} />
      <button type="button" onClick={() => onNavigate("profile")} className={`mt-3 flex w-full items-center gap-2 rounded-xl border p-2 text-left transition-colors ${active === "profile" ? "border-primary/20 bg-primary-soft" : "border-border bg-card/45 hover:bg-card/70"}`}>
        <img src={avatarImage} alt="Thai" width={512} height={512} className="size-9 rounded-lg object-cover" />
        <div><p className="text-[13px] font-semibold leading-none">Thai</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">Profile</p></div>
      </button>
    </div>
  </aside>;
}

function NavItems({ active, onNavigate, className = "" }: { active: ViewId; onNavigate: (id: ViewId) => void; className?: string }) {
  return <nav className={`space-y-1 ${className}`}>{navigation.map((item, index) => <button key={item.id} type="button" onClick={() => onNavigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}><span className="font-mono text-[9px] opacity-60">0{index + 1}</span><item.icon className="size-4" />{item.label}{"badge" in item && item.badge ? <span className="ml-auto grid size-5 place-items-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">{item.badge}</span> : null}</button>)}</nav>;
}

function SidebarButton({ active, icon: Icon, label, onClick, suffix }: { active: boolean; icon: typeof Headphones; label: string; onClick: () => void; suffix?: string }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}><Icon className="size-4" />{label}{suffix && <span className="ml-auto font-mono text-[9px]">{suffix}</span>}</button>;
}

function NowIndicatorLine({ timeFormatted }: { timeFormatted: string }) {
  return (
    <div className="relative my-2 flex items-center gap-2 py-1">
      <div className="h-[2px] flex-1 bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
      <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-red-500 shadow-sm backdrop-blur-sm">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500" />
        </span>
        NOW {timeFormatted.slice(0, 5)}
      </div>
      <div className="h-[2px] flex-1 bg-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
    </div>
  );
}

function FreeTimeCard(props: {
  freeMinutes: number;
  nextBlock: TimeBlock | null;
  onNow: () => void;
  onTransition: () => void;
}) {
  return (
    <div className="rise rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          ☕ YOU'RE FREE · {props.freeMinutes > 0 ? `${props.freeMinutes} MINUTES AVAILABLE` : "NO ACTIVE TASK"}
        </span>
        <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[9px] font-bold text-white">RECHARGE TIME</span>
      </div>
      <h3 className="mt-2 font-display text-xl font-bold">Unscheduled Recharge Time</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {props.nextBlock
          ? `Next task is ${props.nextBlock.title} at ${props.nextBlock.startTime}. Relax freely or choose an easy micro-action.`
          : "You have completed all scheduled tasks for today. Rest and decompress freely."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="default" className="rounded-xl" onClick={props.onNow}>
          <MessageCircleQuestion className="size-3.5" /> What should I do now?
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl bg-card/60" onClick={props.onTransition}>
          <TimerReset className="size-3.5" /> 4-Step Sensory Reset
        </Button>
      </div>
    </div>
  );
}

function formatDateVietnamese(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ${d} thg ${m}, ${y}`;
  } catch {
    return dateStr;
  }
}

function TodayView(props: {
  blocks: TimeBlock[];
  inboxBlocks?: TimeBlock[];
  onScheduleInbox?: (block: TimeBlock) => void;
  onRefreshInbox?: () => void;
  timelineState: TimelineTemporalState;
  timeFormatted: string;
  disruption: DisruptionState;
  selectedOption: number;
  scenarios: ScenarioOption[];
  reasoningOpen: boolean;
  onReasoning: () => void;
  onSelectOption: (i: number) => void;
  onAdapt: () => void;
  onReset: () => void;
  onTrigger: () => void;
  onNow: () => void;
  onTransition: () => void;
  onToggleComplete: (id: string) => void;
  onToggleMicroStep: (blockId: string, stepId: string) => void;
  onBreakdown: (blockId: string, title: string) => void;
  activityAdded: boolean;
  selectedDate: string;
  holidayData?: any;
  onPauseHoliday: () => void;
  onResumeHoliday: () => void;
  onCancelRoutine: (routineId: number) => void;
  onDeleteBlock?: (id: string) => void;
  onOpenCalendar: () => void;
  onOpenRoutineModal: () => void;
  onNavigateDate: (delta: number) => void;
  onResetToday: () => void;
}) {
  const sortedBlocks = useMemo(() => {
    return [...props.blocks].sort(
      (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
    );
  }, [props.blocks]);

  const { nowInMinutes, activeBlock, nextBlock, isFreeTime, remainingMinutes, progressPercent, isTransitionWarning } = props.timelineState;
  const todayStr = getTodayDateString();
  const isSelectedToday = props.selectedDate === todayStr;

  return (
    <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 space-y-4">
        {/* Date Navigator Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => props.onNavigateDate(-1)}
              className="p-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
              title="Ngày trước (Previous Day)"
            >
              <ChevronRight className="size-4 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  {formatDateVietnamese(props.selectedDate)}
                </h3>
                {isSelectedToday ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
                    HÔM NAY
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-mono font-medium">
                    {props.selectedDate}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => props.onNavigateDate(1)}
              className="p-1.5 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
              title="Ngày sau (Next Day)"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {!isSelectedToday && (
              <button
                onClick={props.onResetToday}
                className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
              >
                Về hôm nay
              </button>
            )}
            <button
              onClick={props.onOpenCalendar}
              className="px-3 py-1.5 rounded-xl bg-muted/80 text-foreground text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="size-3.5 text-primary" />
              Lịch tháng
            </button>
            <button
              onClick={props.onOpenRoutineModal}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs shadow-primary/20"
            >
              <Settings2 className="size-3.5" />
              Thời khóa biểu tuần
            </button>
          </div>
        </div>

        {/* Vietnamese Holiday Notification Banner */}
        {props.holidayData && props.holidayData.name && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.07] p-4 shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🇻🇳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {props.holidayData.name} ({props.holidayData.englishName})
                    </h4>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      Nghỉ Lễ Toàn Quốc
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Lịch trình làm việc thường ngày vẫn đang bật. Bạn có muốn tạm dừng lịch hôm nay không?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={props.onPauseHoliday}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Tạm ngưng lịch hôm nay
                </button>
                <button
                  type="button"
                  onClick={props.onResumeHoliday}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
                >
                  Khôi phục lịch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tomorrow Inbox Unscheduled Tasks Drawer */}
        {props.inboxBlocks && props.inboxBlocks.length > 0 && (
          <TomorrowInboxDrawer
            selectedDate={props.selectedDate}
            inboxBlocks={props.inboxBlocks}
            onScheduled={(b) => {
              props.onScheduleInbox?.(b);
            }}
            onRefresh={() => {
              props.onRefreshInbox?.();
            }}
          />
        )}

        <div className="flex items-center justify-between border-b border-border pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {isSelectedToday ? "Today's Adaptive Timeline" : `Timeline for ${props.selectedDate}`}
          </p>
          <div className="flex flex-wrap gap-3 font-mono text-[9px] text-muted-foreground">
            <Legend color="bg-muted-foreground/50" label="Past" />
            <Legend color="bg-primary" label="Now (Active)" />
            <Legend color="bg-emerald-500" label="Recharge/Buffer" />
            <Legend color="bg-warning" label="Alert" />
          </div>
        </div>

        {/* Dynamic Focus State (Active NOW or Free Time) */}
        {isSelectedToday && (
          isFreeTime ? (
            <FreeTimeCard
              freeMinutes={props.timelineState.freeMinutesRemaining}
              nextBlock={nextBlock}
              onNow={props.onNow}
              onTransition={props.onTransition}
            />
          ) : activeBlock ? (
            <CurrentActiveCard
              activeBlock={activeBlock}
              remainingMinutes={remainingMinutes}
              progressPercent={progressPercent}
              isTransitionWarning={isTransitionWarning}
              onNow={props.onNow}
            />
          ) : null
        )}

        {/* Timeline Blocks with Chronological NOW Indicator Line */}
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-3">
            <Clock3 className="size-8 mx-auto text-muted-foreground/60" />
            <div>
              <p className="text-sm font-semibold text-foreground">Không có lịch trình nào cho ngày này</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bạn có thể thiết lập Thời khóa biểu tuần để tự động điền hoặc nhập công việc qua AI Planner!
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={props.onOpenRoutineModal}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
              >
                Cài đặt thời khóa biểu tuần
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBlocks.map((block, idx) => {
              const start = timeStringToMinutes(block.startTime);
              const end = timeStringToMinutes(block.endTime);
              const prevEnd = idx > 0 ? timeStringToMinutes(sortedBlocks[idx - 1].endTime) : -1;

              const isPast = isSelectedToday && end <= nowInMinutes;
              const isNow = isSelectedToday && block.id === activeBlock?.id;
              const isNext = isSelectedToday && block.id === nextBlock?.id;

              // Indicator placement: between blocks or at start
              const showIndicatorBefore =
                isSelectedToday &&
                ((idx === 0 && nowInMinutes < start) ||
                  (idx > 0 && nowInMinutes >= prevEnd && nowInMinutes < start));

              return (
                <div key={block.id} className="space-y-3">
                  {showIndicatorBefore && <NowIndicatorLine timeFormatted={props.timeFormatted} />}
                  <EnhancedTimelineCard
                    block={block}
                    isNow={isNow}
                    isNext={isNext}
                    isPast={isPast}
                    onToggleComplete={() => props.onToggleComplete(block.id)}
                    onToggleMicroStep={(stepId) => props.onToggleMicroStep(block.id, stepId)}
                    onBreakdown={() => props.onBreakdown(block.id, block.title)}
                    onTransitionClick={props.onTransition}
                    onCancelRoutine={() => {
                      const routineId = block.sourceRoutineId || (block.id && typeof block.id === 'string' && block.id.startsWith('routine-') ? parseInt(block.id.split('-')[1], 10) : undefined);
                      if (routineId) {
                        props.onCancelRoutine(routineId);
                      }
                    }}
                    onDeleteBlock={() => {
                      props.onDeleteBlock?.(block.id);
                    }}
                  />
                </div>
              );
            })}

            {/* Indicator if current time is after all blocks */}
            {isSelectedToday &&
              sortedBlocks.length > 0 &&
              nowInMinutes >= timeStringToMinutes(sortedBlocks[sortedBlocks.length - 1].endTime) && (
                <NowIndicatorLine timeFormatted={props.timeFormatted} />
              )}
          </div>
        )}


        {props.activityAdded && (
          <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
            <span className="font-mono text-[10px] font-semibold text-primary">NEW · ADDED TO TIMETABLE</span>
            <p className="mt-1 text-sm font-medium">Activity added successfully. Your protected transitions remain untouched.</p>
          </div>
        )}

        <Button className="mt-4 w-full rounded-xl sm:hidden" onClick={props.onNow}>
          <MessageCircleQuestion />What should I do now?
        </Button>
      </section>

      <aside className="space-y-4">
        {props.disruption === "idle" && (
          <DemoTrigger onTrigger={props.onTrigger} />
        )}

        <button
          type="button"
          onClick={props.onTransition}
          className="glass-panel flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform hover:-translate-y-0.5"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-transition-soft text-transition">
            <TimerReset className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Protected Transition</p>
            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">11:30 · 30m Sensory Reset buffer</p>
          </div>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={props.onNow}
          className="glass-panel flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform hover:-translate-y-0.5"
        >
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageCircleQuestion className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Need a clear next step?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Ask "What should I do now?"</p>
          </div>
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </button>
      </aside>
    </div>

    {/* ── Full-width Adaptive Panel (shown when disruption is active) ── */}
    {props.disruption !== "idle" && (
      <AdaptivePanel
        disruption={props.disruption}
        selectedOption={props.selectedOption}
        scenarios={props.scenarios}
        reasoningOpen={props.reasoningOpen}
        onReasoning={props.onReasoning}
        onSelectOption={props.onSelectOption}
        onAdapt={props.onAdapt}
        onReset={props.onReset}
        currentBlocks={props.blocks}
      />
    )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><i className={`size-2 rounded-full ${color}`} />{label}</span>;
}

function Status({ className, text }: { className: string; text: string }) {
  return <span className={`rounded-full px-2 py-1 font-mono text-[9px] font-semibold ${className}`}>{text}</span>;
}

function CurrentActiveCard(props: {
  activeBlock: TimeBlock;
  remainingMinutes: number;
  progressPercent: number;
  isTransitionWarning: boolean;
  onNow: () => void;
}) {
  return (
    <div className="rise rounded-2xl border border-primary/30 bg-card/75 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold text-primary">
          NOW ACTIVE · {props.activeBlock.startTime} – {props.activeBlock.endTime} ({props.remainingMinutes} min remaining)
        </span>
        <div className="flex items-center gap-1.5">
          {props.isTransitionWarning && (
            <span className="animate-pulse rounded-full bg-warning px-2 py-0.5 font-mono text-[9px] font-bold text-warning-foreground">
              🟡 10M LEFT
            </span>
          )}
          <Status className="bg-primary text-primary-foreground" text="IN FOCUS" />
        </div>
      </div>
      <h3 className="mt-2 font-display text-xl font-bold">{props.activeBlock.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {props.activeBlock.detail || "Active priority task. Protected transitions remain intact."}
      </p>

      {/* Live Dynamic progress bar & countdown */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>{props.remainingMinutes} min remaining</span>
          <span>Ends at {props.activeBlock.endTime} ({props.progressPercent}%)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${props.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function EnhancedTimelineCard({
  block,
  isNow,
  isNext,
  isPast,
  onToggleComplete,
  onToggleMicroStep,
  onBreakdown,
  onTransitionClick,
  onCancelRoutine,
  onDeleteBlock,
}: {
  block: TimeBlock;
  isNow?: boolean;
  isNext?: boolean;
  isPast?: boolean;
  onToggleComplete: () => void;
  onToggleMicroStep: (stepId: string) => void;
  onBreakdown: () => void;
  onTransitionClick: () => void;
  onCancelRoutine?: () => void;
  onDeleteBlock?: () => void;
}) {
  const [showSteps, setShowSteps] = useState(true);
  const isRoutine = block.sourceType === 'ROUTINE' || (block.id && block.id.startsWith('routine-'));

  if (block.isBufferBlock) {
    return (
      <div
        onClick={onTransitionClick}
        className="cursor-pointer rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 py-3 transition-colors hover:bg-emerald-500/15"
      >
        <div className="flex items-center gap-3">
          <TimerReset className="size-4 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {block.startTime} – {block.endTime} · Protected Buffer
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">☕ Low Demand</span>
            </div>
            <p className="text-xs font-semibold text-foreground/90">{block.title}</p>
            {block.detail && <p className="text-[11px] text-muted-foreground">{block.detail}</p>}
          </div>
        </div>
      </div>
    );
  }

  const energyIcon = block.energyLevel === 'high' ? '🔋 High' : block.energyLevel === 'medium' ? '⚡ Medium' : '☕ Recharge';

  return (
    <div
      className={`group rounded-2xl border p-4 backdrop-blur-sm transition-all hover:bg-card/70 ${
        block.isCompleted || isPast
          ? 'border-border/40 bg-card/25 opacity-55'
          : block.category === 'urgent'
          ? 'border-warning/50 bg-warning/10 ring-2 ring-warning/30 shadow-xs'
          : isNow
          ? 'border-primary/60 bg-primary/10 ring-2 ring-primary/40 shadow-sm'
          : isNext
          ? 'border-primary/40 bg-card/60 ring-1 ring-primary/20'
          : 'border-border/70 bg-card/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggleComplete}
            className={`mt-0.5 grid size-5 place-items-center rounded-md border transition-colors ${
              block.isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
            }`}
          >
            {block.isCompleted && <Check className="size-3" />}
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-medium text-muted-foreground">
                {block.startTime} – {block.endTime}
              </span>
              {isRoutine && (
                <span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-sky-600 dark:text-sky-400">
                  ROUTINE
                </span>
              )}
              {isNow && <span className="animate-pulse rounded-md bg-primary px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">NOW ACTIVE</span>}
              {isNext && <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">NEXT</span>}
              {isPast && !block.isCompleted && <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">PAST</span>}
              {block.category === 'urgent' && <span className="rounded-md bg-warning/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-warning">URGENT</span>}
            </div>
            <h3 className={`mt-1 font-display text-base font-bold ${block.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {block.title}
            </h3>
            {block.detail && <p className="mt-0.5 text-xs text-muted-foreground">{block.detail}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">{energyIcon}</span>
            {(onCancelRoutine || onDeleteBlock) && (
              <button
                type="button"
                onClick={() => {
                  if (isRoutine && onCancelRoutine) {
                    onCancelRoutine();
                  } else if (onDeleteBlock) {
                    onDeleteBlock();
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all focus:opacity-100"
                title={isRoutine ? "Hủy task này riêng cho ngày hôm nay (không ảnh hưởng tuần khác)" : "Xóa hoạt động này"}
                aria-label={isRoutine ? "Hủy ngày này" : "Xóa"}
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
          {block.reminderMinutesBefore && block.reminderMinutesBefore.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Bell className="size-2.5" /> {block.reminderMinutesBefore.map((m) => `${m}m`).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Micro-steps Checklist (Task Breakdown) or AI Breakdown Trigger */}
      {block.microSteps && block.microSteps.length > 0 ? (
        <div className="mt-3 rounded-xl border border-border/50 bg-background/50 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-mono font-medium">Breakdown Checklist ({block.microSteps.filter((s) => s.done).length}/{block.microSteps.length})</span>
            <button type="button" onClick={() => setShowSteps(!showSteps)} className="text-primary hover:underline">
              {showSteps ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSteps && (
            <div className="mt-2 space-y-1.5">
              {block.microSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onToggleMicroStep(step.id)}
                  className="flex w-full items-center gap-2 rounded-lg p-1 text-left text-xs transition-colors hover:bg-muted/40"
                >
                  <span
                    className={`grid size-4 place-items-center rounded border text-[8px] ${
                      step.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                    }`}
                  >
                    {step.done && <Check className="size-2.5" />}
                  </span>
                  <span className={step.done ? 'line-through text-muted-foreground' : 'text-foreground'}>{step.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
          <span className="text-[11px] text-muted-foreground">Stuck starting? Break this into 3 easy steps:</span>
          <button
            type="button"
            onClick={onBreakdown}
            className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <Sparkles className="size-3" /> Magic Breakdown
          </button>
        </div>
      )}
    </div>
  );
}

function DemoTrigger({ onTrigger }: { onTrigger: () => void }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <Zap className="size-4" />
        </span>
        <p className="font-display text-sm font-bold">Hackathon Demo Moment</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Simulate an unexpected emergency meeting at 17:00 to see Adaptive Planner propose 2–3 structured adaptation scenarios.
      </p>
      <Button className="mt-5 w-full rounded-xl" onClick={onTrigger}>
        <Play />Trigger Urgent Change
      </Button>
    </div>
  );
}

// ── Schedule Preview Panel Components ────────────────────────────────────────

function BlockDiffRow({ item }: { item: BlockDiffItem }) {
  const badgeStyles: Record<BlockChangeType, string> = {
    new: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    moved: 'bg-sky-500/20 text-sky-700 dark:text-sky-400',
    deferred: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
    protected: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    anchor: 'bg-muted text-muted-foreground',
  };
  const badgeLabels: Record<BlockChangeType, string> = {
    new: '⚡ New',
    moved: '→ Moved',
    deferred: '📤 Deferred',
    protected: '🛡️ Unchanged',
    anchor: '· Context',
  };

  const block = item.before || item.after;
  if (!block) return null;

  const beforeTime = item.before ? `${item.before.startTime}–${item.before.endTime}` : null;
  const afterTime = item.after
    ? item.after.date && item.after.date !== item.before?.date
      ? `Tomorrow ${item.after.startTime}–${item.after.endTime}`
      : `${item.after.startTime}–${item.after.endTime}`
    : 'Tomorrow Inbox';

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${
      item.changeType === 'anchor' ? 'border-border/40 bg-card/20 opacity-70' : 'border-border/60 bg-card/50'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold ${badgeStyles[item.changeType]}`}>
              {badgeLabels[item.changeType]}
            </span>
            {item.changeType !== 'anchor' && (
              <span className="font-mono text-[10px] text-muted-foreground truncate">
                {beforeTime && item.changeType !== 'new' ? (
                  <>{beforeTime} <span className="text-primary font-semibold">→</span> {afterTime}</>
                ) : (
                  <>{afterTime}</>
                )}
              </span>
            )}
            {item.changeType === 'anchor' && (
              <span className="font-mono text-[10px] text-muted-foreground">{beforeTime}</span>
            )}
          </div>
          <p className={`mt-1 text-sm font-semibold truncate ${item.changeType === 'anchor' ? 'text-muted-foreground' : 'text-foreground'}`}>
            {block.title}
          </p>
        </div>
      </div>

      {item.reasons.length > 0 && (
        <div className="space-y-0.5 pt-1 border-t border-border/30">
          {item.reasons.map((r, i) => (
            <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <span className="text-primary mt-px shrink-0">•</span>
              {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function SchedulePreviewPanel({
  scenario,
  diff,
  onAdapt,
  onReset,
}: {
  scenario: ScenarioOption | undefined;
  diff: BlockDiffItem[];
  onAdapt: () => void;
  onReset: () => void;
}) {
  const [fullDayOpen, setFullDayOpen] = useState(false);

  const changedCount = diff.filter(d => d.changeType !== 'anchor').length;

  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/20 p-6 text-center min-h-[220px]">
        <div className="text-2xl mb-2">👆</div>
        <p className="text-sm font-semibold text-foreground">Select an option to preview</p>
        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
          Click any scenario card on the left to see how your day will look after the change.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/40 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/40 bg-primary/5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary shrink-0">
            {scenario.tag}
          </span>
          <p className="text-xs font-bold text-foreground truncate">
            Previewing · {scenario.title}
          </p>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground shrink-0">
          {changedCount} block{changedCount !== 1 ? 's' : ''} affected
        </span>
      </div>

      {/* Diff list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
        {diff.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">No blocks affected by this option.</p>
        ) : (
          diff.map((item, i) => <BlockDiffRow key={i} item={item} />)
        )}

        {/* View full day toggle */}
        <button
          type="button"
          onClick={() => setFullDayOpen(v => !v)}
          className="mt-1 flex w-full items-center justify-between rounded-xl border border-border/40 bg-card/30 px-3 py-2 text-xs font-semibold text-primary hover:bg-card/60 transition-colors"
        >
          <span>{fullDayOpen ? '▾ Hide full day' : '▸ View full day'}</span>
          <ChevronDown className={`size-3.5 transition-transform ${fullDayOpen ? 'rotate-180' : ''}`} />
        </button>

        {fullDayOpen && (
          <div className="space-y-1.5 pt-1 animate-in fade-in">
            <p className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground px-1 pb-1">Full day after change</p>
            {[...scenario.blocks]
              .sort((a, b) => {
                const ap = a.startTime.split(':').map(Number);
                const bp = b.startTime.split(':').map(Number);
                return (ap[0] ?? 0) * 60 + (ap[1] ?? 0) - ((bp[0] ?? 0) * 60 + (bp[1] ?? 0));
              })
              .map((b) => (
                <div key={b.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 px-2.5 py-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground w-20 shrink-0">
                    {b.startTime}–{b.endTime}
                  </span>
                  <span className="text-xs font-medium truncate">{b.title}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Footer: Apply + Dismiss */}
      <div className="p-3 border-t border-border/40 flex gap-2 shrink-0">
        <Button className="flex-1 rounded-xl h-9 text-sm" onClick={onAdapt}>
          <Check className="size-3.5 mr-1" /> Apply this plan
        </Button>
        <Button variant="outline" className="rounded-xl h-9 bg-card/50" onClick={onReset}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdaptivePanel(props: {
  disruption: DisruptionState;
  selectedOption: number;
  scenarios: ScenarioOption[];
  reasoningOpen: boolean;
  onReasoning: () => void;
  onSelectOption: (i: number) => void;
  onAdapt: () => void;
  onReset: () => void;
  currentBlocks?: TimeBlock[];
}) {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(-1);

  // Reset preview selection when disruption transitions back to impact
  const prevDisruption = props.disruption;
  if (prevDisruption === 'adapted' && selectedPreviewIndex !== -1) {
    setSelectedPreviewIndex(-1);
  }

  const handleSelectOption = (i: number) => {
    setSelectedPreviewIndex(i);
    props.onSelectOption(i);
  };

  if (props.disruption === "adapted") {
    return (
      <div className="glass-panel rise rounded-2xl p-5 ring-1 ring-emerald-500/30">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-white">
            <Check className="size-4" />
          </span>
          <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">Timetable Adapted & Confirmed</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your changes have been applied to your timetable with protected buffers. You remain in full control.
        </p>
        <Button variant="outline" className="mt-4 w-full rounded-xl bg-card/50" onClick={props.onReset}>
          <RotateCcw />Replay Demo Simulation
        </Button>
      </div>
    );
  }

  const previewScenario = selectedPreviewIndex >= 0 ? props.scenarios[selectedPreviewIndex] : undefined;
  const previewDiff = computeDiff(props.currentBlocks ?? [], previewScenario?.blocks ?? []);
  const activeScenario = props.scenarios[props.selectedOption] || props.scenarios[0];

  return (
    <div className="glass-panel rise rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-[9px] font-semibold text-primary">AI</span>
        <p className="font-display text-sm font-bold">Your plan has changed</p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        An emergency sync was added at 17:00. Click each option to preview your day — nothing changes until you apply.
      </p>

      {/* Split layout: option list (left) + preview panel (right) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-3">
        {/* LEFT: Option cards */}
        <div className="space-y-2">
          {props.scenarios.map((scenario, index) => (
            <button
              type="button"
              key={scenario.id}
              onClick={() => handleSelectOption(index)}
              className={`w-full rounded-xl p-3 text-left transition-all ${
                selectedPreviewIndex === index
                  ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/30'
                  : 'border border-border bg-card/40 hover:bg-card/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground">
                  {scenario.tag}
                </span>
                {selectedPreviewIndex === index && (
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-semibold">{scenario.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{scenario.description}</p>
            </button>
          ))}

          {/* Why am I seeing these options? */}
          <button
            type="button"
            onClick={props.onReasoning}
            className="mt-1 flex w-full items-center text-left text-xs font-semibold text-primary hover:underline"
          >
            Why am I seeing these options?
            <ChevronDown className={`ml-auto size-4 transition-transform ${props.reasoningOpen ? 'rotate-180' : ''}`} />
          </button>

          {props.reasoningOpen && (
            <p className="rounded-xl bg-muted/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
              {activeScenario?.highlightText || "Calculated based on your preserved energy spoons and transition preferences."}
            </p>
          )}
        </div>

        {/* RIGHT: Schedule preview panel */}
        <SchedulePreviewPanel
          scenario={previewScenario}
          diff={previewDiff}
          onAdapt={props.onAdapt}
          onReset={props.onReset}
        />
      </div>
    </div>
  );
}

function PlannerView({
  messages,
  thinking,
  pendingActivity,
  pendingConflicts = [],
  recommendedScenario = null,
  alternativeScenarios = [],
  explanation = null,
  pendingScenarios = [],
  currentBlocks = [],
  selectedDate,
  activityAdded,
  onSubmit,
  onSuggestion,
  onAdd,
  onCancel,
  onApplyScenario,
  onUpdatePending,
}: {
  messages: PlannerMessage[];
  thinking: boolean;
  pendingActivity: Omit<TimeBlock, 'id'> | null;
  pendingConflicts?: TimeBlock[];
  recommendedScenario?: ScenarioOption | null;
  alternativeScenarios?: ScenarioOption[];
  explanation?: ExplanationDetails | null;
  pendingScenarios?: ScenarioOption[];
  currentBlocks?: TimeBlock[];
  selectedDate?: string;
  activityAdded: boolean;
  onSubmit: (message: { text: string }) => void;
  onSuggestion: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onApplyScenario?: (scenario: ScenarioOption) => void;
  onUpdatePending?: (updater: (prev: Omit<TimeBlock, 'id'> | null) => Omit<TimeBlock, 'id'> | null) => void;
}) {
  const [inputText, setInputText] = useState("");
  const [showAlternatives, setShowAlternatives] = useState(false);
  const { data: routines = [] } = useRoutinesQuery();

  const recScenario = recommendedScenario || (pendingScenarios.length > 0 ? pendingScenarios[0] : null);
  const altScenarios = alternativeScenarios.length > 0
    ? alternativeScenarios
    : pendingScenarios.slice(1);

  const matchedRoutine = useMemo(() => {
    const clean = inputText.trim().toLowerCase();
    if (clean.length < 2) return null;
    return routines.find((r) => r.enabled && r.title.toLowerCase().includes(clean));
  }, [inputText, routines]);

  const pendingDuplicates = useMemo(() => {
    if (!pendingActivity || !currentBlocks || currentBlocks.length === 0) return [];
    // If pendingActivity targets a different date than selectedDate (which currentBlocks is for), do not warn against today's blocks
    if (pendingActivity.date && selectedDate && pendingActivity.date !== selectedDate) {
      return [];
    }
    const normalizedTitle = pendingActivity.title.trim().toLowerCase();
    return currentBlocks.filter((b) => {
      return (
        b.startTime === pendingActivity.startTime &&
        b.endTime === pendingActivity.endTime &&
        b.title.trim().toLowerCase() === normalizedTitle
      );
    });
  }, [pendingActivity, currentBlocks, selectedDate]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="glass-panel rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Natural Language & Messy Input AI Planner</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">What would you like to add or change?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gõ siêu ngắn không cần ngữ pháp (e.g., <code className="text-xs bg-muted px-1.5 py-0.5 rounded">mai 7h cafe 2h</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">8h java</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">t2 hop 9h</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">cn 14h gym</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">chiều mai đi bơi</code>).
          </p>
        </div>

        <PromptInput onSubmit={(message) => { setInputText(""); onSubmit({ text: message.text }); }} className="rounded-2xl border-border bg-card/70 shadow-sm">
          <PromptInputTextarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="mai 7h cafe 2h, hoặc 8h java, t2 hop 9h, cn 14h gym..."
            className="min-h-28 px-4 text-base"
          />
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton tooltip="Use voice input"><Mic /></PromptInputButton>
              <span className="hidden text-[10px] text-muted-foreground sm:inline">Enter to send · Shift + Enter for a new line</span>
            </PromptInputTools>
            <PromptInputSubmit status={thinking ? "submitted" : "ready"} disabled={thinking} />
          </PromptInputFooter>
        </PromptInput>

        {/* Routine Autocomplete Suggestion */}
        {matchedRoutine && (
          <div className="mt-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
            <span className="text-primary font-medium flex items-center gap-1.5">
              <span>✨ Gợi ý theo thói quen:</span>
              <b>{matchedRoutine.title}</b> ({matchedRoutine.startTime}–{matchedRoutine.endTime})
            </span>
            <button
              type="button"
              onClick={() => {
                const prompt = `mai ${matchedRoutine.startTime} ${matchedRoutine.title}`;
                setInputText("");
                onSubmit({ text: prompt });
              }}
              className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] hover:opacity-90 transition-opacity"
            >
              Lên lịch theo thói quen này ⚡
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal rounded-full bg-card/40 py-2 text-left"
              onClick={() => onSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </section>

      {(messages.length > 0 || thinking) && (
        <section className="glass-panel min-h-[280px] rounded-2xl p-1">
          <Conversation className="h-full">
            <ConversationContent className="gap-4 p-4 sm:p-5">
              {messages.map((message, index) => (
                <Message key={`${message.role}-${index}`} from={message.role} className="max-w-[86%]">
                  <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                    <MessageResponse>{message.text}</MessageResponse>
                  </MessageContent>
                </Message>
              ))}
              {thinking && (
                <Message from="assistant">
                  <MessageContent><Shimmer>Understanding your shorthand request and calculating timetable buffer…</Shimmer></MessageContent>
                </Message>
              )}
              {pendingActivity && (
                <div className="ml-0 max-w-xl rounded-2xl border border-primary/30 bg-primary/10 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">Proposed Timetable Placement</p>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{pendingActivity.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pendingActivity.startTime}–{pendingActivity.endTime} · {pendingActivity.detail}
                      </p>
                      {pendingActivity.date && (
                        <p className="mt-1 font-mono text-xs text-primary font-semibold flex items-center gap-1">
                          📅 {(() => {
                            const todayStr = format(new Date(), 'yyyy-MM-dd');
                            const tm = new Date();
                            tm.setDate(tm.getDate() + 1);
                            const tmStr = format(tm, 'yyyy-MM-dd');
                            if (pendingActivity.date === todayStr) return `Hôm nay (${format(new Date(), 'dd/MM')})`;
                            if (pendingActivity.date === tmStr) return `Ngày mai (${format(tm, 'dd/MM')})`;
                            const parts = pendingActivity.date.split('-');
                            return parts.length === 3 ? `Ngày ${parts[2]}/${parts[1]}/${parts[0]}` : pendingActivity.date;
                          })()}
                        </p>
                      )}
                      <div className="mt-2 flex gap-2 font-mono text-[9px]">
                        <span className="rounded bg-muted px-1.5 py-0.5">Energy: {pendingActivity.energyLevel}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">Alerts: {pendingActivity.reminderMinutesBefore.join(', ')}m before</span>
                      </div>
                    </div>
                    <Coffee className="text-primary" />
                  </div>

                  {/* Interactive Duration Gap-Filling Chips */}
                  {pendingActivity.missingFields?.includes("DURATION") && (
                    <div className="mt-3 pt-3 border-t border-primary/20 animate-in fade-in">
                      <p className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1">
                        ⏱️ Chọn nhanh thời lượng dự kiến:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '30 phút', minutes: 30 },
                          { label: '45 phút', minutes: 45 },
                          { label: '1 tiếng', minutes: 60 },
                          { label: '1.5 tiếng', minutes: 90 },
                          { label: '2 tiếng', minutes: 120 },
                        ].map((d) => (
                          <button
                            key={d.minutes}
                            type="button"
                            onClick={() => {
                              if (!pendingActivity) return;
                              const [sh, sm] = pendingActivity.startTime.split(':').map(Number);
                              const totalEndMin = sh * 60 + sm + d.minutes;
                              const eh = String(Math.floor(totalEndMin / 60) % 24).padStart(2, '0');
                              const em = String(totalEndMin % 60).padStart(2, '0');
                              onUpdatePending?.((prev) => prev ? {
                                ...prev,
                                endTime: `${eh}:${em}`,
                                durationMinutes: d.minutes,
                                missingFields: prev.missingFields?.filter(f => f !== 'DURATION') || [],
                              } : null);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              pendingActivity.durationMinutes === d.minutes
                                ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                : 'bg-card/80 hover:bg-card border-border text-foreground'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Contextual Time Gap-Filling Chips */}
                  {pendingActivity.missingFields?.includes("TIME") && (
                    <div className="mt-3 pt-3 border-t border-primary/20 space-y-2 animate-in fade-in">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                        🕒 Chọn khung giờ bắt đầu phù hợp:
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-12 shrink-0">Sáng:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['08:00', '09:30', '10:30'].map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  if (!pendingActivity) return;
                                  const dur = pendingActivity.durationMinutes || 60;
                                  const [sh, sm] = slot.split(':').map(Number);
                                  const totalEndMin = sh * 60 + sm + dur;
                                  const eh = String(Math.floor(totalEndMin / 60) % 24).padStart(2, '0');
                                  const em = String(totalEndMin % 60).padStart(2, '0');
                                  onUpdatePending?.((prev) => prev ? {
                                    ...prev,
                                    startTime: slot,
                                    endTime: `${eh}:${em}`,
                                    missingFields: prev.missingFields?.filter(f => f !== 'TIME') || [],
                                  } : null);
                                }}
                                className={`px-2 py-0.5 rounded-md text-xs font-mono border transition-colors ${
                                  pendingActivity.startTime === slot
                                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                    : 'bg-card/80 hover:bg-card border-border'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-12 shrink-0">Chiều:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['14:00', '15:30', '17:00'].map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  if (!pendingActivity) return;
                                  const dur = pendingActivity.durationMinutes || 60;
                                  const [sh, sm] = slot.split(':').map(Number);
                                  const totalEndMin = sh * 60 + sm + dur;
                                  const eh = String(Math.floor(totalEndMin / 60) % 24).padStart(2, '0');
                                  const em = String(totalEndMin % 60).padStart(2, '0');
                                  onUpdatePending?.((prev) => prev ? {
                                    ...prev,
                                    startTime: slot,
                                    endTime: `${eh}:${em}`,
                                    missingFields: prev.missingFields?.filter(f => f !== 'TIME') || [],
                                  } : null);
                                }}
                                className={`px-2 py-0.5 rounded-md text-xs font-mono border transition-colors ${
                                  pendingActivity.startTime === slot
                                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                    : 'bg-card/80 hover:bg-card border-border'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-12 shrink-0">Tối:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['18:30', '19:30', '21:00'].map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  if (!pendingActivity) return;
                                  const dur = pendingActivity.durationMinutes || 60;
                                  const [sh, sm] = slot.split(':').map(Number);
                                  const totalEndMin = sh * 60 + sm + dur;
                                  const eh = String(Math.floor(totalEndMin / 60) % 24).padStart(2, '0');
                                  const em = String(totalEndMin % 60).padStart(2, '0');
                                  onUpdatePending?.((prev) => prev ? {
                                    ...prev,
                                    startTime: slot,
                                    endTime: `${eh}:${em}`,
                                    missingFields: prev.missingFields?.filter(f => f !== 'TIME') || [],
                                  } : null);
                                }}
                                className={`px-2 py-0.5 rounded-md text-xs font-mono border transition-colors ${
                                  pendingActivity.startTime === slot
                                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                                    : 'bg-card/80 hover:bg-card border-border'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Schedule Overlap & Conflicts Warning Banner */}
                  {pendingConflicts.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs animate-in fade-in space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                        <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">⚡</span>
                        <span className="text-sm">Lịch trình bị xáo trộn (Schedule Changed)</span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium">
                        Sự kiện <b>"{pendingActivity?.title}" ({pendingActivity?.startTime}–{pendingActivity?.endTime})</b> bị trùng giờ với {pendingConflicts.map((c) => `"${c.title}" (${c.startTime}–${c.endTime})`).join(', ')}.
                      </p>
                    </div>
                  )}

                  {/* Smart Default Adaptation Card (1-Click Primary Flow) */}
                  {pendingConflicts.length > 0 && recScenario && (
                    <div className="mt-4 p-5 rounded-2xl border-2 border-primary/50 bg-primary/5 shadow-md space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs">✦</span>
                          <span className="font-display font-bold text-base text-foreground">Gợi ý điều chỉnh tối ưu (Smart Default)</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold font-mono uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>

                      {/* What will happen */}
                      <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
                        <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider font-mono">Kế hoạch điều chỉnh:</p>
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                          {explanation?.whatWillHappen || recScenario.description}
                        </p>
                      </div>

                      {/* Transparent Why section */}
                      {((explanation?.reasons && explanation.reasons.length > 0) || recScenario.highlightText) && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                            <Lightbulb className="size-3.5 text-amber-500" />
                            Vì sao AI chọn phương án này?
                          </p>
                          <ul className="space-y-1 pl-5 list-disc text-xs text-muted-foreground/90 leading-relaxed">
                            {explanation?.reasons && explanation.reasons.length > 0 ? (
                              explanation.reasons.map((reason, rIdx) => (
                                <li key={rIdx} className="font-medium">
                                  {reason}
                                </li>
                              ))
                            ) : (
                              <li className="font-medium">{recScenario.highlightText}</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* 1-Click Primary Apply Action */}
                      <Button
                        size="lg"
                        className="w-full text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-2 py-5"
                        onClick={() => onApplyScenario?.(recScenario)}
                      >
                        <Zap className="size-4 fill-current" />
                        Áp dụng phương án này (Apply this plan)
                      </Button>

                      {/* Collapsible Alternatives Accordion */}
                      {altScenarios.length > 0 && (
                        <div className="pt-2 border-t border-primary/20">
                          <button
                            type="button"
                            onClick={() => setShowAlternatives((prev) => !prev)}
                            className="flex items-center justify-between w-full py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <ChevronRight className={`size-3.5 transition-transform duration-200 ${showAlternatives ? "rotate-90 text-primary" : ""}`} />
                              Xem các phương án thay thế khác ({altScenarios.length})
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground/70">
                              {showAlternatives ? "Thu gọn" : "Mở rộng"}
                            </span>
                          </button>

                          <AnimatePresence>
                            {showAlternatives && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2.5 pt-3 overflow-hidden"
                              >
                                {altScenarios.map((alt, aIdx) => (
                                  <div
                                    key={alt.id || aIdx}
                                    className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-colors space-y-2"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-xs text-foreground">
                                        {alt.title}
                                      </span>
                                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                                        {alt.tag || "Alternative"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {alt.description}
                                    </p>
                                    {alt.highlightText && (
                                      <p className="text-[11px] text-primary/80 italic">
                                        ✦ {alt.highlightText}
                                      </p>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="w-full text-xs font-semibold rounded-lg mt-1"
                                      onClick={() => onApplyScenario?.(alt)}
                                    >
                                      <Check className="size-3.5 mr-1.5" />
                                      Áp dụng: {alt.title}
                                    </Button>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}

                  {pendingDuplicates.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-700 dark:text-amber-300">Phát hiện trùng lặp hoạt động:</p>
                        <p className="text-[11px] mt-0.5">
                          Hoạt động <b>"{pendingActivity.title}" ({pendingActivity.startTime}–{pendingActivity.endTime})</b> đã có sẵn trong lịch của ngày được chọn.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                    {pendingConflicts.length === 0 ? (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="rounded-lg shadow-sm" onClick={onAdd}>
                          <Check /> Confirm & Add to Timetable
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs text-muted-foreground hover:text-foreground" onClick={onAdd}>
                          Vẫn thêm đè lên lịch
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs" onClick={onCancel}>
                          Hủy bỏ
                        </Button>
                      </div>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Bảo toàn khoảng đệm chuyển tiếp 🧠
                    </span>
                  </div>
                </div>
              )}
              {activityAdded && (
                <div className="rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="mr-2 inline size-4" /> Added to your day! Your existing commitments and transition buffers were preserved.
                </div>
              )}
            </ConversationContent>
          </Conversation>
        </section>
      )}
    </div>
  );
}

function InsightsView() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <section className="glass-panel rounded-2xl p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Daily summary</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold">Your priorities stayed intact.</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Today changed twice. Adaptive helped make room without removing your focus block or evening commitment.
        </p>
        <div className="mt-7 space-y-3">
          <SummaryLine value="5" label="completed activities" />
          <SummaryLine value="2" label="upcoming activities" />
          <SummaryLine value="2" label="schedule changes" />
          <SummaryLine value="1" label="confirmed adaptation" />
        </div>
      </section>
      <section className="space-y-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Preserved</p>
          <h3 className="mt-2 font-display text-lg font-bold">Original priorities</h3>
          <p className="mt-1 text-sm text-muted-foreground">Deep work, study, and your social commitment remained part of the day.</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">Adaptations made</p>
          <div className="mt-3 space-y-3 text-sm">
            <p><strong>1 meeting</strong><span className="text-muted-foreground"> was extended.</span></p>
            <p><strong>1 activity</strong><span className="text-muted-foreground"> was rescheduled with confirmation.</span></p>
            <p><strong>30 minutes</strong><span className="text-muted-foreground"> of transition remained protected.</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryLine({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-xl font-bold">{value}</span>
    </div>
  );
}

function NotificationsView({
  read,
  setRead,
  transitionOn,
  setTransitionOn,
  importantOn,
  setImportantOn,
}: {
  read: number[];
  setRead: (v: number[]) => void;
  transitionOn: boolean;
  setTransitionOn: (v: boolean) => void;
  importantOn: boolean;
  setImportantOn: (v: boolean) => void;
}) {
  const items = [
    { type: "Schedule change", title: "Your 16:30 meeting was extended.", detail: "It now ends at 18:00. Review the impact on your cafe plan.", time: "Just now", tone: "warning" },
    { type: "Transition reminder", title: "Your next activity starts in 15 minutes.", detail: "Wrap up Study by 16:10 to leave a calm transition window.", time: "8 min ago", tone: "transition" },
    { type: "AI suggestion", title: "Three adaptation options are ready.", detail: "Nothing will change until you choose one.", time: "10 min ago", tone: "ai" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        {items.map((item, index) => (
          <div key={item.title} className={`glass-panel rounded-2xl p-5 transition-opacity ${read.includes(index) ? "opacity-55" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 size-2.5 rounded-full ${item.tone === "warning" ? "bg-warning" : item.tone === "transition" ? "bg-emerald-500" : "bg-primary"}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{item.type}</p>
                  <span className="text-[10px] text-muted-foreground">{item.time}</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                {!read.includes(index) && (
                  <Button variant="ghost" size="sm" className="mt-2 px-0 text-primary hover:bg-transparent" onClick={() => setRead([...read, index])}>
                    <Check />Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className="glass-panel h-fit rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Notification preferences</h2>
        <p className="mt-1 text-xs text-muted-foreground">Only hear about changes that matter.</p>
        <div className="mt-5 space-y-4">
          <ToggleRow label="Important changes" checked={importantOn} onChecked={setImportantOn} />
          <ToggleRow label="Transition reminders" checked={transitionOn} onChecked={setTransitionOn} />
          <ToggleRow label="AI suggestions" checked onChecked={() => {}} />
        </div>
        <p className="mt-5 rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
          Adaptive groups low-priority updates so your attention is not constantly interrupted.
        </p>
      </section>
    </div>
  );
}

function SettingsView({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SettingsCard icon={SlidersHorizontal} title="Planning preferences" copy="Buffers, breaks, quiet hours, and confirmation rules." onClick={() => onNavigate("preferences")} />
      <SettingsCard icon={Headphones} title="Desk Companion" copy="Voice reminders and physical companion settings." onClick={() => onNavigate("companion")} />
      <SettingsCard icon={Bell} title="Notifications" copy="Choose the updates that deserve your attention." onClick={() => onNavigate("notifications")} />
      <SettingsCard icon={CircleUserRound} title="Profile" copy="Your name, timezone, and daily rhythm." onClick={() => onNavigate("profile")} />
    </div>
  );
}

function SettingsCard({ icon: Icon, title, copy, onClick }: { icon: typeof Settings2; title: string; copy: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="glass-panel group flex min-h-44 flex-col items-start rounded-2xl p-5 text-left transition-transform hover:-translate-y-0.5">
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon /></span>
      <h2 className="mt-5 font-display text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
      <ChevronRight className="mt-auto ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function PreferencesView({
  voiceOn,
  setVoiceOn,
  askFirst,
  setAskFirst,
  allowSuggestions,
  setAllowSuggestions,
}: {
  voiceOn: boolean;
  setVoiceOn: (v: boolean) => void;
  askFirst: boolean;
  setAskFirst: (v: boolean) => void;
  allowSuggestions: boolean;
  setAllowSuggestions: (v: boolean) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These preferences describe what works for you. Adaptive does not assume one planning style fits every neurodivergent person.
        </p>
        <div className="mt-6 divide-y divide-border">
          <PreferenceSelect label="Transition buffer" value="15 min" options={["10 min", "15 min", "20 min", "30 min"]} />
          <PreferenceSelect label="Travel time" value="20 min" options={["10 min", "20 min", "30 min", "45 min"]} />
          <PreferenceSelect label="Break preference" value="Every 90 min" options={["Every 60 min", "Every 90 min", "Every 120 min"]} />
          <PreferenceSelect label="Maximum difficult tasks per day" value="3" options={["2", "3", "4", "5"]} />
          <PreferenceSelect label="Quiet hours" value="22:00 – 07:00" options={["21:00 – 07:00", "22:00 – 07:00", "23:00 – 08:00"]} />
        </div>
      </section>
      <section className="glass-panel h-fit rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Adaptive behavior</h2>
        <div className="mt-5 space-y-5">
          <ToggleRow label="Voice reminders" checked={voiceOn} onChecked={setVoiceOn} />
          <ToggleRow label="Ask before changing important events" checked={askFirst} onChecked={setAskFirst} />
          <ToggleRow label="Allow AI to suggest schedule changes" checked={allowSuggestions} onChecked={setAllowSuggestions} />
        </div>
        <div className="mt-6 rounded-xl bg-primary/10 p-3">
          <p className="text-xs font-semibold text-primary">You stay in control</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Adaptive can explain and suggest. Important plans only move after you confirm.
          </p>
        </div>
      </section>
    </div>
  );
}

function PreferenceSelect({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium">{label}</span>
      <select defaultValue={value} className="focus-ring rounded-lg border border-border bg-card/70 px-3 py-2 text-sm text-foreground">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ label, checked, onChecked }: { label: string; checked: boolean; onChecked: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChecked} aria-label={label} />
    </div>
  );
}

function CompanionView({
  voiceOn,
  setVoiceOn,
  importantOn,
  setImportantOn,
  transitionOn,
  setTransitionOn,
  testing,
  onTest,
}: {
  voiceOn: boolean;
  setVoiceOn: (v: boolean) => void;
  importantOn: boolean;
  setImportantOn: (v: boolean) => void;
  transitionOn: boolean;
  setTransitionOn: (v: boolean) => void;
  testing: boolean;
  onTest: () => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          <img src={companionImage} alt="Adaptive Desk Companion" width={768} height={768} className="size-full object-cover" />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Connected</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">Stay informed without constantly checking your phone.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Adaptive is ready to notify you with calm, useful voice reminders from your desk.
          </p>
        </div>
      </section>
      <section className="space-y-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">Example voice reminder</p>
          <blockquote className="mt-3 font-display text-lg font-semibold leading-relaxed">
            “Your meeting starts in 15 minutes. You have a 10-minute transition buffer.”
          </blockquote>
          {testing && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <Volume2 className="size-4 animate-pulse" />Playing voice reminder…
            </div>
          )}
          <Button className="mt-5 w-full rounded-xl" onClick={onTest} disabled={testing}>
            <Volume2 />{testing ? "Playing…" : "Test voice reminder"}
          </Button>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <div className="space-y-5">
            <ToggleRow label="Voice reminders" checked={voiceOn} onChecked={setVoiceOn} />
            <ToggleRow label="Important changes" checked={importantOn} onChecked={setImportantOn} />
            <ToggleRow label="Transition reminders" checked={transitionOn} onChecked={setTransitionOn} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">Quiet hours</span>
            <span className="font-mono text-xs text-muted-foreground">22:00 – 07:00</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="glass-panel max-w-2xl rounded-2xl p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <img src={avatarImage} alt="Thai" width={512} height={512} className="size-24 rounded-2xl object-cover ring-1 ring-border" />
        <div>
          <h2 className="font-display text-2xl font-extrabold">Thai Nguyen</h2>
          <p className="mt-1 text-sm text-muted-foreground">Saigon · UTC+7</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Adaptive uses your preferences to reduce planning friction while keeping every important choice yours.
          </p>
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Typical focus window</p>
          <p className="mt-2 font-semibold">90 minutes</p>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Preferred transition</p>
          <p className="mt-2 font-semibold">15–30 minutes</p>
        </div>
      </div>
    </div>
  );
}

function NowDialog({
  open,
  onOpenChange,
  focusStarted,
  onStart,
  onViewPlan,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  focusStarted: boolean;
  onStart: () => void;
  onViewPlan: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">What should I do now?</DialogTitle>
          <DialogDescription>A focused answer based on your current plan.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          <ContextStat label="Current time" value="10:15" />
          <ContextStat label="Current activity" value="Deep Work" />
          <ContextStat label="Available" value="48 min" />
        </div>
        <div className="rounded-xl bg-primary/10 p-4">
          <p className="font-display text-lg font-bold">Continue your focus session.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You have about 48 minutes remaining for Backend Architecture. Remember to take a sensory reset at 11:30.
          </p>
        </div>
        <div className="space-y-2">
          <MiniStep time="NOW" label="Deep Work: Backend Architecture" active />
          <MiniStep time="11:30" label="30 min Sensory Reset Buffer" />
          <MiniStep time="12:00" label="Lunch & Nourishment" />
        </div>
        {focusStarted && (
          <p className="rounded-xl bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <Clock3 className="mr-2 inline size-4" /> Focus timer started · 48:00
          </p>
        )}
        <div className="flex gap-2">
          <Button className="flex-1 rounded-xl" onClick={onStart}>
            <Play />Start focus timer
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={onViewPlan}>
            View today's plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContextStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="font-mono text-[8px] uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold sm:text-sm">{value}</p>
    </div>
  );
}

function MiniStep({ time, label, active = false }: { time: string; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid size-8 place-items-center rounded-full font-mono text-[8px] ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {active ? "NOW" : time.slice(0, 2)}
      </span>
      <div className="flex-1 border-b border-border py-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="font-mono text-[9px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function TransitionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [done, setDone] = useState<string[]>([]);
  const actions = ["Finish current task", "Prepare meeting notes", "Take a short break", "Start meeting early"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upcoming transition</DialogTitle>
          <DialogDescription>This time is intentionally included in your schedule.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-500/10 p-5 text-center">
          <div>
            <p className="font-semibold">Deep Work</p>
            <p className="text-xs text-muted-foreground">until 11:30</p>
          </div>
          <ChevronRight className="text-emerald-500" />
          <div className="rounded-xl bg-card/65 px-3 py-2">
            <p className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">30 MIN</p>
            <p className="text-xs text-muted-foreground">sensory reset</p>
          </div>
          <ChevronRight className="text-emerald-500" />
          <div>
            <p className="font-semibold">Lunch</p>
            <p className="text-xs text-muted-foreground">12:00</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">You have a 30-minute transition window. Choose only what feels useful.</p>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              type="button"
              key={action}
              onClick={() => setDone((current) => current.includes(action) ? current.filter((item) => item !== action) : [...current, action])}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm ${done.includes(action) ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-card/50"}`}
            >
              <span className={`grid size-5 place-items-center rounded-full border ${done.includes(action) ? "border-emerald-500 bg-emerald-500 text-white" : "border-border"}`}>
                {done.includes(action) && <Check className="size-3" />}
              </span>
              {action}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function subtitleFor(view: ViewId) {
  const subtitles: Record<ViewId, string> = {
    today: "",
    calendar: "Browse your schedule without losing the day view.",
    planner: "Add or adjust plans in the words that come naturally.",
    interview: "A simple candidate flow and a structured review space for interviewers.",
    insights: "A calm summary, without scores or pressure.",
    notifications: "Useful updates only—grouped so they do not interrupt your day.",
    settings: "A few clear ways to make Adaptive work for you.",
    profile: "Your planning context and daily rhythm.",
    preferences: "Personalize support without assumptions.",
    companion: "Optional voice support, right where you work.",
  };
  return subtitles[view];
}
