import { create } from "zustand";

type UIState = {
  activeChat: string | null; // wa_id of opened conversation
  setActiveChat: (wa_id: string | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  activeChat: null,
  setActiveChat: (wa_id) => set({ activeChat: wa_id }),
}));
