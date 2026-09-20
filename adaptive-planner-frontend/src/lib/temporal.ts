import { TimeBlock } from '@/types/planner';

/**
 * Converts "HH:mm" (24h) string to total minutes from 00:00 (e.g. "21:30" -> 1290)
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts total minutes from 00:00 back to "HH:mm" string (e.g. 1290 -> "21:30")
 */
export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, Math.floor(totalMinutes)) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export interface TimelineTemporalState {
  currentTimeFormatted: string;
  currentDateFormatted: string;
  nowInMinutes: number;
  activeBlock: TimeBlock | null;
  nextBlock: TimeBlock | null;
  pastBlocks: TimeBlock[];
  upcomingBlocks: TimeBlock[];
  isFreeTime: boolean;
  freeMinutesRemaining: number;
  progressPercent: number;
  remainingMinutes: number;
  isTransitionWarning: boolean; // True when active block <= 10m remaining
}

/**
 * Pure calculation of timeline temporal states based on current device Date and list of TimeBlocks
 */
export function calculateTimelineState(
  blocks: TimeBlock[],
  currentDate: Date = new Date()
): TimelineTemporalState {
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  const nowInMinutes = currentHours * 60 + currentMinutes;

  const currentTimeFormatted = `${currentHours.toString().padStart(2, '0')}:${currentMinutes
    .toString()
    .padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;

  const currentDateFormatted = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Sort blocks chronologically
  const sortedBlocks = [...blocks].sort(
    (a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
  );

  let activeBlock: TimeBlock | null = null;
  let nextBlock: TimeBlock | null = null;
  const pastBlocks: TimeBlock[] = [];
  const upcomingBlocks: TimeBlock[] = [];

  for (const block of sortedBlocks) {
    const start = timeStringToMinutes(block.startTime);
    const end = timeStringToMinutes(block.endTime);

    if (nowInMinutes >= start && nowInMinutes < end) {
      activeBlock = block;
    } else if (nowInMinutes >= end) {
      pastBlocks.push(block);
    } else if (nowInMinutes < start) {
      upcomingBlocks.push(block);
      if (!nextBlock) {
        nextBlock = block;
      }
    }
  }

  // Calculate progress and remaining minutes for active block
  let progressPercent = 0;
  let remainingMinutes = 0;
  let isTransitionWarning = false;

  if (activeBlock) {
    const start = timeStringToMinutes(activeBlock.startTime);
    const end = timeStringToMinutes(activeBlock.endTime);
    const totalDuration = Math.max(1, end - start);
    const elapsed = Math.max(0, nowInMinutes - start);

    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    remainingMinutes = Math.max(0, end - nowInMinutes);
    isTransitionWarning = remainingMinutes > 0 && remainingMinutes <= 10;
  }

  // Free time calculation
  const isFreeTime = activeBlock === null;
  let freeMinutesRemaining = 0;

  if (isFreeTime && nextBlock) {
    const nextStart = timeStringToMinutes(nextBlock.startTime);
    freeMinutesRemaining = Math.max(0, nextStart - nowInMinutes);
  } else if (isFreeTime && !nextBlock && sortedBlocks.length > 0) {
    // End of day
    freeMinutesRemaining = 0;
  }

  return {
    currentTimeFormatted,
    currentDateFormatted,
    nowInMinutes,
    activeBlock,
    nextBlock,
    pastBlocks,
    upcomingBlocks,
    isFreeTime,
    freeMinutesRemaining,
    progressPercent,
    remainingMinutes,
    isTransitionWarning,
  };
}
