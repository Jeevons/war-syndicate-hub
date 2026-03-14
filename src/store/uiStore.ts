import { create } from "zustand";

interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "dark",
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
