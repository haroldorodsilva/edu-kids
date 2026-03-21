import { WORD_SEARCH_PUZZLES } from '../../features/games/wordSearchPuzzles';
import type { WordSearchPuzzle } from '../../features/games/wordSearchPuzzles';

export type { WordSearchPuzzle };

const KEY = 'silabrinca_custom_word_search_puzzles';

export function getCustomPuzzles(): WordSearchPuzzle[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WordSearchPuzzle[]) : [];
  } catch { return []; }
}

export function saveCustomPuzzle(puzzle: WordSearchPuzzle) {
  const existing = getCustomPuzzles();
  existing.push(puzzle);
  try { localStorage.setItem(KEY, JSON.stringify(existing)); } catch { /* noop */ }
}

export function deleteCustomPuzzle(id: string) {
  const updated = getCustomPuzzles().filter(p => p.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch { /* noop */ }
}

export function getAllPuzzles(): WordSearchPuzzle[] {
  return [...WORD_SEARCH_PUZZLES, ...getCustomPuzzles()];
}
