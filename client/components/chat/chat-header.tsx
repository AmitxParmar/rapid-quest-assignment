import { FileVideoCamera, Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

function ChatHeader() {
  return (
    <div className="h-16 min-w-full w-full px-4 py-3 flex justify-between items-center z-10 shadow-sm">
      <div className="flex min-w-full items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* Change this later which image */}
          <Avatar>
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-primary-strong">+91 12345 12334</span>
            <span className="text-muted-foreground text-sm">online</span>
          </div>
        </div>
        <div className="flex items-center">
          <FileVideoCamera className="cursor-pointer text-xl" />
          <Search className="text-panel-header-icon cursor-pointer text-xl" />
          <Menu
            className="text-panel-header-icon cursor-pointer text-xl"
            id="context-opener"
          />
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
