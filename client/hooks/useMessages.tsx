import type {
  IAddMessageRequest,
  IAddMessageResponse,
} from "@/services/message.service";
import {
  getMessages,
  sendMessage,
  getContacts,
} from "@/services/message.service";
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
      return getMessages(conversationId, { page: pageParam, limit: 15 });
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
      // For useInfiniteQuery, the cached data shape is { pages: [...], pageParams: [...] }
      qc.setQueryData(["messages", data.conversationId], (oldData: any) => {
        // If no oldData, initialize as a single page
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

        // Add the new message to the last page's messages array
        const newPages = oldData.pages.map((page: any, idx: number) => {
          // Only add to the last page
          if (idx === oldData.pages.length - 1) {
            // Ensure page.messages is an array
            const oldMessages = Array.isArray(page.messages)
              ? page.messages
              : [];
            return {
              ...page,
              messages: [...oldMessages, data.message],
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
