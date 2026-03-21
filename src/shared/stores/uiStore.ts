import { create } from 'zustand';

export type AdminTab = 'dashboard' | 'stories' | 'words' | 'matchgame' | 'tracks' | 'wordsearch';

interface UIState {
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  expandedTrackId: string | null;
  setExpandedTrackId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  adminTab: 'dashboard',
  setAdminTab: (adminTab) => set({ adminTab }),
  expandedTrackId: null,
  setExpandedTrackId: (id) => set({ expandedTrackId: id }),
}));
