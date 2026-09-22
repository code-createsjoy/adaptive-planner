import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccessibilityProfile, OnboardingAnswers } from '@/types/planner';
import { api } from '@/lib/api';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

export function useAccessibilityProfileQuery() {
  const setProfile = useAccessibilityStore((state) => state.setProfile);

  return useQuery<AccessibilityProfile>({
    queryKey: ['accessibility-profile'],
    queryFn: async () => {
      const data = await api.getAccessibilityProfile();
      if (data) {
        setProfile(data);
      }
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateAccessibilityProfileMutation() {
  const queryClient = useQueryClient();
  const setProfile = useAccessibilityStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (profile: Partial<AccessibilityProfile>) => api.updateAccessibilityProfile(profile),
    onSuccess: (updated) => {
      setProfile(updated);
      queryClient.setQueryData(['accessibility-profile'], updated);
      queryClient.invalidateQueries({ queryKey: ['accessibility-profile'] });
    },
  });
}

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();
  const setProfile = useAccessibilityStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (answers: OnboardingAnswers) => api.submitOnboarding(answers),
    onSuccess: (newProfile) => {
      setProfile(newProfile);
      queryClient.setQueryData(['accessibility-profile'], newProfile);
      queryClient.invalidateQueries({ queryKey: ['accessibility-profile'] });
    },
  });
}
