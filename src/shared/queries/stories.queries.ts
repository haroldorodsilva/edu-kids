import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAllStories,
  saveCustomStory,
  deleteCustomStory,
} from '../data/customStories';
import { queryClient } from '../lib/queryClient';
import type { Story } from '../data/stories';

// ── Query keys ──────────────────────────────────────────────────────────────

export const storyKeys = {
  all: ['stories'] as const,
};

// ── Query hooks ──────────────────────────────────────────────────────────────

export function useAllStories() {
  return useQuery({
    queryKey: storyKeys.all,
    queryFn: () => getAllStories(),
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────

export function useSaveStory() {
  return useMutation({
    mutationFn: (story: Story) => {
      saveCustomStory(story);
      return Promise.resolve(story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
  });
}

export function useDeleteStory() {
  return useMutation({
    mutationFn: (id: string) => {
      deleteCustomStory(id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
  });
}
