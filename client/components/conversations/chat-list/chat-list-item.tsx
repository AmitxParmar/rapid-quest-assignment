"use client";
import React, { useCallback, useMemo } from "react";
import MessageStatus from "@/components/common/message-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { calculateTime } from "@/utils/calculateTime";
import { useUserStore } from "./../../../store/useUserStore";
import { getOtherParticipant } from "@/utils";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types";

type ChatListItemProps = {
  data: Conversation;
  isContactsPage?: boolean;
  onClick?: (id: string) => void;
};

const ChatListItem: React.FC<ChatListItemProps> = React.memo(
  ({ data, isContactsPage = false, onClick }) => {
    const router = useRouter();
    const { activeUser } = useUserStore((state) => state);

    // Memoize other participant for performance
    const otherParticipant = useMemo(
      () => getOtherParticipant(data.participants, activeUser),
      [data.participants, activeUser]
    );

    // Memoize unread count
    const unreadCount = useMemo(
      () => data.unreadCount || 0,
      [data.unreadCount]
    );

    // Memoize last message
    const lastMessage = useMemo(() => data.lastMessage, [data.lastMessage]);

    // Memoize time
    const createdAtTime = useMemo(
      () => calculateTime(data?.createdAt ?? ""),
      [data?.createdAt]
    );

    // Handlers
    const handleContactClick = useCallback(
      (e: React.MouseEvent) => {
        // Prevent bubbling to inner click
        if (onClick) onClick(data._id);
      },
      [onClick, data._id]
    );

    const handleConversation = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/conversation/${data.conversationId}`);
      },
      [router, data.conversationId]
    );

    // Render message preview
    const renderMessagePreview = useMemo(() => {
      if (isContactsPage) {
        // No 'about' property, so just show a non-breaking space
        return "\u00A0";
      }

      const isOwnMessage =
        lastMessage?.from === activeUser?.waId &&
        ["sent", "delivered", "read"].includes(lastMessage?.status);

      return (
        <div
          className="
            flex items-center h-8 gap-1 max-w-[200px]
            sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]
          "
        >
          {isOwnMessage && (
            <MessageStatus
              messageStatus={
                (["sent", "delivered", "read"].includes(lastMessage?.status)
                  ? lastMessage?.status
                  : "sent") as "sent" | "delivered" | "read"
              }
            />
          )}
          {lastMessage?.text && (
            <span className="truncate">{lastMessage.text}</span>
          )}
        </div>
      );
    }, [isContactsPage, lastMessage, activeUser?.waId]);

    // Render unread badge
    const renderUnreadBadge = useMemo(() => {
      if (unreadCount > 0) {
        return (
          <span className="bg-label px-[5px] rounded-full text-background font-semibold text-sm">
            {unreadCount}
          </span>
        );
      }
      return null;
    }, [unreadCount]);

    return (
      <div className="cursor-pointer my-2" onClick={handleContactClick}>
        <div
          onClick={handleConversation}
          className="flex rounded-md mx-1 md:mx-3 touch-auto hover:bg-searchbar/50 transition-all"
        >
          <div className="min-w-fit px-2 md:px-4 pb-1 flex items-center">
            <Avatar className="size-11">
              <AvatarFallback>
                {otherParticipant?.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          {/* border should be under this element */}
          <div className="min-h-full border-b -mb-1.5 pb-1 flex flex-col justify-center mt-3 pr-2 w-full">
            <div className="flex justify-between">
              <span className="text-primary">
                {otherParticipant?.name || lastMessage?.from}
              </span>
              {!isContactsPage && (
                <span
                  className={`${
                    unreadCount > 0 ? "text-label" : "text-muted-foreground"
                  } text-sm`}
                >
                  {createdAtTime}
                </span>
              )}
            </div>
            <div className="flex pb-2 pt-1">
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground line-clamp-1 text-sm">
                  {renderMessagePreview}
                </span>
                <span>{renderUnreadBadge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
