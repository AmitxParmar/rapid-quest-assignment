import React from "react";
import ChatHeader from "./chat-header";
import ChatContainer from "./chat-container";
import MessageBar from "./message-bar";

function Chat() {
  return (
    <div className="w-full flex flex-col h-screen z-10">
      <ChatHeader />
      <ChatContainer />
      <MessageBar />
    </div>
  );
}

export default Chat;
