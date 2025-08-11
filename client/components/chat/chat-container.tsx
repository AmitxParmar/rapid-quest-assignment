import MessageLoader from "../common/message-loader";
import MessageBubble from "./message-bubble";
import { useMessages } from "@/hooks/useMessages";
import { useUserStore } from "@/store/useUserStore";
import { memo, useMemo } from "react";

function ChatContainer({ conversationId }: { conversationId: string }) {
  const { data, isLoading } = useMessages(conversationId);
  const { activeUser } = useUserStore((state) => state);
  console.log("check msgs", data);

  // Memoize the rendered message bubbles for performance
  const messageBubbles = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null;
    // Each page is expected to be an IMessageResponse, which has a .messages array
    return data.pages.flatMap((page) =>
      page.messages.map((message) => {
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
      })
    );
  }, [data?.pages, activeUser.waId]);

  return (
    <div
      className="
        h-[80vh] w-full relative flex-grow
        overflow-y-auto
        overflow-x-hidden
        custom-scrollbar
      
        bg-background
      "
      style={{
        // Prevent horizontal scroll on all screens
        overscrollBehaviorX: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="bg-[url(/chat-bg.png)] bg-fixed fixed h-full w-full opacity-5 !z-0 pointer-events-none"></div>
      {!isLoading ? (
        <div
          className="
            mx-2 my-2 sm:mx-10 sm:my-6
            relative bottom-0 z-40
          "
        >
          <div className="flex w-full">
            <div
              className="
                flex flex-col justify-end w-full gap-1
                overflow-y-auto
                overflow-x-hidden
                px-1 sm:px-2
                max-w-full
              "
              style={{
                // Prevent horizontal scroll on all screens
                overscrollBehaviorX: "none",
              }}
            >
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
