"use client";
import ChatHeader from "./chat-header";
import ChatContainer from "./chat-container";
import MessageBar from "./message-bar";
import { useIsMobile } from "@/hooks/use-mobile";

function Chat({ conversationId }: { conversationId: string }) {
  const isMobile = useIsMobile();
  return (
    <div className={isMobile ? "grid grid-cols-2" : ""}>
      <div className="w-full flex flex-col h-screen z-10">
        <ChatHeader />
        <ChatContainer conversationId={conversationId} />
        <MessageBar />
      </div>
    </div>
  );
}

export default Chat;
