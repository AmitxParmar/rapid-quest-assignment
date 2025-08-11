import type {
  IAddMessageRequest,
  IAddMessageResponse,
} from "@/services/message.service";
import {
  getMessages,
  sendMessage,
  getContacts,
} from "@/services/message.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Fetch messages for a specific conversation using the correct route
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

// Send a new message and update the cache for the correct conversation

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation<IAddMessageResponse, unknown, IAddMessageRequest>({
    mutationFn: (data) => sendMessage(data),
    onSuccess: (data, _) => {
      // data: IAddMessageResponse, variables: IAddMessageRequest
      qc.setQueryData(["messages", data.conversationId], (oldData: any) => {
        // oldData is expected to be IMessageResponse or undefined
        if (!oldData) {
          return {
            messages: [data.message],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalMessages: 1,
              hasMore: false,
            },
          };
        }
        // If oldData is an IMessageResponse
        return {
          ...oldData,
          messages: [...oldData.messages, data.message],
          pagination: {
            ...oldData.pagination,
            totalMessages: oldData.pagination.totalMessages + 1,
          },
        };
      });
    },
  });
}

// Fetch all contacts
export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
    retry: 2,
  });
}
