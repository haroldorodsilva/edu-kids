import type { PlayerProfile, PlayerProfileCreate } from '../schemas/users.schema';

const KEY = 'silabrinca_players';

function now() { return new Date().toISOString(); }
function uid() { return `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

export function getPlayers(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayerProfile[]) : [];
  } catch { return []; }
}

function persist(list: PlayerProfile[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* noop */ }
}

export function createPlayer(data: PlayerProfileCreate): PlayerProfile {
  const player: PlayerProfile = {
    ...data,
    id: uid(),
    totalXP: data.totalXP ?? 0,
    avatarEmoji: data.avatarEmoji ?? '🧒',
    parentId: data.parentId ?? null,
    teacherId: data.teacherId ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  const list = [...getPlayers(), player];
  persist(list);
  return player;
}

export function updatePlayer(id: string, patch: Partial<PlayerProfileCreate>): PlayerProfile | null {
  const list = getPlayers();
  const idx = list.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch, updatedAt: now() };
  list[idx] = updated;
  persist(list);
  return updated;
}

export function deletePlayer(id: string) {
  persist(getPlayers().filter(p => p.id !== id));
}

export function getPlayerById(id: string): PlayerProfile | undefined {
  return getPlayers().find(p => p.id === id);
}
