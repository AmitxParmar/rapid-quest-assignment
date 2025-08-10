import { calculateTime } from "@/utils/calculateTime";
import MessageStatus from "../common/message-status";

// Dummy user info and chat user
const userInfo = {
  id: "user1",
  name: "You",
};

const currentChatUser = {
  id: "user2",
  name: "Alice",
};

// Helper to map messageStatus to allowed values for MessageStatus component
function mapMessageStatus(
  status: "sent" | "delivered" | "seen"
): "sent" | "delivered" | "read" {
  if (status === "seen") return "read";
  return status;
}

// Dummy messages data
const messages = [
  {
    id: "m1",
    senderId: "user1",
    message: "Hey Alice! How are you?",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: "text",
    messageStatus: "seen" as const,
  },
  {
    id: "m2",
    senderId: "user2",
    message: "Hi! I'm good, thanks. How about you?",
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    type: "text",
    messageStatus: "delivered" as const,
  },
  {
    id: "m3",
    senderId: "user1",
    message: "Doing well! Working on a project.",
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    type: "text",
    messageStatus: "sent" as const,
  },
  {
    id: "m4",
    senderId: "user2",
    message: "That's awesome! Good luck!",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    type: "text",
    messageStatus: "delivered" as const,
  },
];

function ChatContainer() {
  // Add this useEffect to handle incoming messages
  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
      {/* Your existing JSX */}
      <div className="bg-[url(/chat-bg.png)] bg-fixed fixed h-full w-full opacity-5 !z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 z-40">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {messages?.map((message, index) => (
              <div
                key={message.id + index}
                className={`flex ${
                  message.senderId !== currentChatUser?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.type === "text" && (
                  <div
                    className={`text-primary px-4 py-1 text-sm rounded-md flex gap-2 items-end max-w-[45%] ${
                      message.senderId === currentChatUser?.id
                        ? "bg-incoming"
                        : "bg-outgoing"
                    }`}
                  >
                    <span className="break-all leading-7">
                      {message.message}
                    </span>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta text-[11px] pt-1 min-w-fit">
                        {calculateTime(message.createdAt)}
                      </span>
                      <span>
                        {message.senderId === userInfo?.id && (
                          <MessageStatus
                            messageStatus={mapMessageStatus(
                              message.messageStatus
                            )}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
