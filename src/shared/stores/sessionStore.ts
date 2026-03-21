import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSelectedAge, setSelectedAge as writeSelectedAge } from '../tracks/trackStore';
import type { AgeGroup } from '../tracks/types';

interface SessionState {
  selectedAge: AgeGroup | null;
  setSelectedAge: (age: AgeGroup) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      selectedAge: getSelectedAge(),
      setSelectedAge: (age: AgeGroup) => {
        writeSelectedAge(age);
        set({ selectedAge: age });
      },
    }),
    {
      name: 'silabrinca_session',
    },
  ),
);
