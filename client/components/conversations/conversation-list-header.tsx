import { MessageSquarePlus, Moon, MoreVertical, Sun } from "lucide-react";
import AccountSwitcher from "../common/account-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/useUserStore";
import useAuth from "@/hooks/useAuth";

const ContactHeader = () => {
  const { theme, setTheme } = useTheme();
  const { toggleContactList } = useUserStore((state) => state);

  return (
    <header className="h-16 sticky px-4 py-3 md:grid md:grid-cols-2 items-center justify-around">
      <div className="cursor-pointer pl-2.5 hidden md:block text-2xl font-semibold">
        WhatsApp
      </div>
      <div className="flex justify-end-safe md:gap-1 items-center">
        {/* {!isGuest ? null : <AccountSwitcher />} */}
        <div className="flex flex-row items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toggleContactList()}
          >
            <MessageSquarePlus className="cursor-pointer size-6 -scale-x-100" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical
                className="text-panel-header-icon cursor-pointer text-xl"
                id="context-opener"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="min-h-full"
                title="change theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "light" ? <Moon /> : <Sun />} Switch Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ContactHeader;
