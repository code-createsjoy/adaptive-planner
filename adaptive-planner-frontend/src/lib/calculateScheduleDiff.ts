import { TimeBlock } from '@/types/planner';
import { timeStringToMinutes } from './temporal';

export type DiffChangeType =
  | 'NEW'
  | 'SHIFT_LATER'
  | 'SHIFT_EARLIER'
  | 'COMPRESSED'
  | 'DEFERRED'
  | 'UNCHANGED_PROTECTED'
  | 'UNCHANGED';

export interface ScheduleDiffItem {
  id: string;
  title: string;
  detail?: string;
  category?: string;
  energyLevel?: string;
  oldStartTime?: string;
  oldEndTime?: string;
  newStartTime?: string;
  newEndTime?: string;
  changeType: DiffChangeType;
  deltaMinutes?: number;
  durationDeltaMinutes?: number;
  badgeLabel: string;
  badgeColor: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose' | 'muted';
  explanationReason?: string;
}

export interface ScheduleDiffResult {
  items: ScheduleDiffItem[];
  allBlocksUnderScenario: TimeBlock[];
  hasChanges: boolean;
  totalShiftedCount: number;
  totalCompressedCount: number;
  totalDeferredCount: number;
  newAddedCount: number;
}

function normalizeTitle(title?: string): string {
  return (title || '').trim().toLowerCase();
}

/**
 * Calculates a structured difference between the baseline timetable (currentBlocks)
 * and the proposed scenario timetable (scenarioBlocks).
 */
export function calculateScheduleDiff(
  currentBlocks: TimeBlock[] = [],
  scenarioBlocks: TimeBlock[] = [],
  pendingActivity?: Omit<TimeBlock, 'id'> | null,
  scenarioExplanationBullets?: string[]
): ScheduleDiffResult {
  const items: ScheduleDiffItem[] = [];
  const processedScenarioIds = new Set<string>();

  let totalShiftedCount = 0;
  let totalCompressedCount = 0;
  let totalDeferredCount = 0;
  let newAddedCount = 0;

  // 1. Identify the newly inserted pending activity in the scenario
  if (pendingActivity) {
    const pendingNorm = normalizeTitle(pendingActivity.title);
    const matchedNewInScenario = scenarioBlocks.find(
      (sb) => normalizeTitle(sb.title) === pendingNorm
    );

    const newStart = matchedNewInScenario?.startTime || pendingActivity.startTime;
    const newEnd = matchedNewInScenario?.endTime || pendingActivity.endTime;

    if (matchedNewInScenario?.id) {
      processedScenarioIds.add(matchedNewInScenario.id);
    }

    items.push({
      id: matchedNewInScenario?.id || 'pending-new-block',
      title: pendingActivity.title,
      detail: pendingActivity.detail,
      category: pendingActivity.category,
      energyLevel: pendingActivity.energyLevel,
      newStartTime: newStart,
      newEndTime: newEnd,
      changeType: 'NEW',
      badgeLabel: '➕ Mới thêm',
      badgeColor: 'emerald',
      explanationReason: 'Hoạt động mới được xếp vào lịch trình',
    });
    newAddedCount++;
  }

  // 2. Compare each baseline block against the proposed scenario
  for (const base of currentBlocks) {
    const baseNorm = normalizeTitle(base.title);

    // Find in scenario by ID, sourceRoutineId, or normalized title
    const matched = scenarioBlocks.find((sb) => {
      if (sb.id && base.id && sb.id === base.id) return true;
      if (
        sb.sourceRoutineId &&
        base.sourceRoutineId &&
        sb.sourceRoutineId === base.sourceRoutineId
      ) {
        return true;
      }
      return normalizeTitle(sb.title) === baseNorm;
    });

    if (!matched || matched.status === 'DEFERRED') {
      // Task was moved to Tomorrow or deferred to Inbox
      items.push({
        id: base.id,
        title: base.title,
        detail: base.detail,
        category: base.category,
        energyLevel: base.energyLevel,
        oldStartTime: base.startTime,
        oldEndTime: base.endTime,
        changeType: 'DEFERRED',
        badgeLabel: '📥 Hoãn sang ngày mai',
        badgeColor: 'rose',
        explanationReason: 'Dời sang Tomorrow Inbox để bảo toàn các khung giờ quan trọng',
      });
      totalDeferredCount++;
      continue;
    }

    processedScenarioIds.add(matched.id);

    const oldStartMin = timeStringToMinutes(base.startTime);
    const oldEndMin = timeStringToMinutes(base.endTime);
    const newStartMin = timeStringToMinutes(matched.startTime);
    const newEndMin = timeStringToMinutes(matched.endTime);

    const oldDur = oldEndMin - oldStartMin;
    const newDur = newEndMin - newStartMin;
    const startDelta = newStartMin - oldStartMin;

    if (startDelta > 0) {
      // Shifted later
      items.push({
        id: base.id,
        title: base.title,
        detail: base.detail,
        category: base.category,
        energyLevel: base.energyLevel,
        oldStartTime: base.startTime,
        oldEndTime: base.endTime,
        newStartTime: matched.startTime,
        newEndTime: matched.endTime,
        changeType: 'SHIFT_LATER',
        deltaMinutes: startDelta,
        badgeLabel: `⏳ Dời lùi +${startDelta}p`,
        badgeColor: 'amber',
        explanationReason: `Dời lùi ${startDelta} phút để nhường chỗ cho sự kiện ưu tiên`,
      });
      totalShiftedCount++;
    } else if (startDelta < 0) {
      // Shifted earlier
      const absDelta = Math.abs(startDelta);
      items.push({
        id: base.id,
        title: base.title,
        detail: base.detail,
        category: base.category,
        energyLevel: base.energyLevel,
        oldStartTime: base.startTime,
        oldEndTime: base.endTime,
        newStartTime: matched.startTime,
        newEndTime: matched.endTime,
        changeType: 'SHIFT_EARLIER',
        deltaMinutes: startDelta,
        badgeLabel: `⏩ Dời sớm -${absDelta}p`,
        badgeColor: 'sky',
        explanationReason: `Đẩy sớm ${absDelta} phút vào khoảng trống phù hợp`,
      });
      totalShiftedCount++;
    } else if (newDur < oldDur) {
      // Compressed
      const durDelta = oldDur - newDur;
      items.push({
        id: base.id,
        title: base.title,
        detail: base.detail,
        category: base.category,
        energyLevel: base.energyLevel,
        oldStartTime: base.startTime,
        oldEndTime: base.endTime,
        newStartTime: matched.startTime,
        newEndTime: matched.endTime,
        changeType: 'COMPRESSED',
        durationDeltaMinutes: durDelta,
        badgeLabel: `⚡ Rút ngắn -${durDelta}p`,
        badgeColor: 'violet',
        explanationReason: `Rút ngắn thời lượng để vừa vặn khung thời gian`,
      });
      totalCompressedCount++;
    } else {
      // Unchanged blocks are excluded from diff items so only changed and new blocks are shown
    }
  }

  // 3. Check any other new scenario blocks not captured yet
  for (const sb of scenarioBlocks) {
    if (!processedScenarioIds.has(sb.id) && sb.title !== pendingActivity?.title) {
      items.push({
        id: sb.id,
        title: sb.title,
        detail: sb.detail,
        category: sb.category,
        energyLevel: sb.energyLevel,
        newStartTime: sb.startTime,
        newEndTime: sb.endTime,
        changeType: 'NEW',
        badgeLabel: '➕ Mới thêm',
        badgeColor: 'emerald',
      });
      newAddedCount++;
    }
  }

  const hasChanges =
    totalShiftedCount > 0 ||
    totalCompressedCount > 0 ||
    totalDeferredCount > 0 ||
    newAddedCount > 0;

  return {
    items,
    allBlocksUnderScenario: scenarioBlocks,
    hasChanges,
    totalShiftedCount,
    totalCompressedCount,
    totalDeferredCount,
    newAddedCount,
  };
}
