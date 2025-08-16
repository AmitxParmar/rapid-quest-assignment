import MessageLoader from "../common/message-loader";
import MessageBubble from "./message-bubble";
import { useMessages } from "@/hooks/useMessages";
import { useUserStore } from "@/store/useUserStore";
import { memo, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";

/**
 * ChatContainer with reverse scroll (bottom-to-top):
 * - Messages are rendered in normal order, but the container uses flex-col-reverse.
 * - The scroll position is managed so that on mount and when new messages arrive, it stays at the bottom.
 * - "Load More" button appears at the bottom (visually top of the chat).
 */
function ChatContainer({ conversationId }: { conversationId: string }) {
  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversationId);
  const { activeUser } = useUserStore((state) => state);

  // Memoize the rendered message bubbles for performance
  const messageBubbles = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null;
    // Flatten all messages, oldest first, newest last
    return data.pages
      .flatMap((page) => page.messages)
      .map((message, index) => {
        const isSender = activeUser.waId === message.from;
        const isReceiver = !isSender;
        return (
          <MessageBubble
            key={message._id + index}
            message={message}
            isSender={isSender}
            isReceiver={isReceiver}
          />
        );
      });
  }, [data?.pages, activeUser.waId]);

  // Ref for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  // On mount and when messages change, scroll to bottom (which is visually the bottom, but flex-col-reverse makes it the top of the scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Scroll to bottom (which is scrollTop = 0 in flex-col-reverse)
      el.scrollTop = 0;
    }
  }, [conversationId, data?.pages?.length, data?.pages?.[0]?.messages?.length]);

  return (
    <div
      ref={scrollRef}
      className="
      transition-all
      
        h-[80vh] w-full relative flex-grow
        overflow-y-auto
        overflow-x-hidden
        custom-scrollbar
        bg-background
        flex flex-col
      "
      style={{
        overscrollBehaviorX: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="bg-[url(/chat-bg.png)] bg-fixed fixed h-full w-full opacity-5 !z-0 pointer-events-none"></div>
      {/* Message bubbles */}
      {/* Load More Button at the bottom (visually top) */}
      <div className="flex items-center justify-center py-2 z-10">
        <Button
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="text-sm"
        >
          {isFetchingNextPage ? (
            <>
              <span className="mr-2 animate-spin">
                <PlusCircle size={18} />
              </span>
              Loading more...
            </>
          ) : hasNextPage ? (
            <>
              <PlusCircle size={18} className="mr-2" />
              Load More
            </>
          ) : (
            <>
              <XCircle size={18} className="mr-2" />
              No more messages
            </>
          )}
        </Button>
      </div>
      <div className="flex-1 flex flex-col-reverse justify-start w-full gap-1 px-1 sm:px-8 max-w-full relative z-20">
        {messageBubbles}
      </div>
      {/* Loader for isFetching */}
      {isFetching && <MessageLoader />}
    </div>
  );
}

export default memo(ChatContainer);
