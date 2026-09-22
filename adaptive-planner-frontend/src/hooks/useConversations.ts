import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApplyAdaptationPayload } from '@/lib/api';
import { Conversation, ChatMessage, AdaptationAction, TimeBlock } from '@/types/planner';

export const CONVERSATIONS_QUERY_KEY = ['conversations'];
export const CONVERSATION_DETAIL_KEY = ['conversation'];
export const ADAPTATIONS_QUERY_KEY = ['adaptations'];

export function useConversationsQuery() {
  return useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await api.getConversations();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('Failed to fetch conversations:', err);
        return [];
      }
    },
    staleTime: 1000 * 10,
    retry: false,
  });
}

export function useConversationDetailQuery(id?: number | null) {
  return useQuery({
    queryKey: [...CONVERSATION_DETAIL_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await api.getConversationById(id);
      } catch (err) {
        console.warn(`Failed to fetch conversation ${id}:`, err);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 10,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { title?: string; initialMessage?: Partial<ChatMessage> }) =>
      api.createConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useAppendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: number;
      payload: { role: string; content: string; metadataJson?: string };
    }) => api.appendMessage(conversationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...CONVERSATION_DETAIL_KEY, variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useAdaptationsQuery(date?: string) {
  return useQuery({
    queryKey: [...ADAPTATIONS_QUERY_KEY, date || 'all'],
    queryFn: async () => {
      try {
        const data = await api.getAdaptations(date);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('Failed to fetch adaptations:', err);
        return [];
      }
    },
    staleTime: 1000 * 15,
  });
}

export function useApplyAdaptationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyAdaptationPayload) => api.applyAdaptation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeblocks'] });
      queryClient.invalidateQueries({ queryKey: ADAPTATIONS_QUERY_KEY });
    },
  });
}

export function useUndoAdaptationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: number) => api.undoAdaptation(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeblocks'] });
      queryClient.invalidateQueries({ queryKey: ADAPTATIONS_QUERY_KEY });
    },
  });
}
