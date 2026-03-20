import { stories } from './stories';
import type { Story } from './stories';

const KEY = 'silabrinca_custom_stories';

export function getCustomStories(): Story[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Story[]) : [];
  } catch { return []; }
}

export function saveCustomStory(story: Story) {
  const existing = getCustomStories();
  existing.push(story);
  try { sessionStorage.setItem(KEY, JSON.stringify(existing)); } catch { /* noop */ }
}

export function deleteCustomStory(id: string) {
  const updated = getCustomStories().filter(s => s.id !== id);
  try { sessionStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function getAllStories(): Story[] {
  return [...stories, ...getCustomStories()];
}
