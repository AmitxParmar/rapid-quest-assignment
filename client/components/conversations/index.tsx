import React from "react";
import ContactHeader from "./chat-list-header";
import SearchBar from "./search-bar";
import ChatList from "./chat-list";

const Conversations = () => {
  return (
    <div className="border-r flex flex-col max-h-screen z-20">
      <ContactHeader />
      <SearchBar />
      <ChatList />
    </div>
  );
};

export default Conversations;
