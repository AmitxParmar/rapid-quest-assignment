import type {
  IAddMessageRequest,
  IAddMessageResponse,
} from "@/services/message.service";
import {
  getMessages,
  sendMessage,
  getContacts,
} from "@/services/message.service";
import { useUserStore } from "@/store/useUserStore";
import { Conversation } from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// Fetch messages for a specific conversation using the correct route
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      // getMessages should accept conversationId and page params
      return getMessages(conversationId, { page: pageParam, limit: 10 });
    },
    enabled: !!conversationId,
    getNextPageParam: (lastPage) => {
      // lastPage is expected to be the IMessageResponse
      // API response: lastPage.pagination.hasMore, lastPage.pagination.currentPage, lastPage.pagination.totalPages
      if (
        lastPage?.pagination &&
        lastPage.pagination.hasMore &&
        lastPage.pagination.currentPage < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    retry: 2,

    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
}

// Send a new message and update the cache for the correct conversation

export function useSendMessage() {
  const { activeUser } = useUserStore((state) => state);

  const qc = useQueryClient();
  return useMutation<IAddMessageResponse, unknown, IAddMessageRequest>({
    mutationFn: (data) => sendMessage(data),
    onSuccess: (data, _) => {
      // For useInfiniteQuery, the cached data shape is { pages: [...], pageParams: [...] }
      qc.setQueryData(["messages", data.conversationId], (oldData: any) => {
        // If no oldData or no pages, initialize as a single page with the new message
        if (!oldData || !oldData.pages) {
          return {
            pages: [
              {
                messages: [data.message],
                pagination: {
                  currentPage: 1,
                  totalPages: 1,
                  totalMessages: 1,
                  hasMore: false,
                },
              },
            ],
            pageParams: [1],
          };
        }

        // Add the new message to the beginning of the first page's messages array
        const newPages = oldData.pages.map((page: any, idx: number) => {
          if (idx === 0) {
            const oldMessages = Array.isArray(page.messages)
              ? page.messages
              : [];
            return {
              ...page,
              messages: [data.message, ...oldMessages],
              pagination: {
                ...page.pagination,
                totalMessages: (page.pagination?.totalMessages || 0) + 1,
              },
            };
          }
          return page;
        });

        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Optionally update conversations cache here if needed
      // Update the conversations cache to reflect the new last message and bump the conversation to the top
      qc.setQueryData(
        ["conversations", activeUser.waId],
        (oldConvo: Conversation[] | undefined) => {
          if (!oldConvo) return oldConvo;
          // Find the conversation to update
          const idx = oldConvo.findIndex(
            (convo) => convo._id === data.conversationId
          );
          if (idx === -1) return oldConvo;

          // Update the lastMessage and move the conversation to the top
          const updatedConvo = {
            ...oldConvo[idx],
            lastMessage: data.message,
          };
          return [
            updatedConvo,
            ...oldConvo.slice(0, idx),
            ...oldConvo.slice(idx + 1),
          ];
        }
      );
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
