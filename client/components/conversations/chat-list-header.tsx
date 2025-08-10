import React from "react";
import { Menu, MessageSquarePlus } from "lucide-react";

const ContactHeader = () => {
  return (
    <div className="h-16 sticky px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer text-2xl font-semibold">WhatsApp</div>
      <div className="flex gap-6">
        <MessageSquarePlus className="text-panel-header-icon cursor-pointer text-xl -scale-x-100" />
        <Menu
          className="text-panel-header-icon cursor-pointer text-xl"
          id="context-opener"
        />
      </div>
    </div>
  );
};

export default ContactHeader;
