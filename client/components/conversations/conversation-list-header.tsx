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

const ContactHeader = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 sticky px-4 py-3 md:grid md:grid-cols-2 items-center">
      <div className="cursor-pointer hidden md:block text-2xl font-semibold">
        WhatsApp
      </div>
      <div className="flex md:gap-6 justify-between items-center">
        <AccountSwitcher />
        <div className="flex flex-row items-center gap-2">
          <MessageSquarePlus className="text-panel-header-icon cursor-pointer text-xl -scale-x-100" />
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
              <Button
                className="min-h-full"
                title="change theme"
                variant={"ghost"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "light" ? <Moon /> : <Sun />} Switch Theme
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default ContactHeader;
