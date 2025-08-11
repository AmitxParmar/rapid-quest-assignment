import { MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

function ChatHeader({}) {
  return (
    <div className="h-16 min-w-full w-full px-4 py-3 flex justify-between items-center z-10 shadow-sm">
      <div className="flex min-w-full items-center justify-between gap-6">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-primary text-sm">+91 1235 12345</h2>
            <p className="text-sm text-muted-foreground">online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
