import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getTracksByAge,
  getTrackById,
  getTrackProgress,
  saveTrack,
  deleteTrack,
  saveTrackLessonResult,
  getRotationHistory,
  recordRotation,
} from '../tracks/trackStore';
import { queryClient } from '../lib/queryClient';
import type { AgeGroup, Track, TrackLessonResult } from '../tracks/types';

// ── Query keys ──────────────────────────────────────────────────────────────

export const trackKeys = {
  all: ['tracks'] as const,
  byAge: (age: AgeGroup) => ['tracks', 'byAge', age] as const,
  byId: (id: string) => ['tracks', 'byId', id] as const,
  progress: (age: AgeGroup) => ['progress', age] as const,
  rotation: () => ['rotation'] as const,
};

// ── Query hooks ──────────────────────────────────────────────────────────────

export function useTracksByAge(age: AgeGroup) {
  return useQuery({
    queryKey: trackKeys.byAge(age),
    queryFn: () => getTracksByAge(age),
  });
}

export function useTrackById(id: string) {
  return useQuery({
    queryKey: trackKeys.byId(id),
    queryFn: () => getTrackById(id) ?? null,
    enabled: Boolean(id),
  });
}

export function useTrackProgress(age: AgeGroup) {
  return useQuery({
    queryKey: trackKeys.progress(age),
    queryFn: () => getTrackProgress(age),
  });
}

export function useRotationHistory() {
  return useQuery({
    queryKey: trackKeys.rotation(),
    queryFn: () => getRotationHistory(),
  });
}

// ── Mutation hooks ───────────────────────────────────────────────────────────

export function useSaveTrack() {
  return useMutation({
    mutationFn: (track: Track) => {
      saveTrack(track);
      return Promise.resolve(track);
    },
    onSuccess: (track) => {
      queryClient.invalidateQueries({ queryKey: trackKeys.byAge(track.ageGroup) });
      queryClient.invalidateQueries({ queryKey: trackKeys.byId(track.id) });
    },
  });
}

export function useDeleteTrack() {
  return useMutation({
    mutationFn: ({ id, ageGroup }: { id: string; ageGroup: AgeGroup }) => {
      deleteTrack(id);
      return Promise.resolve({ id, ageGroup });
    },
    onSuccess: ({ ageGroup, id }) => {
      queryClient.invalidateQueries({ queryKey: trackKeys.byAge(ageGroup) });
      queryClient.removeQueries({ queryKey: trackKeys.byId(id) });
    },
  });
}

export function useSaveTrackLessonResult() {
  return useMutation({
    mutationFn: ({
      trackId,
      lessonId,
      result,
    }: {
      trackId: string;
      lessonId: string;
      result: TrackLessonResult;
    }) => {
      saveTrackLessonResult(trackId, lessonId, result);
      return Promise.resolve({ trackId, lessonId, result });
    },
    onSuccess: (_, vars) => {
      const track = getTrackById(vars.trackId);
      if (track) {
        queryClient.invalidateQueries({ queryKey: trackKeys.progress(track.ageGroup) });
      }
    },
  });
}

export function useRecordRotation() {
  return useMutation({
    mutationFn: ({ lessonId, gameType }: { lessonId: string; gameType: string }) => {
      recordRotation(lessonId, gameType);
      return Promise.resolve({ lessonId, gameType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.rotation() });
    },
  });
}
