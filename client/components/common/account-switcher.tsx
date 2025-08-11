import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useUserStore } from "@/store/useUserStore";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const AccountSwitcher = () => {
  const { activeUser, setActiveUser, users } = useUserStore();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0"
        >
          <span>{activeUser?.name || "Select Account"}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeUser.waId}
          onValueChange={(waId) => {
            const user = users.find((u) => u.waId === waId);
            if (user) {
              setActiveUser(user);
              // Clear the URL (remove query and path, go to root)
              router.push("/", undefined);
            }
          }}
        >
          {users.map((user) => (
            <DropdownMenuRadioItem key={user.waId} value={user.waId}>
              {user.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountSwitcher;
