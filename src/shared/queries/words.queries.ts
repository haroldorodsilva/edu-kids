import { useQuery, useMutation } from '@tanstack/react-query';
import { words } from '../data/words';
import { getAllWords, saveCustomWord, deleteCustomWord } from '../data/customWords';
import { queryClient } from '../lib/queryClient';
import type { Word } from '../data/words';

// ── Query keys ──────────────────────────────────────────────────────────────

export const wordKeys = {
  all: ['words'] as const,
  byIds: (ids: string[]) => ['words', 'byIds', ids] as const,
};

// ── Query hooks ──────────────────────────────────────────────────────────────

/** Returns all words (builtin + custom) */
export function useWords() {
  return useQuery({
    queryKey: wordKeys.all,
    queryFn: (): Word[] => getAllWords(),
  });
}

/** Returns only the builtin words (static — never refetch) */
export function useBuiltinWords() {
  return useQuery({
    queryKey: ['words', 'builtin'] as const,
    queryFn: (): Word[] => words as unknown as Word[],
    staleTime: Infinity,
  });
}

export function useWordsByIds(ids: string[]) {
  return useQuery({
    queryKey: wordKeys.byIds(ids),
    queryFn: (): Word[] => getAllWords().filter((w) => ids.includes(w.id)),
    enabled: ids.length > 0,
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────

export function useSaveWord() {
  return useMutation({
    mutationFn: (word: Word) => {
      saveCustomWord(word);
      return Promise.resolve(word);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wordKeys.all });
    },
  });
}

export function useDeleteWord() {
  return useMutation({
    mutationFn: (id: string) => {
      deleteCustomWord(id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wordKeys.all });
    },
  });
}
