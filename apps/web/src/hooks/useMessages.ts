import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useSocket } from "@/app/Providers/SocketProvider";
import type { SocketMessage } from "@/types/socket.types";

/** Fetch message history for a project (REST). */
export function useMessages(projectId: string) {
  return useQuery<SocketMessage[]>({
    queryKey: ["messages", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/messages`);
      return data.messages;
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30s — socket keeps it fresh
  });
}

/** Send a message via REST (socket broadcast handles the live update). */
export function useSendMessage(projectId: string) {
  const queryClient = useQueryClient();
  const { sendStopTyping } = useSocket();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/projects/${projectId}/messages`, { content });
      return data.message as SocketMessage;
    },
    onSuccess: (message) => {
      // Optimistically add before socket echo arrives
      queryClient.setQueryData<SocketMessage[]>(
        ["messages", projectId],
        (old = []) => {
          const exists = old.some((m) => m.id === message.id);
          return exists ? old : [...old, message];
        }
      );
      sendStopTyping(projectId);
    },
  });
}

/** Delete a message. */
export function useDeleteMessage(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData<SocketMessage[]>(
        ["messages", projectId],
        (old = []) => old.filter((m) => m.id !== messageId)
      );
    },
  });
}

/** Read the typing indicator for a project room. */
export function useTypingUsers(projectId: string): string[] {
  const queryClient = useQueryClient();
  return (queryClient.getQueryData<string[]>(["typing", projectId]) ?? []);
}
