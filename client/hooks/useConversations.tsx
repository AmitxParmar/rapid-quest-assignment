import {
  fetchAllConversations,
  markMessagesAsRead,
} from "@/services/conversations.service";
import { useUserStore } from "@/store/useUserStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch all conversations, cache for 1 minute, do not refetch if cached
export function useConversations() {
  const { activeUser } = useUserStore((state) => state);
  return useQuery({
    queryKey: ["conversations", activeUser.waId],
    queryFn: () => fetchAllConversations(activeUser.waId),
    retry: 2,
    enabled: !!activeUser,

    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// Hook to mark all messages as read in a conversation
export function useMarkAsRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["mark-as-read", id],
    mutationFn: ({
      conversationId,
      waId,
    }: {
      conversationId: string;
      waId: string;
    }) => markMessagesAsRead(conversationId, waId),

    onSuccess: (_, { conversationId }) => {
      // Optionally, refetch or update the conversation cache after marking as read
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
}
