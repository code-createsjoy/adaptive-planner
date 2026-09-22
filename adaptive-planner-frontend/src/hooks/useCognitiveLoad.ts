import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CognitiveLoadAssessment, QuickRebalanceProposal } from '@/types/planner';

export function useWorkloadAssessmentQuery(date: string) {
  return useQuery<CognitiveLoadAssessment>({
    queryKey: ['workload-assessment', date],
    queryFn: () => api.getWorkloadAssessment(date),
    enabled: !!date,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useQuickRebalanceOptionsQuery(date: string, enabled: boolean = true) {
  return useQuery<QuickRebalanceProposal>({
    queryKey: ['quick-rebalance-options', date],
    queryFn: () => api.getQuickRebalanceOptions(date),
    enabled: !!date && enabled,
    staleTime: 1000 * 30,
  });
}
