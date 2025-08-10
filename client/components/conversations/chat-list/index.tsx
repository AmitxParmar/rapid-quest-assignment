"use client";
import React from "react";
import ChatListItem from "./chat-list-item";

const dummyContacts = [
  {
    id: "1",
    name: "Alice Smith",
    profilePicture: "",
    about: "Hey there! I am using ChatApp.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    totalUnreadMessages: 2,
    senderId: "1",
    messageStatus: "read" as const,
    type: "text" as const,
    message: "Hello! How are you?",
  },
  {
    id: "2",
    name: "Bob Johnson",
    profilePicture: "",
    about: "Available",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    totalUnreadMessages: 0,
    senderId: "2",
    messageStatus: "read" as const,
    type: "audio" as const,
    message: "",
  },
  {
    id: "3",
    name: "Charlie Brown",
    profilePicture: "",
    about: "Busy",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    totalUnreadMessages: 5,
    senderId: "3",
    messageStatus: "sent" as const,
    type: "image" as const,
    message: "",
  },
];

const dummyUserInfo = {
  id: "1",
  name: "Alice Smith",
};

const ChatList = () => {
  return (
    <div className="flex-auto overflow-auto max-h-full custom-scrollbar">
      {dummyContacts?.map((contact) => (
        <ChatListItem
          key={contact.id}
          data={contact}
          userInfo={dummyUserInfo}
        />
      ))}
    </div>
  );
};

export default ChatList;
