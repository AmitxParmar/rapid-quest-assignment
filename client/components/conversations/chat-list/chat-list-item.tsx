"use client";
import MessageStatus from "@/components/common/message-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { calculateTime } from "@/utils/calculateTime";
import { Camera, Mic } from "lucide-react";
import React from "react";

type ChatListItemProps = {
  data: {
    id: string;
    name: string;
    profilePicture?: string;
    about?: string;
    createdAt?: string;
    totalUnreadMessages?: number;
    senderId?: string;
    messageStatus?: "sent" | "delivered" | "read";
    type?: "text" | "audio" | "image";
    message?: string;
  };
  userInfo?: {
    id: string;
    [key: string]: any;
  };
  isContactsPage?: boolean;
  onClick?: (id: string) => void;
};

// Dummy MessageStatus component

const ChatListItem: React.FC<ChatListItemProps> = ({
  data,
  userInfo,
  isContactsPage = false,
  onClick,
}) => {
  const handleContactClick = () => {
    if (onClick) onClick(data.id);
  };

  return (
    <div className="cursor-pointer my-2" onClick={handleContactClick}>
      <div className="flex rounded-md mx-3   hover:bg-searchbar/50 transition-all">
        <div className="min-w-fit px-4 pb-1 flex items-center">
          <Avatar className="size-11">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </div>
        {/* border should be under this element */}
        <div className="min-h-full border-b -mb-1.5 pb-1 flex flex-col justify-center mt-3 pr-2 w-full">
          <div className="flex justify-between">
            <div>
              <span className="text-primary">{data?.name}</span>
            </div>
            {!isContactsPage && (
              <div>
                <span
                  className={`${
                    (data?.totalUnreadMessages || 0) > 0
                      ? "text-label"
                      : "text-muted-foreground"
                  } text-sm`}
                >
                  {calculateTime(data?.createdAt ?? "")}
                </span>
              </div>
            )}
          </div>
          <div className="flex pb-2 pt-1">
            <div className="flex justify-between w-full">
              <span className="text-muted-foreground line-clamp-1 text-sm">
                {isContactsPage ? (
                  data?.about || "\u00A0"
                ) : (
                  <div
                    className="
                        flex items-center gap-1 max-w-[200px]
                        sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] xl:max-w-[300px]
                      "
                  >
                    {data.senderId === userInfo?.id && (
                      <MessageStatus
                        messageStatus={data?.messageStatus || "sent"}
                      />
                    )}
                    {data.type === "text" && (
                      <span className="truncate ">{data.message}</span>
                    )}
                    {data.type === "audio" && (
                      <span className="flex gap-1 items-center text-muted-foreground">
                        <Mic className="p-0.5" /> Audio
                      </span>
                    )}
                    {data.type === "image" && (
                      <span className="flex gap-1 items-center text-muted-foreground">
                        <Camera className="text-panel-header-icon p-0.5" />{" "}
                        Image
                      </span>
                    )}
                  </div>
                )}
              </span>
              {/* Display unread messages count */}
              <span>
                {(data.totalUnreadMessages || 0) > 0 && (
                  <span className="bg-label px-[5px] rounded-full text-background font-semibold text-sm">
                    {data.totalUnreadMessages}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
