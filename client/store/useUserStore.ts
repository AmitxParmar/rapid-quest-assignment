import { create } from "zustand";

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
};

export const useUserStore = create<UserStore>((set) => ({
  activeUser: users[0], // set Business Account (me) as default
  setActiveUser: (user) => set({ activeUser: user }),
  activeChatUser: null,
  setActiveChatUser: (user) => set({ activeChatUser: user }),
  setActiveChatUserById: (waId) => {
    const user = users.find((u) => u.waId === waId) || null;
    set({ activeChatUser: user });
  },
  users,
}));
