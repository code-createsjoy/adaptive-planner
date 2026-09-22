import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWeeklyInsights, fetchProgressiveInsights, saveExperimentApi, dismissExperimentApi } from './api';

export function useProgressiveInsights(weekStart?: string) {
  return useQuery({
    queryKey: ['insights', 'progressive', weekStart],
    queryFn: () => fetchProgressiveInsights(weekStart),
    staleTime: 30000,
    retry: 1,
  });
}

export function useWeeklyInsights(weekStart?: string) {
  return useQuery({
    queryKey: ['insights', 'weekly', weekStart],
    queryFn: () => fetchWeeklyInsights(weekStart),
    staleTime: 30000,
    retry: 1,
  });
}

export function useSaveExperimentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveExperimentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'weekly'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDismissExperimentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dismissExperimentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'weekly'] });
    },
  });
}
