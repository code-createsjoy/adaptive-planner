import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateTimeBlockPayload } from '@/lib/api';
import { TimeBlock, CreateWeeklyRoutinePayload, WeeklyRoutine } from '@/types/planner';
import { usePlannerStore } from '@/store/usePlannerStore';
import { useEffect } from 'react';

export const TIMEBLOCKS_QUERY_KEY = ['timeblocks'];
export const MONTHLY_SUMMARY_KEY = ['monthly-summary'];
export const ROUTINES_QUERY_KEY = ['routines'];
export const HOLIDAYS_QUERY_KEY = ['holidays'];

export function useTimeBlocksQuery(date?: string) {
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const targetDate = date || selectedDate;
  const setTimeBlocks = usePlannerStore((state) => state.setTimeBlocks);

  const query = useQuery({
    queryKey: [...TIMEBLOCKS_QUERY_KEY, targetDate],
    queryFn: async () => {
      try {
        const data = await api.getTimeBlocks(targetDate);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('Backend unavailable, returning empty list:', err);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30s
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setTimeBlocks(query.data);
    }
  }, [query.data, setTimeBlocks]);

  return query;
}

export function useMonthlySummaryQuery(year: number, month: number) {
  return useQuery({
    queryKey: [...MONTHLY_SUMMARY_KEY, year, month],
    queryFn: async () => {
      return await api.getMonthlySummary(year, month);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

export function useRoutinesQuery() {
  return useQuery({
    queryKey: ROUTINES_QUERY_KEY,
    queryFn: async () => {
      return await api.getRoutines();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useHolidaysQuery(year?: number, month?: number) {
  return useQuery({
    queryKey: [...HOLIDAYS_QUERY_KEY, year, month],
    queryFn: async () => {
      return await api.getHolidays(year, month);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });
}

export function useCheckHolidayQuery(date: string) {
  return useQuery({
    queryKey: ['holiday-check', date],
    queryFn: async () => {
      if (!date) return null;
      return await api.checkHoliday(date);
    },
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

export function useCreateRoutineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWeeklyRoutinePayload) => {
      return await api.createRoutines(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useUpdateRoutineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
      updateAllMatching = false,
    }: {
      id: number;
      updates: Partial<WeeklyRoutine>;
      updateAllMatching?: boolean;
    }) => {
      return await api.updateRoutine(id, updates, updateAllMatching);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useToggleRoutineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return await api.toggleRoutine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useDeleteRoutineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return await api.deleteRoutine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useCopyDayRoutinesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fromDay, toDays, overwrite = false }: { fromDay: string; toDays: string[]; overwrite?: boolean }) => {
      return await api.copyDayRoutines(fromDay, toDays, overwrite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useCopyRoutineToDaysMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ routineId, targetDays }: { routineId: number; targetDays: string[] }) => {
      return await api.copyRoutineToDays(routineId, targetDays);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useCancelRoutineForDateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ routineId, date }: { routineId: number; date: string }) => {
      return await api.cancelRoutineForDate(routineId, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function usePauseAllRoutinesForDateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      return await api.pauseAllRoutinesForDate(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useResumeAllRoutinesForDateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      return await api.resumeAllRoutinesForDate(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function usePurgeAllBlocksMutation() {
  const queryClient = useQueryClient();
  const setTimeBlocks = usePlannerStore((state) => state.setTimeBlocks);
  return useMutation({
    mutationFn: async () => {
      return await api.purgeAllBlocks();
    },
    onSuccess: () => {
      setTimeBlocks([]);
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useCreateTimeBlockMutation() {
  const queryClient = useQueryClient();
  const addBlock = usePlannerStore((state) => state.addBlock);

  return useMutation({
    mutationFn: async (payload: CreateTimeBlockPayload) => {
      try {
        return await api.createTimeBlock(payload);
      } catch (err) {
        console.warn('Backend offline, adding block locally:', err);
        addBlock({
          title: payload.title,
          detail: payload.detail,
          startTime: payload.startTime,
          endTime: payload.endTime,
          category: payload.category as any,
          energyLevel: payload.energyLevel as any,
          priority: payload.priority as any,
          reminderMinutesBefore: payload.reminderMinutesBefore || [30, 10, 0],
          isCompleted: false,
          isBufferBlock: payload.isBufferBlock || false,
          microSteps: payload.microSteps || [],
          date: payload.date,
        });
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useDeleteTimeBlockMutation() {
  const queryClient = useQueryClient();
  const deleteBlock = usePlannerStore((state) => state.deleteBlock);

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        return await api.deleteTimeBlock(id);
      } catch (err) {
        console.warn('Backend offline, deleting locally:', err);
        deleteBlock(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useUpdateTimeBlockMutation() {
  const queryClient = useQueryClient();
  const updateBlock = usePlannerStore((state) => state.updateBlock);

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeBlock> }) => {
      try {
        return await api.updateTimeBlock(id, updates);
      } catch (err) {
        console.warn('Backend offline, updating locally:', err);
        updateBlock(id, updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useBatchApplyScenarioMutation() {
  const queryClient = useQueryClient();
  const setTimeBlocks = usePlannerStore((state) => state.setTimeBlocks);
  const setDisruptionState = usePlannerStore((state) => state.setDisruptionState);

  return useMutation({
    mutationFn: async (blocks: TimeBlock[]) => {
      try {
        return await api.batchApplyScenario(blocks);
      } catch (err) {
        console.warn('Backend offline, applying scenario locally:', err);
        setTimeBlocks(blocks);
        setDisruptionState('adapted');
        return blocks;
      }
    },
    onSuccess: (updated) => {
      if (updated) {
        setTimeBlocks(updated);
        setDisruptionState('adapted');
      }
      queryClient.invalidateQueries({ queryKey: TIMEBLOCKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MONTHLY_SUMMARY_KEY });
    },
  });
}

export function useParseIntentMutation() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const result = await api.parseIntent({ prompt });
      return result;
    },
  });
}

export function useRescheduleScenariosMutation() {
  const setScenarios = usePlannerStore((state) => state.setScenarios);
  const setDisruptionState = usePlannerStore((state) => state.setDisruptionState);

  return useMutation({
    mutationFn: async (payload: { urgentEvent: string; targetTime?: string; durationMinutes?: number; currentBlocks: TimeBlock[] }) => {
      return await api.getRescheduleScenarios(payload);
    },
    onSuccess: (data) => {
      if (data && data.scenarios && data.scenarios.length > 0) {
        setScenarios(data.scenarios);
        setDisruptionState('impact');
      }
    },
  });
}

export function useBreakdownTaskMutation() {
  const updateMicroSteps = usePlannerStore((state) => state.updateMicroSteps);

  return useMutation({
    mutationFn: async ({ blockId, taskTitle }: { blockId: string; taskTitle: string }) => {
      const data = await api.breakdownTask(taskTitle);
      return { blockId, microSteps: data.microSteps };
    },
    onSuccess: ({ blockId, microSteps }) => {
      if (microSteps && microSteps.length > 0) {
        updateMicroSteps(blockId, microSteps);
      }
    },
  });
}
