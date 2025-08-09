import React from "react";
import ContactHeader from "./contact-header";
import SearchBar from "./search-bar";

const ContactList = () => {
  return (
    <div className="border-r flex flex-col max-h-screen z-20">
      <ContactHeader />
      <SearchBar />
      Contact List
    </div>
  );
};

export default ContactList;
