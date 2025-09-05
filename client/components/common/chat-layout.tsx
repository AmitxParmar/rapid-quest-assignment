"use client";
import React from "react";
import Conversations from "../conversations";
import { useIsMobile } from "@/hooks/use-mobile";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const { isAuthenticated, isLoading } = useAuth();

  // Handle authentication redirect in useEffect to avoid render-time navigation

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render the chat layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={
        isMobile
          ? "flex flex-col h-full w-screen max-h-screen max-w-full overflow-hidden"
          : "grid grid-cols-[1fr_2.4fr] h-full w-screen max-w-full overflow-hidden"
      }
    >
      <Conversations />
      {children}
    </div>
  );
};

export default ChatLayout;
