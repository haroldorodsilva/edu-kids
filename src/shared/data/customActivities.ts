/**
 * Custom activities — admin-created instances of existing game types.
 * Persisted in localStorage so they survive across sessions.
 */
import type { AgeGroup } from '../config/ageGroups';

export type CustomGameType =
  | 'syllable' | 'quiz' | 'fill' | 'memory' | 'write'
  | 'firstletter' | 'buildsentence' | 'matchgame' | 'story';

export interface CustomActivity {
  id: string;
  name: string;
  emoji: string;           // emoji or lucide icon name
  iconMode: 'emoji' | 'lucide';
  gameType: CustomGameType;
  ageGroup: AgeGroup;
  difficulty: 1 | 2 | 3;
  config: {
    /** Specific word IDs to use (empty = use all for difficulty) */
    wordIds: string[];
    /** Filter words by categories (empty = all) */
    wordCategories: string[];
    /** Number of rounds (0 = use game default) */
    rounds: number;
    /** For matchgame — which match game ID to use */
    matchGameId?: string;
    /** For story — which story ID to use */
    storyId?: string;
    /** For story — typing or dictation */
    storyMode?: 'typing' | 'dictation';
  };
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'silabrinca_custom_activities';

// ── Read ──────────────────────────────────────────────────────

export function getCustomActivities(): CustomActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomActivity[];
  } catch {
    return [];
  }
}

export function getActivitiesByAge(ageGroup: AgeGroup): CustomActivity[] {
  return getCustomActivities().filter(a => a.ageGroup === ageGroup);
}

export function getActivityById(id: string): CustomActivity | undefined {
  return getCustomActivities().find(a => a.id === id);
}

// ── Write ─────────────────────────────────────────────────────

function persist(activities: CustomActivity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch { /* quota */ }
}

export function saveCustomActivity(activity: CustomActivity) {
  const all = getCustomActivities();
  const idx = all.findIndex(a => a.id === activity.id);
  if (idx >= 0) {
    all[idx] = { ...activity, updatedAt: Date.now() };
  } else {
    all.push({ ...activity, createdAt: Date.now(), updatedAt: Date.now() });
  }
  persist(all);
}

export function deleteCustomActivity(id: string) {
  persist(getCustomActivities().filter(a => a.id !== id));
}

export function duplicateCustomActivity(id: string): CustomActivity | null {
  const original = getActivityById(id);
  if (!original) return null;
  const copy: CustomActivity = {
    ...original,
    id: `act_${Date.now()}`,
    name: `${original.name} (cópia)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveCustomActivity(copy);
  return copy;
}

// ── Helpers ───────────────────────────────────────────────────

export function newActivityId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyActivity(): CustomActivity {
  return {
    id: newActivityId(),
    name: '',
    emoji: '🎮',
    iconMode: 'emoji',
    gameType: 'syllable',
    ageGroup: 'alpha1',
    difficulty: 1,
    config: {
      wordIds: [],
      wordCategories: [],
      rounds: 0,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Human-readable label for each game type — uses Lucide icon names */
export const GAME_TYPE_LABELS: Record<CustomGameType, { label: string; icon: string }> = {
  syllable:      { label: 'Sílabas',         icon: 'Puzzle' },
  quiz:          { label: 'Quiz Visual',      icon: 'Image' },
  fill:          { label: 'Completar',        icon: 'PencilLine' },
  memory:        { label: 'Memória',          icon: 'Brain' },
  write:         { label: 'Escrever',         icon: 'PenTool' },
  firstletter:   { label: 'Letra Inicial',    icon: 'CaseSensitive' },
  buildsentence: { label: 'Montar Frase',     icon: 'FileText' },
  matchgame:     { label: 'Ligar / Digitar',  icon: 'Link' },
  story:         { label: 'Histórias',        icon: 'BookOpen' },
};
