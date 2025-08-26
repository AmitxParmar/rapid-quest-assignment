import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
  name: string;
  waId: string;
};

const users: User[] = [
  { name: "Business Account (me)", waId: "911234567890" }, // this gonna be default
  { name: "Ravi Kumar", waId: "919937320320" },
  { name: "Neha Joshi", waId: "929967673820" },
];

type UserStore = {
  activeUser: User;
  setActiveUser: (user: User) => void;
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
      activeUser: users[0], // set Business Account (me) as default
      setActiveUser: (user) => set({ activeUser: user }),
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
      partialize: (state) => ({ activeUser: state.activeUser }), // only persist activeUser
    }
  )
);
