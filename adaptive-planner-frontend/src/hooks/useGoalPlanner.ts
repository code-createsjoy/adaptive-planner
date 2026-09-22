import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ProjectGoal,
  ProjectSubtask,
  GoalDecompositionResponse,
  GoalScenarioOption,
  GoalMilestone,
  GoalRebalanceResponse,
} from '@/types/planner';

const API_BASE = 'http://localhost:8080/api';

export function useProjectGoals() {
  return useQuery<ProjectGoal[]>({
    queryKey: ['projectGoals'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error('Không thể tải danh sách dự án');
      return res.json();
    },
    staleTime: 30000,
  });
}

export function useTodaySubtasks(date?: string) {
  return useQuery<ProjectSubtask[]>({
    queryKey: ['todaySubtasks', date],
    queryFn: async () => {
      const url = date
        ? `${API_BASE}/projects/today?date=${date}`
        : `${API_BASE}/projects/today`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải danh sách subtasks hôm nay');
      return res.json();
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subtaskId,
      completed,
    }: {
      subtaskId: number;
      completed: boolean;
    }) => {
      const res = await fetch(
        `${API_BASE}/projects/subtasks/${subtaskId}/toggle`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed }),
        }
      );
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái subtask');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySubtasks'] });
      queryClient.invalidateQueries({ queryKey: ['projectGoals'] });
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useDecomposeGoal() {
  return useMutation({
    mutationFn: async (payload: {
      prompt: string;
      startDate?: string;
      conversationId?: number;
    }): Promise<GoalDecompositionResponse> => {
      const res = await fetch(`${API_BASE}/planner/goals/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Không thể phân rã mục tiêu');
      return res.json();
    },
  });
}

export function useApplyGoalScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      goalTitle: string;
      officialDeadline: string;
      internalTargetDate: string;
      bufferDays: number;
      conversationId?: number;
      selectedScenario: GoalScenarioOption;
      milestones: GoalMilestone[];
    }): Promise<ProjectGoal> => {
      const res = await fetch(`${API_BASE}/projects/apply-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Không thể áp dụng kịch bản dự án');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectGoals'] });
      queryClient.invalidateQueries({ queryKey: ['todaySubtasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
    },
  });
}

export function useRebalanceGoal() {
  return useMutation({
    mutationFn: async (payload: {
      projectId: number;
      overdueMinutes: number;
      currentDate?: string;
    }): Promise<GoalRebalanceResponse> => {
      const res = await fetch(`${API_BASE}/planner/goals/rebalance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Không thể tạo phương án tái cân bằng');
      return res.json();
    },
  });
}

export function useCompleteGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: number): Promise<ProjectGoal> => {
      const res = await fetch(`${API_BASE}/projects/${goalId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Không thể hoàn tất dự án');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectGoals'] });
      queryClient.invalidateQueries({ queryKey: ['todaySubtasks'] });
      queryClient.invalidateQueries({ queryKey: ['timeBlocks'] });
      queryClient.invalidateQueries({ queryKey: ['adaptations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
