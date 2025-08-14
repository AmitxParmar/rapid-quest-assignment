import React from "react";
import ContactHeader from "./conversation-list-header";
import SearchBar from "./search-bar";
import ConversationList from "./conversation-list";

const Conversations = () => {
  return (
    <div className="border-r overflow-auto flex flex-col z-20">
      <ContactHeader />
      <SearchBar />
      <ConversationList />
    </div>
  );
};

export default Conversations;
