import { words as builtinWords } from './words';
import type { Word } from './words';

const KEY = 'silabrinca_custom_words';

export function getCustomWords(): Word[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Word[]) : [];
  } catch { return []; }
}

export function saveCustomWord(word: Word) {
  const existing = getCustomWords();
  existing.push(word);
  try { localStorage.setItem(KEY, JSON.stringify(existing)); } catch { /* noop */ }
}

export function deleteCustomWord(id: string) {
  const updated = getCustomWords().filter(w => w.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function getAllWords(): Word[] {
  return [...builtinWords as unknown as Word[], ...getCustomWords()];
}
