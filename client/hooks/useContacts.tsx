import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContacts,
  addContact,
  searchUsers,
} from "@/services/contacts.service";

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data,
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

export const useSearchUsers = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => searchUsers(query),
    enabled: !!query && enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};
