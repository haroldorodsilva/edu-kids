import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSelectedAge, setSelectedAge as writeSelectedAge } from '../tracks/trackStore';
import type { AgeGroup } from '../tracks/types';

interface SessionState {
  selectedAge: AgeGroup | null;
  setSelectedAge: (age: AgeGroup) => void;
  /** Active player profile ID. 'local' = anonymous/single-player mode. */
  activePlayerId: string;
  setActivePlayerId: (id: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      selectedAge: getSelectedAge(),
      setSelectedAge: (age: AgeGroup) => {
        writeSelectedAge(age);
        set({ selectedAge: age });
      },
      activePlayerId: 'local',
      setActivePlayerId: (id: string) => set({ activePlayerId: id }),
    }),
    {
      name: 'silabrinca_session',
    },
  ),
);
