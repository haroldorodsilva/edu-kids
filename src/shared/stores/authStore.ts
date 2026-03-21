import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../schemas/auth.schema';

// ── Mock user database ────────────────────────────────────────────────────────
// Replace with real API call when VITE_API_URL is set.
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: '1',
    username: 'admin',
    displayName: 'Administrador',
    role: 'admin',
    password: 'silabrinca2025',
  },
  {
    id: '2',
    username: 'professor',
    displayName: 'Professor Demo',
    role: 'teacher',
    password: 'silabrinca2025',
  },
  {
    id: '3',
    username: 'responsavel',
    displayName: 'Responsável Demo',
    role: 'parent',
    password: 'silabrinca2025',
  },
];

interface AuthState {
  user: AuthUser | null;
  /** Returns the authenticated user on success, null on failure. */
  login: (username: string, password: string) => AuthUser | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: (username, password) => {
        const found = MOCK_USERS.find(
          (u) => u.username === username && u.password === password,
        );
        if (!found) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...user } = found;
        set({ user });
        return user;
      },

      logout: () => set({ user: null }),
    }),
    { name: 'silabrinca_auth' },
  ),
);
