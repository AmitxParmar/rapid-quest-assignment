import { getMessages, sendMessage } from "@/services/chat.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Pass userId as an argument to the hook and use it in the query key and API call
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    retry: 2,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { conversationId: string; content: string }) =>
      sendMessage(data),
    onSuccess: (newMessage) => {
      // Add the new message to the cache instead of invalidating
      qc.setQueryData<any[]>(
        ["messages", conversationId],
        (oldMessages = []) => {
          // If oldMessages is not an array, fallback to just the new message
          if (!Array.isArray(oldMessages)) return [newMessage];
          return [...oldMessages, newMessage];
        }
      );
    },
  });
}
