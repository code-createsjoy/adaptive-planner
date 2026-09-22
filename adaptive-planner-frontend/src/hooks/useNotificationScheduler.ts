import { useEffect, useRef } from 'react';
import { TimeBlock, NotificationPreferences } from '@/types/planner';
import { getTodayDateString } from '@/store/usePlannerStore';

export interface InAppToast {
  id: string;
  type: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  title: string;
  message: string;
  timeBlockId?: string;
  actionLabel?: string;
  onAction?: () => void;
  createdAt: number;
}

// Convert "HH:mm" string to minutes from start of day
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Format minutes from start of day into "HH:mm"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Gentle Web Audio synthesizer for pleasant notification chime (432Hz harmonic)
function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime); // A4 432Hz
    osc1.frequency.exponentialRampToValueAtTime(864, ctx.currentTime + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(540, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1080, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    osc2.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio context autoplay rejections
  }
}

export function useNotificationScheduler(params: {
  blocks: TimeBlock[];
  selectedDate: string;
  preferences: NotificationPreferences;
  onShowToast: (toast: InAppToast) => void;
  onNavigateToSession?: (blockId: string) => void;
}) {
  const triggeredKeysRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedMinutesRef = useRef<number>(-1);

  const { blocks, selectedDate, preferences, onShowToast, onNavigateToSession } = params;

  // Evaluate upcoming triggers and schedule closest one
  const evaluateAndSchedule = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const todayStr = getTodayDateString();
    // Only schedule proactive timeblock alerts for today's active date
    if (selectedDate !== todayStr) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();
    const nowInExactMinutes = currentMinutes + currentSeconds / 60;

    const leadTime = preferences.remindMinutesBefore || 10;
    let closestTriggerDelayMs: number | null = null;
    let nextScheduledEvent: { key: string; triggerMinutes: number; handler: () => void } | null = null;

    for (const block of blocks) {
      if (block.isCompleted) continue;
      const startMin = timeToMinutes(block.startTime);
      const endMin = timeToMinutes(block.endTime);

      // Event 1: Early Starting Reminder (T - leadTime minutes)
      const earlyTriggerMin = startMin - leadTime;
      const earlyKey = `BLOCK_STARTING:${block.id}:${block.startTime}:${leadTime}m:${selectedDate}`;

      if (earlyTriggerMin >= currentMinutes && !triggeredKeysRef.current.has(earlyKey)) {
        const delayMs = Math.max(200, (earlyTriggerMin - nowInExactMinutes) * 60 * 1000);
        if (closestTriggerDelayMs === null || delayMs < closestTriggerDelayMs) {
          closestTriggerDelayMs = delayMs;
          nextScheduledEvent = {
            key: earlyKey,
            triggerMinutes: earlyTriggerMin,
            handler: () => {
              triggeredKeysRef.current.add(earlyKey);
              const toast: InAppToast = {
                id: earlyKey,
                type: 'BLOCK_STARTING',
                priority: block.priority === 'HIGH' || block.energyLevel === 'high' ? 'HIGH' : 'NORMAL',
                title: `${block.title} bắt đầu sau ${leadTime} phút (${block.startTime})`,
                message: block.detail || 'Chuẩn bị hoàn tất các hoạt động để bước vào ca làm việc.',
                timeBlockId: block.id,
                actionLabel: 'Xem ca làm việc',
                onAction: () => onNavigateToSession?.(block.id),
                createdAt: Date.now(),
              };

              if (preferences.inAppEnabled) onShowToast(toast);
              if (preferences.soundEnabled) playGentleChime();
              if (preferences.browserEnabled && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(toast.title, { body: toast.message });
                } catch {}
              }
            },
          };
        }
      }

      // Event 2: Session Ended Reminder (Prompt checklist review)
      const endKey = `BLOCK_ENDED:${block.id}:${block.endTime}:${selectedDate}`;
      if (endMin >= currentMinutes && !triggeredKeysRef.current.has(endKey)) {
        const delayMs = Math.max(200, (endMin - nowInExactMinutes) * 60 * 1000);
        if (closestTriggerDelayMs === null || delayMs < closestTriggerDelayMs) {
          closestTriggerDelayMs = delayMs;
          nextScheduledEvent = {
            key: endKey,
            triggerMinutes: endMin,
            handler: () => {
              triggeredKeysRef.current.add(endKey);
              const toast: InAppToast = {
                id: endKey,
                type: 'BLOCK_ENDED',
                priority: 'NORMAL',
                title: `Phiên ${block.title} đã kết thúc (${block.endTime})`,
                message: 'Hãy kiểm tra và đánh dấu checklist công việc đã hoàn thành.',
                timeBlockId: block.id,
                actionLabel: 'Mở checklist',
                onAction: () => onNavigateToSession?.(block.id),
                createdAt: Date.now(),
              };

              if (preferences.inAppEnabled) onShowToast(toast);
              if (preferences.soundEnabled) playGentleChime();
            },
          };
        }
      }
    }

    if (nextScheduledEvent && closestTriggerDelayMs !== null) {
      timerRef.current = setTimeout(() => {
        nextScheduledEvent?.handler();
        evaluateAndSchedule(); // Schedule the next one in sequence
      }, closestTriggerDelayMs);
    }

    lastCheckedMinutesRef.current = currentMinutes;
  };

  // Reconcile on foreground wake (laptop open / tab focus)
  useEffect(() => {
    evaluateAndSchedule();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
        const lastMin = lastCheckedMinutesRef.current;
        if (lastMin > 0 && nowMin - lastMin >= 3) {
          // Missed time detected — re-evaluate immediately
          evaluateAndSchedule();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [blocks, selectedDate, preferences]);
}
