import { useQuery } from '@tanstack/react-query';
import { words } from '../data/words';
import type { Word } from '../data/words';

// ── Query keys ──────────────────────────────────────────────────────────────

export const wordKeys = {
  all: ['words'] as const,
  byIds: (ids: string[]) => ['words', 'byIds', ids] as const,
};

// ── Query hooks ──────────────────────────────────────────────────────────────

export function useWords() {
  return useQuery({
    queryKey: wordKeys.all,
    queryFn: (): Word[] => words as unknown as Word[],
    staleTime: Infinity,  // static data — never refetch
  });
}

export function useWordsByIds(ids: string[]) {
  return useQuery({
    queryKey: wordKeys.byIds(ids),
    queryFn: (): Word[] => (words as unknown as Word[]).filter((w) => ids.includes(w.id)),
    staleTime: Infinity,
    enabled: ids.length > 0,
  });
}
