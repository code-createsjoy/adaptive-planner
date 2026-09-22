import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyCheckin, CyclePrediction, ProactiveAdaptationResponse } from '@/types/planner';
import { api } from '@/lib/api';

export function useDailyCheckinsQuery(startDate: string, endDate: string) {
  return useQuery<DailyCheckin[]>({
    queryKey: ['daily-checkins', startDate, endDate],
    queryFn: () => api.getDailyCheckins(startDate, endDate),
    enabled: Boolean(startDate && endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDailyCheckinByDateQuery(date: string) {
  return useQuery<DailyCheckin | null>({
    queryKey: ['daily-checkin', date],
    queryFn: () => api.getDailyCheckinByDate(date),
    enabled: Boolean(date),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCyclePredictionsQuery() {
  return useQuery<CyclePrediction>({
    queryKey: ['cycle-predictions'],
    queryFn: () => api.getCyclePredictions(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpsertDailyCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DailyCheckin) => api.upsertDailyCheckin(payload),
    onSuccess: (savedCheckin) => {
      queryClient.invalidateQueries({ queryKey: ['daily-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['daily-checkin', savedCheckin.checkinDate] });
      queryClient.invalidateQueries({ queryKey: ['cycle-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
}

export function useDeleteDailyCheckinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) => api.deleteDailyCheckinByDate(date),
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: ['daily-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['daily-checkin', date] });
      queryClient.invalidateQueries({ queryKey: ['cycle-predictions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
}

export function useEvaluateProactiveAdaptationMutation() {
  return useMutation<ProactiveAdaptationResponse, Error, { checkinDate: string; energyLevel?: number; isPeriodDay?: boolean }>({
    mutationFn: (payload) => api.evaluateProactiveAdaptation(payload),
  });
}
