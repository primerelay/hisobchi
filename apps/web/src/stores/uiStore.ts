import { create } from 'zustand';

interface UIState {
  isOnline: boolean;
  isSyncing: boolean;
  sidebarOpen: boolean;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: navigator.onLine,
  isSyncing: false,
  sidebarOpen: false,

  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useUIStore.getState().setOnline(true));
  window.addEventListener('offline', () => useUIStore.getState().setOnline(false));
}
