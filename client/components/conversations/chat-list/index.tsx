"use client";
import React from "react";
import ChatListItem from "./chat-list-item";
import { useConversations } from "@/hooks/useConversations";

const ChatList = () => {
  const { data: conversations, isLoading, error } = useConversations();

  if (isLoading) return <>Loading</>;
  if (error) return <>{error.message}</>;

  const NoConversations = () => (
    <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
      <svg
        className="w-12 h-12 mb-2 text-gray-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 8h10M7 12h4m-4 4h6m5 4v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12"
        />
      </svg>
      <span className="text-lg font-medium">No conversations</span>
      <span className="text-sm">Start a new chat to see it here.</span>
    </div>
  );
  console.log("convo", conversations);
  return (
    <div className="flex-auto overflow-auto max-h-full custom-scrollbar">
      {conversations && Array.isArray(conversations) ? (
        conversations.length === 0 ? (
          <NoConversations />
        ) : (
          conversations.map((contact) => (
            <ChatListItem key={contact._id} data={contact} />
          ))
        )
      ) : (
        <NoConversations />
      )}
    </div>
  );
};

export default ChatList;
