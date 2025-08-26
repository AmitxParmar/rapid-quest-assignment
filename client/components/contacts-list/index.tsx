import { useUserStore } from "@/store/useUserStore";
import { ArrowLeft, SearchIcon } from "lucide-react";
import React, { useState, useEffect } from "react";

// Dummy data for contacts grouped by initial letter
const dummyContacts = {
  A: [
    { id: 1, name: "Alice Anderson", status: "Available" },
    { id: 2, name: "Aaron Albert", status: "Busy" },
  ],
  B: [
    { id: 3, name: "Bob Brown", status: "At work" },
    { id: 4, name: "Bella Blue", status: "Offline" },
  ],
  C: [{ id: 5, name: "Charlie Chaplin", status: "Online" }],
};

function ChatListItem({
  data,
}: {
  data: { id: number; name: string; status: string };
}) {
  return (
    <div className="flex items-center px-6 py-3 hover:bg-accent cursor-pointer transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 mr-4">
        {data.name[0]}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-primary truncate">{data.name}</span>
        <span className="text-xs text-muted-foreground truncate">
          {data.status}
        </span>
      </div>
    </div>
  );
}

const ContactList = () => {
  const [allContacts, setAllContacts] = useState(dummyContacts);
  const [searchContacts, setSearchContacts] = useState(dummyContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const { setContactListOpen } = useUserStore((state) => state);

  useEffect(() => {
    const filteredData: typeof dummyContacts = {
      A: [],
      B: [],
      C: [],
    };
    (Object.keys(allContacts) as Array<keyof typeof allContacts>).forEach(
      (key) => {
        filteredData[key] = allContacts[key].filter((obj) =>
          obj.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    );
    setSearchContacts(searchTerm.length ? filteredData : allContacts);
  }, [searchTerm, allContacts]);

  return (
    <div className="flex-auto w-full overflow-auto px-1.5 max-h-full custom-scrollbar">
      <div className="h-full  transition-all min-w-full flex flex-col bg-background">
        <div className="h-24 flex items-end px-3 py-4">
          <div className="flex items-center gap-4 text-lg font-semibold">
            <ArrowLeft
              onClick={() => setContactListOpen(false)}
              className="cursor-pointer text-xl"
            />
            <span>New chat</span>
          </div>
        </div>
        <div className="flex-auto h-full overflow-auto custom-scrollbar bg-search-input-container-background">
          <div className="flex py-3 items-center gap-3 h-14">
            <div className="bg-panel-header-background flex flex-grow items-center gap-5 px-3 py-1 mx-4 rounded-lg">
              <div>
                <SearchIcon className="text-panel-header-icon cursor-pointer text-lg" />
              </div>
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search Contacts"
                  className="bg-transparent w-full text-sm focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          {Object.entries(searchContacts).map(([initialLetter, userList]) => {
            // Only show section if there are users in it
            if (!userList.length) return null;
            return (
              <div key={initialLetter}>
                {searchTerm.length === 0 && (
                  <div className="text-teal-light pl-10 py-2 font-semibold text-xs uppercase tracking-wider">
                    {initialLetter}
                  </div>
                )}
                <div>
                  {userList.map((contact) => (
                    <ChatListItem data={contact} key={contact.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactList;
