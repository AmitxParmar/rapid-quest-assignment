import React from "react";
import { MessageSquarePlus, MoreVertical } from "lucide-react";
import AccountSwitcher from "../common/account-switcher";

const ContactHeader = () => {
  return (
    <header className="h-16 sticky px-4 py-3 md:grid md:grid-cols-2 items-center">
      <div className="cursor-pointer hidden md:block text-2xl font-semibold">
        WhatsApp
      </div>
      <div className="flex md:gap-6 justify-between items-center">
        <AccountSwitcher />
        <div className="flex flex-row items-center gap-2">
          <MessageSquarePlus className="text-panel-header-icon cursor-pointer text-xl -scale-x-100" />
          <MoreVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            id="context-opener"
          />
        </div>
      </div>
    </header>
  );
};

export default ContactHeader;
