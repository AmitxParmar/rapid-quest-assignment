import {
  fetchAllConversations,
  markMessagesAsRead,
  getConversationId,
} from "@/services/conversations.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "@/lib/api";
import { Conversation, User } from "@/types";
import useAuth from "@/hooks/useAuth";

// Global socket singleton to prevent multiple connections
let globalSocket: Socket | null = null;

function getSocket() {
  if (!globalSocket) {
    const baseURL = api.defaults.baseURL || "http://localhost:5000";
    globalSocket = io(baseURL, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
    });
  }
  return globalSocket;
}

// Fetch all conversations, cache for 1 minute, do not refetch if cached
export function useConversations() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const listenerRef = useRef<((conversation: Conversation) => void) | null>(
    null
  );
  const markAsReadListenerRef = useRef<
    | ((payload: {
        conversationId: string;
        waId: string;
        updatedMessages: number;
        conversation: Conversation;
      }) => void)
    | null
  >(null);

  useEffect(() => {
    // Only run in browser and when activeUser is available
    if (!user?.waId) return;

    const socket = getSocket();

    // Create a unique listener for conversation updates
    const onConversationUpdated = (conversation: Conversation) => {
      console.log("Socket: conversation:updated received:", conversation._id);

      // Update the conversations cache
      qc.setQueryData(
        ["conversations", user.waId],
        (oldConvo: Conversation[] | undefined) => {
          if (!oldConvo) return oldConvo;

          // Find the conversation to update
          const idx = oldConvo.findIndex(
            (convo) => convo._id === conversation._id
          );

          if (idx === -1) {
            // If conversation doesn't exist, add it to the beginning
            return [conversation, ...oldConvo];
          }

          // Update the conversation and move it to the top
          const updatedConvo = {
            ...oldConvo[idx],
            ...conversation,
          };
          return [
            updatedConvo,
            ...oldConvo.slice(0, idx),
            ...oldConvo.slice(idx + 1),
          ];
        }
      );
    };

    // Create a listener for messages marked as read
    const onMessagesMarkedAsRead = (payload: {
      conversationId: string;
      waId: string;
      updatedMessages: number;
      conversation: Conversation;
    }) => {
      console.log("Socket: messages:marked-as-read received:", payload);

      // Update the conversations cache with the updated conversation
      qc.setQueryData(
        ["conversations", user.waId],
        (oldConvo: Conversation[] | undefined) => {
          if (!oldConvo) return oldConvo;

          const idx = oldConvo.findIndex(
            (convo) => convo._id === payload.conversationId
          );

          if (idx === -1) return oldConvo;

          // Update the conversation with new status
          const updatedConvo = {
            ...oldConvo[idx],
            ...payload.conversation,
          };
          return [
            updatedConvo,
            ...oldConvo.slice(0, idx),
            ...oldConvo.slice(idx + 1),
          ];
        }
      );

      // Also update the messages cache to reflect the read status
      qc.setQueryData(["messages", payload.conversationId], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          messages: page.messages.map((msg: any) => {
            if (msg.to === payload.waId && msg.status !== "read") {
              return { ...msg, status: "read" };
            }
            return msg;
          }),
        }));

        return {
          ...oldData,
          pages: newPages,
        };
      });
    };

    // Store the listener references for cleanup
    listenerRef.current = onConversationUpdated;
    markAsReadListenerRef.current = onMessagesMarkedAsRead;

    // Add listeners to socket
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("messages:marked-as-read", onMessagesMarkedAsRead);

    // Cleanup function
    return () => {
      if (listenerRef.current) {
        socket.off("conversation:updated", listenerRef.current);
        listenerRef.current = null;
      }
      if (markAsReadListenerRef.current) {
        socket.off("messages:marked-as-read", markAsReadListenerRef.current);
        markAsReadListenerRef.current = null;
      }
    };
  }, [user?.waId, qc]);

  return useQuery({
    queryKey: ["conversations", user?.waId],
    queryFn: () => fetchAllConversations(),
    retry: 2,
    enabled: !!user?.waId,

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

// Hook to automatically mark messages as read when conversation is opened
export function useAutoMarkAsRead() {
  const { user } = useAuth();
  const markAsReadMutation = useMarkAsRead("auto");

  const markConversationAsRead = (conversationId: string) => {
    if (!user?.waId) return;

    console.log(
      "Auto marking messages as read for conversation:",
      conversationId
    );

    markAsReadMutation.mutate({
      conversationId,
      waId: user.waId,
    });
  };

  return { markConversationAsRead, isLoading: markAsReadMutation.isPending };
}

// Returns a mutation to get or create a conversation ID between two users
export function useGetConversationId({
  from,
  to,
}: {
  from: User["waId"];
  to: User["waId"];
}) {
  return useMutation({
    mutationKey: ["get-conversation-id", from, to],
    mutationFn: async () => {
      // Calls the service to get or create the conversation
      return await getConversationId({ from, to });
    },
  });
}
