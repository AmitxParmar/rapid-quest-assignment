"use client";
import React from "react";
import ChatListItem from "./chat-list-item";
import { useConversations } from "@/hooks/useConversations";

const ChatList = () => {
  const { data: conversations, isLoading, error } = useConversations();

  return (
    <div className="flex-auto overflow-auto max-h-full custom-scrollbar">
      {isLoading ? (
        <ChatListSkeleton />
      ) : conversations && Array.isArray(conversations) ? (
        conversations?.length === 0 ? (
          <NoConversations />
        ) : (
          conversations?.map((contact) => (
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

// Simple skeleton loader for chat list items
const ChatListSkeleton = () => {
  // WhatsApp Web colors
  const bgPrimary = "bg-background"; // chat list background
  const bgSecondary = "bg-background"; // chat item background
  const bg = "bg-wa-info";

  return (
    <div className={`flex flex-col gap-1 px-2 py-2 ${bgPrimary}`}>
      {Array.from({ length: 16 }).map((_, idx) => (
        <div
          key={idx}
          className={`flex min-h-16 items-center border-b gap-3 px-3 py-4 animate-pulse ${bgSecondary}`}
        >
          <div className={`w-12 h-12 rounded-full ${bg}`} />
          <div className="flex-1">
            <div className={`h-4 w-1/2 ${bg} rounded mb-2`} />
            <div className={`h-3 w-1/3 ${bg} rounded`} />
          </div>
        </div>
      ))}
    </div>
  );
};

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
