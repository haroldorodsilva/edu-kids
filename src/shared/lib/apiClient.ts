/**
 * Environment-driven API client.
 *
 * When VITE_API_URL is not set → routes through localStorage adapters
 * (zero-network, works offline, current behaviour).
 *
 * When VITE_API_URL is set → routes through fetch to the real REST API.
 * All query hooks remain unchanged — only this file needs updating when
 * the backend is ready.
 */

import {
  getAllTracks, getTracksByAge, getTrackById,
  saveTrack, deleteTrack,
  getTrackProgress, saveTrackLessonResult,
} from '../tracks/trackStore';
import { getAllWords } from '../data/customWords';
import { getAllStories, saveCustomStory, deleteCustomStory } from '../data/customStories';
import type { AgeGroup, Track, TrackLessonResult } from '../tracks/types';
import type { Word } from '../data/words';
import type { Story } from '../data/stories';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

// ── Auth header helper (for future real API) ─────────────────

function authHeaders(): Record<string, string> {
  // Placeholder: replace with real token retrieval when backend exists
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('silabrinca_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Local adapter — maps REST-style paths to localStorage CRUD ─

const localAdapter = {
  async get<T>(path: string): Promise<T> {
    if (path === '/tracks') return getAllTracks() as T;
    if (path.startsWith('/tracks?ageGroup=')) {
      const age = new URLSearchParams(path.split('?')[1]).get('ageGroup') as AgeGroup;
      return getTracksByAge(age) as T;
    }
    if (path.startsWith('/tracks/')) {
      const id = path.replace('/tracks/', '');
      return (getTrackById(id) ?? null) as T;
    }
    if (path.startsWith('/progress?ageGroup=')) {
      const age = new URLSearchParams(path.split('?')[1]).get('ageGroup') as AgeGroup;
      return getTrackProgress(age) as T;
    }
    if (path === '/words') return getAllWords() as T;
    if (path === '/stories') return getAllStories() as T;
    throw new Error(`[localAdapter] Unknown GET path: ${path}`);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    if (path === '/tracks') { saveTrack(body as Track); return body as T; }
    if (path === '/stories') { saveCustomStory(body as Story); return body as T; }
    if (path.match(/^\/progress\/[^/]+\/lessons\/[^/]+$/)) {
      const [, , trackId, , lessonId] = path.split('/');
      saveTrackLessonResult(trackId, lessonId, (body as { result: TrackLessonResult }).result);
      return body as T;
    }
    throw new Error(`[localAdapter] Unknown POST path: ${path}`);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    if (path.startsWith('/tracks/')) { saveTrack(body as Track); return body as T; }
    throw new Error(`[localAdapter] Unknown PUT path: ${path}`);
  },

  async delete<T>(path: string): Promise<T> {
    if (path.startsWith('/tracks/')) {
      const id = path.replace('/tracks/', '');
      deleteTrack(id);
      return null as T;
    }
    if (path.startsWith('/stories/')) {
      const id = path.replace('/stories/', '');
      deleteCustomStory(id);
      return null as T;
    }
    throw new Error(`[localAdapter] Unknown DELETE path: ${path}`);
  },
};

// ── HTTP adapter — calls the real REST API ───────────────────

const httpAdapter = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`API ${res.status} GET ${path}`);
    return res.json() as Promise<T>;
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status} POST ${path}`);
    return res.json() as Promise<T>;
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status} PUT ${path}`);
    return res.json() as Promise<T>;
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`API ${res.status} DELETE ${path}`);
    return (res.status === 204 ? null : res.json()) as Promise<T>;
  },
};

// ── Public API client ─────────────────────────────────────────

export const apiClient = API_URL ? httpAdapter : localAdapter;

// ── Typed convenience wrappers for common endpoints ───────────

export const api = {
  tracks: {
    getAll: () => apiClient.get<Track[]>('/tracks'),
    getByAge: (age: AgeGroup) => apiClient.get<Track[]>(`/tracks?ageGroup=${age}`),
    getById: (id: string) => apiClient.get<Track | null>(`/tracks/${id}`),
    save: (track: Track) => apiClient.put<Track>(`/tracks/${track.id}`, track),
    create: (track: Track) => apiClient.post<Track>('/tracks', track),
    delete: (id: string) => apiClient.delete<void>(`/tracks/${id}`),
  },
  progress: {
    getByAge: (age: AgeGroup) => apiClient.get<TrackLessonResult[]>(`/progress?ageGroup=${age}`),
    saveLesson: (trackId: string, lessonId: string, result: TrackLessonResult) =>
      apiClient.post<void>(`/progress/${trackId}/lessons/${lessonId}`, { result }),
  },
  words: {
    getAll: () => apiClient.get<Word[]>('/words'),
  },
  stories: {
    getAll: () => apiClient.get<Story[]>('/stories'),
    create: (story: Story) => apiClient.post<Story>('/stories', story),
    delete: (id: string) => apiClient.delete<void>(`/stories/${id}`),
  },
};
