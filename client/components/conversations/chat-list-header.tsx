import React from "react";
import { MessageSquarePlus, MoreVertical } from "lucide-react";
import AccountSwitcher from "../common/account-switcher";

const ContactHeader = () => {
  return (
    <div className="h-16 sticky px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer text-2xl font-semibold">WhatsApp</div>
      <div className="flex gap-6">
        <AccountSwitcher />
        <MessageSquarePlus className="text-panel-header-icon cursor-pointer text-xl -scale-x-100" />
        <MoreVertical
          className="text-panel-header-icon cursor-pointer text-xl"
          id="context-opener"
        />
      </div>
    </div>
  );
};

export default ContactHeader;
