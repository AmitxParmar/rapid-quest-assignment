import MessageLoader from "../common/message-loader";
import MessageBubble from "./message-bubble";
import { useMessages } from "@/hooks/useMessages";
import { useUserStore } from "@/store/useUserStore";
import { memo, useMemo } from "react";

function ChatContainer({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = useMessages(conversationId);
  const { activeUser } = useUserStore((state) => state);

  // Memoize the rendered message bubbles for performance
  const messageBubbles = useMemo(() => {
    if (!data?.messages) return null;
    return data.messages.map((message) => {
      const isSender = activeUser.waId === message.from;
      const isReceiver = !isSender;
      return (
        <MessageBubble
          key={message._id}
          message={message}
          isSender={isSender}
          isReceiver={isReceiver}
        />
      );
    });
  }, [data?.messages, activeUser.waId]);

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="bg-[url(/chat-bg.png)] bg-fixed fixed h-full w-full opacity-5 !z-0"></div>
      {!isLoading ? (
        <div className="mx-10 my-6 relative bottom-0 z-40">
          <div className="flex w-full">
            <div className="flex flex-col justify-end w-full gap-1 overflow-y-auto px-2 ">
              {messageBubbles}
            </div>
          </div>
        </div>
      ) : (
        <MessageLoader />
      )}
    </div>
  );
}

export default memo(ChatContainer);
