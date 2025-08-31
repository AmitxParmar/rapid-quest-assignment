import { User } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const users: User[] = [
  {
    name: "Business Account (me)",
    waId: "911234567890",
    isOnline: true,
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "Hey there! I am using WhaatsApp.",
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Ravi Kumar",
    waId: "919937320320",
    isOnline: false,
    profilePicture: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "Available",
    lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Neha Joshi",
    waId: "929967673820",
    isOnline: false,
    profilePicture: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "Busy",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type UserStore = {
  users: User[];
  activeChatUser: User | null;
  setActiveChatUser: (user: User) => void;
  setActiveChatUserById: (waId: string) => void;
  isContactListOpen: boolean;
  toggleContactList: () => void;
  setContactListOpen: (open: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      activeChatUser: null,
      setActiveChatUser: (user) => set({ activeChatUser: user }),
      setActiveChatUserById: (waId) => {
        const user = users.find((u) => u.waId === waId) || null;
        set({ activeChatUser: user });
      },
      users,
      isContactListOpen: false,
      toggleContactList: () =>
        set((state) => ({ isContactListOpen: !state.isContactListOpen })),
      setContactListOpen: (open: boolean) => set({ isContactListOpen: open }),
    }),
    {
      name: "active-user-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
