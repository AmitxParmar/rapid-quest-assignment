import MessageLoader from "../common/message-loader";
import MessageBubble from "./message-bubble";

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

export type Message = (typeof messages)[0];

function ChatContainer() {
  // Dummy user info and chat user
  const userInfo = {
    id: "user1",
    name: "You",
  };

  return (
    <div className="h-[80vh] w-full relative flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="bg-[url(/chat-bg.png)] bg-fixed fixed h-full w-full opacity-5 !z-0"></div>
      {false ? (
        <div className="mx-10 my-6 relative bottom-0 z-40">
          <div className="flex w-full">
            <div className="flex flex-col justify-end w-full gap-1 overflow-y-auto px-2 ">
              {messages.map((message, index) => {
                const isSender = message.senderId === userInfo.id;
                const isReceiver = !isSender;
                return (
                  <MessageBubble
                    key={message.id + index}
                    message={message}
                    isSender={isSender}
                    isReceiver={isReceiver}
                  />
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <MessageLoader />
      )}
    </div>
  );
}

export default ChatContainer;
