/**
 * Custom trails — admin-created learning paths that sequence activities.
 * Persisted in localStorage so they survive across sessions.
 */
import type { AgeGroup } from '../config/ageGroups';

export interface CustomTrail {
  id: string;
  name: string;
  emoji: string;
  iconMode: 'emoji' | 'lucide';
  description: string;
  ageGroup: AgeGroup;
  /** Ordered list of custom activity IDs */
  activityIds: string[];
  /** Whether the trail is published (visible to students) */
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'silabrinca_custom_trails';

// ── Read ──────────────────────────────────────────────────────

export function getCustomTrails(): CustomTrail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomTrail[];
  } catch {
    return [];
  }
}

export function getTrailsByAge(ageGroup: AgeGroup): CustomTrail[] {
  return getCustomTrails().filter(t => t.ageGroup === ageGroup && t.published);
}

export function getTrailById(id: string): CustomTrail | undefined {
  return getCustomTrails().find(t => t.id === id);
}

// ── Write ─────────────────────────────────────────────────────

function persist(trails: CustomTrail[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trails));
  } catch { /* quota */ }
}

export function saveCustomTrail(trail: CustomTrail) {
  const all = getCustomTrails();
  const idx = all.findIndex(t => t.id === trail.id);
  if (idx >= 0) {
    all[idx] = { ...trail, updatedAt: Date.now() };
  } else {
    all.push({ ...trail, createdAt: Date.now(), updatedAt: Date.now() });
  }
  persist(all);
}

export function deleteCustomTrail(id: string) {
  persist(getCustomTrails().filter(t => t.id !== id));
}

// ── Helpers ───────────────────────────────────────────────────

export function newTrailId(): string {
  return `trail_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyTrail(): CustomTrail {
  return {
    id: newTrailId(),
    name: '',
    emoji: '🛤️',
    iconMode: 'emoji',
    description: '',
    ageGroup: 'alpha1',
    activityIds: [],
    published: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
