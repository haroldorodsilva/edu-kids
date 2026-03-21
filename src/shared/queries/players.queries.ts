import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getPlayers, createPlayer, updatePlayer, deletePlayer,
} from '../data/customPlayers';
import { queryClient } from '../lib/queryClient';
import type { PlayerProfileCreate } from '../schemas/users.schema';

const PLAYERS_KEY = ['players'] as const;

export function usePlayerProfiles() {
  return useQuery({
    queryKey: PLAYERS_KEY,
    queryFn: () => getPlayers(),
  });
}

export function useCreatePlayer() {
  return useMutation({
    mutationFn: (data: PlayerProfileCreate) => {
      const p = createPlayer(data);
      return Promise.resolve(p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_KEY });
    },
  });
}

export function useUpdatePlayer() {
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PlayerProfileCreate> }) => {
      const updated = updatePlayer(id, patch);
      return Promise.resolve(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_KEY });
    },
  });
}

export function useDeletePlayer() {
  return useMutation({
    mutationFn: (id: string) => {
      deletePlayer(id);
      return Promise.resolve(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYERS_KEY });
    },
  });
}
