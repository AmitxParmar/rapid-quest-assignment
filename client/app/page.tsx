"use client";
import Chat from "@/components/chat";
import Conversations from "@/components/conversations";
import { useIsMobile } from "./../hooks/use-mobile";
import { useUIStore } from "@/store/uiStore";

export default function Home() {
  const isMobile = useIsMobile();
  const { setActiveChat, activeChat } = useUIStore((state) => state);

  return (
    <div
      className={
        isMobile
          ? "flex flex-col h-screen w-screen max-h-screen max-w-full overflow-hidden"
          : "grid grid-cols-[1fr_2.4fr] h-screen w-screen max-h-screen max-w-full overflow-hidden"
      }
    >
      <Conversations />
      {!isMobile && (
        /* make cols-2 when message search */
        <div className={false ? "grid grid-cols-2" : ""}>
          {(isMobile ? activeChat !== null : true) && <Chat />}
        </div>
      )}
    </div>
  );
}
