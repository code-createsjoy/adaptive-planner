import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationItem, CreateNotificationRequest } from '@/types/planner';
import { api } from '@/lib/api';

export function useNotificationsQuery() {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
    staleTime: 10000,
    refetchInterval: 30000, // Poll backend every 30s for AI/Project notifications
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery<number>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.getUnreadNotificationCount();
      return res.unreadCount;
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteAllReadNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteAllReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateNotificationRequest) => api.createNotification(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
