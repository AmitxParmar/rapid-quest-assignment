import { fetchAllConversations } from "@/services/conversations.service";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "@tanstack/react-query";

// Fetch all conversations, cache for 1 minute, do not refetch if cached
export function useConversations() {
  const { activeUser } = useUserStore((state) => state);
  return useQuery({
    queryKey: ["conversations", activeUser.waId],
    queryFn: () => fetchAllConversations(activeUser.waId),
    retry: 2,
    enabled: !!activeUser,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
