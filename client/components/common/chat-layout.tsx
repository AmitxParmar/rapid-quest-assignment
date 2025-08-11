"use client";
import React from "react";
import Conversations from "../conversations";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  return (
    <div
      className={
        isMobile
          ? "flex flex-col h-screen w-screen max-h-screen max-w-full overflow-hidden"
          : "grid grid-cols-[1fr_2.4fr] h-screen w-screen max-h-screen max-w-full overflow-hidden"
      }
    >
      <Conversations />
      {children}
    </div>
  );
};

export default ChatLayout;
