// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Track } from '../types';
import {
  getAllTracks,
  getTracksByAge,
  getTrackById,
  saveTrack,
  deleteTrack,
  getSelectedAge,
  setSelectedAge,
} from '../trackStore';
import { BUILTIN_TRACKS } from '../builtinTracks';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrack(overrides: Partial<Track> = {}): Track {
  return {
    id: 'test-track-1',
    name: 'Trilha Teste',
    ageGroup: '3-4',
    emoji: '🧒',
    color: '#00ff00',
    units: [],
    builtin: false,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const TRACKS_KEY = 'silabrinca_tracks_custom';
const AGE_KEY = 'silabrinca_selected_age';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

describe('getAllTracks', () => {
  it('returns only builtin tracks when no custom tracks exist', () => {
    const all = getAllTracks();
    expect(all).toEqual(BUILTIN_TRACKS);
  });

  it('returns builtin + custom tracks from localStorage', () => {
    const track = makeTrack();
    localStorage.setItem(TRACKS_KEY, JSON.stringify([track]));
    const all = getAllTracks();
    expect(all).toHaveLength(BUILTIN_TRACKS.length + 1);
    expect(all).toContainEqual(track);
  });
});

describe('getTracksByAge', () => {
  it('filters tracks by age group', () => {
    const t1 = makeTrack({ id: 'a', ageGroup: '3-4' });
    const t2 = makeTrack({ id: 'b', ageGroup: '5-6' });
    localStorage.setItem(TRACKS_KEY, JSON.stringify([t1, t2]));

    const builtin34 = BUILTIN_TRACKS.filter(t => t.ageGroup === '3-4');
    const builtin56 = BUILTIN_TRACKS.filter(t => t.ageGroup === '5-6');
    const builtin78 = BUILTIN_TRACKS.filter(t => t.ageGroup === '7-8');

    const result34 = getTracksByAge('3-4');
    expect(result34).toHaveLength(builtin34.length + 1);
    expect(result34).toContainEqual(t1);

    const result56 = getTracksByAge('5-6');
    expect(result56).toHaveLength(builtin56.length + 1);
    expect(result56).toContainEqual(t2);

    expect(getTracksByAge('7-8')).toHaveLength(builtin78.length);
  });
});

describe('getTrackById', () => {
  it('finds a track by id', () => {
    const track = makeTrack({ id: 'find-me' });
    localStorage.setItem(TRACKS_KEY, JSON.stringify([track]));
    expect(getTrackById('find-me')).toEqual(track);
  });

  it('returns undefined for unknown id', () => {
    expect(getTrackById('nope')).toBeUndefined();
  });
});

describe('saveTrack', () => {
  it('adds a new custom track', () => {
    const track = makeTrack();
    saveTrack(track);
    const all = getAllTracks();
    expect(all).toHaveLength(BUILTIN_TRACKS.length + 1);
    expect(all).toContainEqual(track);
  });

  it('updates an existing custom track', () => {
    const track = makeTrack();
    saveTrack(track);
    const updated = { ...track, name: 'Atualizada' };
    saveTrack(updated);
    const all = getAllTracks();
    expect(all).toHaveLength(BUILTIN_TRACKS.length + 1);
    const custom = all.find(t => t.id === track.id);
    expect(custom?.name).toBe('Atualizada');
  });
});

describe('deleteTrack', () => {
  it('removes a custom track by id', () => {
    const track = makeTrack();
    saveTrack(track);
    deleteTrack(track.id);
    expect(getAllTracks()).toHaveLength(BUILTIN_TRACKS.length);
  });

  it('does nothing when id does not exist', () => {
    const track = makeTrack();
    saveTrack(track);
    deleteTrack('nonexistent');
    expect(getAllTracks()).toHaveLength(BUILTIN_TRACKS.length + 1);
  });
});

describe('corrupted data handling', () => {
  it('returns builtin tracks and logs warning for invalid JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(TRACKS_KEY, '{not valid json!!!');
    expect(getAllTracks()).toEqual(BUILTIN_TRACKS);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns builtin tracks and logs warning for non-array JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(TRACKS_KEY, JSON.stringify({ not: 'an array' }));
    expect(getAllTracks()).toEqual(BUILTIN_TRACKS);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('getSelectedAge / setSelectedAge', () => {
  it('returns null when no age is saved', () => {
    expect(getSelectedAge()).toBeNull();
  });

  it('persists and retrieves a valid age group', () => {
    setSelectedAge('5-6');
    expect(getSelectedAge()).toBe('5-6');
  });

  it('returns null for invalid stored value', () => {
    localStorage.setItem(AGE_KEY, 'invalid');
    expect(getSelectedAge()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Progress functions (Task 2.2)
// ---------------------------------------------------------------------------

import {
  getTrackProgress,
  saveTrackLessonResult,
} from '../trackStore';
import type { TrackLessonResult } from '../types';

const PROGRESS_KEY_34 = 'silabrinca_tracks_progress_3-4';
const PROGRESS_KEY_56 = 'silabrinca_tracks_progress_5-6';

function makeLessonResult(overrides: Partial<TrackLessonResult> = {}): TrackLessonResult {
  return {
    stars: 2,
    xp: 10,
    completedAt: new Date().toISOString(),
    errors: 1,
    ...overrides,
  };
}

describe('getTrackProgress', () => {
  it('returns empty array when no progress exists', () => {
    expect(getTrackProgress('3-4')).toEqual([]);
  });

  it('returns progress from localStorage for the correct age group', () => {
    const progress = [{
      id: 'progress-t1',
      trackId: 't1',
      ageGroup: '3-4' as const,
      completedLessons: {},
      totalXP: 0,
      lastPlayedAt: new Date().toISOString(),
      version: 1,
    }];
    localStorage.setItem(PROGRESS_KEY_34, JSON.stringify(progress));
    expect(getTrackProgress('3-4')).toEqual(progress);
    expect(getTrackProgress('5-6')).toEqual([]);
  });

  it('returns empty array and warns on corrupted data', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(PROGRESS_KEY_34, 'not json');
    expect(getTrackProgress('3-4')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns empty array and warns on non-array JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(PROGRESS_KEY_34, JSON.stringify({ bad: true }));
    expect(getTrackProgress('3-4')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('saveTrackLessonResult', () => {
  it('creates a new progress entry when none exists for the track', () => {
    const track = makeTrack({ id: 'track-a', ageGroup: '3-4' });
    saveTrack(track);

    const result = makeLessonResult({ xp: 15 });
    saveTrackLessonResult('track-a', 'lesson-1', result);

    const progress = getTrackProgress('3-4');
    expect(progress).toHaveLength(1);
    expect(progress[0].trackId).toBe('track-a');
    expect(progress[0].completedLessons['lesson-1']).toEqual(result);
    expect(progress[0].totalXP).toBe(15);
  });

  it('adds lesson result to existing progress entry', () => {
    const track = makeTrack({ id: 'track-b', ageGroup: '5-6' });
    saveTrack(track);

    saveTrackLessonResult('track-b', 'lesson-1', makeLessonResult({ xp: 10 }));
    saveTrackLessonResult('track-b', 'lesson-2', makeLessonResult({ xp: 20 }));

    const progress = getTrackProgress('5-6');
    expect(progress).toHaveLength(1);
    expect(Object.keys(progress[0].completedLessons)).toHaveLength(2);
    expect(progress[0].totalXP).toBe(30);
  });

  it('overwrites previous result for the same lesson and recalculates XP', () => {
    const track = makeTrack({ id: 'track-c', ageGroup: '3-4' });
    saveTrack(track);

    saveTrackLessonResult('track-c', 'lesson-1', makeLessonResult({ xp: 10 }));
    saveTrackLessonResult('track-c', 'lesson-1', makeLessonResult({ xp: 25 }));

    const progress = getTrackProgress('3-4');
    expect(progress).toHaveLength(1);
    expect(progress[0].completedLessons['lesson-1'].xp).toBe(25);
    expect(progress[0].totalXP).toBe(25);
  });

  it('does nothing when track does not exist', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    saveTrackLessonResult('nonexistent', 'lesson-1', makeLessonResult());
    expect(getTrackProgress('3-4')).toEqual([]);
    expect(getTrackProgress('5-6')).toEqual([]);
    expect(getTrackProgress('7-8')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('stores progress under the correct age-group key in localStorage', () => {
    const track34 = makeTrack({ id: 'track-34', ageGroup: '3-4' });
    const track56 = makeTrack({ id: 'track-56', ageGroup: '5-6' });
    saveTrack(track34);
    saveTrack(track56);

    saveTrackLessonResult('track-34', 'l1', makeLessonResult({ xp: 5 }));
    saveTrackLessonResult('track-56', 'l1', makeLessonResult({ xp: 8 }));

    // Verify localStorage keys directly
    const raw34 = localStorage.getItem(PROGRESS_KEY_34);
    const raw56 = localStorage.getItem(PROGRESS_KEY_56);
    expect(raw34).not.toBeNull();
    expect(raw56).not.toBeNull();

    const parsed34 = JSON.parse(raw34!);
    const parsed56 = JSON.parse(raw56!);
    expect(parsed34).toHaveLength(1);
    expect(parsed34[0].trackId).toBe('track-34');
    expect(parsed56).toHaveLength(1);
    expect(parsed56[0].trackId).toBe('track-56');
  });
});

// ---------------------------------------------------------------------------
// Rotation functions (Task 2.3)
// ---------------------------------------------------------------------------

import {
  getRotationHistory,
  recordRotation,
} from '../trackStore';

const ROTATION_KEY = 'silabrinca_tracks_rotation';

describe('getRotationHistory', () => {
  it('returns empty object when no rotation history exists', () => {
    expect(getRotationHistory()).toEqual({});
  });

  it('returns rotation history from localStorage', () => {
    const history = { 'lesson-1': ['quiz', 'memory'] };
    localStorage.setItem(ROTATION_KEY, JSON.stringify(history));
    expect(getRotationHistory()).toEqual(history);
  });

  it('returns empty object and warns on corrupted JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(ROTATION_KEY, 'not valid json');
    expect(getRotationHistory()).toEqual({});
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns empty object and warns on non-object JSON (array)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(ROTATION_KEY, JSON.stringify(['not', 'an', 'object']));
    expect(getRotationHistory()).toEqual({});
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('recordRotation', () => {
  it('creates a new entry for a lesson that has no history', () => {
    recordRotation('lesson-1', 'quiz');
    const history = getRotationHistory();
    expect(history['lesson-1']).toEqual(['quiz']);
  });

  it('appends game type to existing lesson history', () => {
    recordRotation('lesson-1', 'quiz');
    recordRotation('lesson-1', 'memory');
    recordRotation('lesson-1', 'fill');
    const history = getRotationHistory();
    expect(history['lesson-1']).toEqual(['quiz', 'memory', 'fill']);
  });

  it('keeps separate histories for different lessons', () => {
    recordRotation('lesson-a', 'quiz');
    recordRotation('lesson-b', 'memory');
    recordRotation('lesson-a', 'fill');
    const history = getRotationHistory();
    expect(history['lesson-a']).toEqual(['quiz', 'fill']);
    expect(history['lesson-b']).toEqual(['memory']);
  });

  it('persists to localStorage under the correct key', () => {
    recordRotation('lesson-x', 'syllable');
    const raw = localStorage.getItem(ROTATION_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed['lesson-x']).toEqual(['syllable']);
  });
});


// ---------------------------------------------------------------------------
// Export / Import functions (Task 2.4)
// ---------------------------------------------------------------------------

import {
  exportAllData,
  importData,
} from '../trackStore';

describe('exportAllData', () => {
  it('exports empty state as valid JSON with correct structure', () => {
    const json = exportAllData();
    const data = JSON.parse(json);
    expect(data).toHaveProperty('customTracks');
    expect(data).toHaveProperty('progress');
    expect(data).toHaveProperty('rotationHistory');
    expect(data.customTracks).toEqual([]);
    expect(data.progress).toEqual({ '3-4': [], '5-6': [], '7-8': [], '9-10': [] });
    expect(data.rotationHistory).toEqual({});
  });

  it('includes custom tracks in export', () => {
    const track = makeTrack({ id: 'export-t1' });
    saveTrack(track);
    const data = JSON.parse(exportAllData());
    expect(data.customTracks).toHaveLength(1);
    expect(data.customTracks[0].id).toBe('export-t1');
  });

  it('includes progress for all age groups', () => {
    const track34 = makeTrack({ id: 'exp-34', ageGroup: '3-4' });
    const track56 = makeTrack({ id: 'exp-56', ageGroup: '5-6' });
    saveTrack(track34);
    saveTrack(track56);
    saveTrackLessonResult('exp-34', 'l1', makeLessonResult({ xp: 10 }));
    saveTrackLessonResult('exp-56', 'l2', makeLessonResult({ xp: 20 }));

    const data = JSON.parse(exportAllData());
    expect(data.progress['3-4']).toHaveLength(1);
    expect(data.progress['5-6']).toHaveLength(1);
    expect(data.progress['7-8']).toEqual([]);
  });

  it('includes rotation history', () => {
    recordRotation('lesson-exp', 'quiz');
    recordRotation('lesson-exp', 'memory');
    const data = JSON.parse(exportAllData());
    expect(data.rotationHistory['lesson-exp']).toEqual(['quiz', 'memory']);
  });
});

describe('importData', () => {
  it('returns error for invalid JSON', () => {
    const result = importData('{not valid');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns error for non-object JSON (array)', () => {
    const result = importData('[]');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Formato inválido');
  });

  it('returns error for non-object JSON (string)', () => {
    const result = importData('"hello"');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Formato inválido');
  });

  it('returns error when customTracks is missing', () => {
    const result = importData(JSON.stringify({ progress: {}, rotationHistory: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('customTracks');
  });

  it('returns error when customTracks is not an array', () => {
    const result = importData(JSON.stringify({ customTracks: 'bad', progress: {}, rotationHistory: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('customTracks');
  });

  it('returns error when progress is missing', () => {
    const result = importData(JSON.stringify({ customTracks: [], rotationHistory: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('progress');
  });

  it('returns error when progress is not an object', () => {
    const result = importData(JSON.stringify({ customTracks: [], progress: 'bad', rotationHistory: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('progress');
  });

  it('returns error when rotationHistory is missing', () => {
    const result = importData(JSON.stringify({ customTracks: [], progress: {} }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('rotationHistory');
  });

  it('returns error when a progress age group value is not an array', () => {
    const result = importData(JSON.stringify({
      customTracks: [],
      progress: { '3-4': 'bad' },
      rotationHistory: {},
    }));
    expect(result.success).toBe(false);
    expect(result.error).toContain('3-4');
  });

  it('successfully imports valid data and replaces existing state', () => {
    // Pre-populate some data
    saveTrack(makeTrack({ id: 'old-track' }));
    recordRotation('old-lesson', 'quiz');

    const importTrack = makeTrack({ id: 'imported-track', name: 'Importada' });
    const importProgress = [{
      id: 'progress-imported',
      trackId: 'imported-track',
      ageGroup: '3-4' as const,
      completedLessons: {},
      totalXP: 50,
      lastPlayedAt: new Date().toISOString(),
      version: 1,
    }];
    const importRotation = { 'lesson-imp': ['fill', 'write'] };

    const json = JSON.stringify({
      customTracks: [importTrack],
      progress: { '3-4': importProgress, '5-6': [], '7-8': [] },
      rotationHistory: importRotation,
    });

    const result = importData(json);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    // Verify data was replaced (builtin + 1 imported custom)
    const tracks = getAllTracks();
    expect(tracks).toHaveLength(BUILTIN_TRACKS.length + 1);
    expect(tracks.find(t => t.id === 'imported-track')).toBeDefined();

    const progress = getTrackProgress('3-4');
    expect(progress).toHaveLength(1);
    expect(progress[0].totalXP).toBe(50);

    const rotation = getRotationHistory();
    expect(rotation['lesson-imp']).toEqual(['fill', 'write']);
    expect(rotation['old-lesson']).toBeUndefined();
  });

  it('round-trips: export then import produces equivalent state', () => {
    // Set up state
    const track = makeTrack({ id: 'rt-track', ageGroup: '5-6' });
    saveTrack(track);
    saveTrackLessonResult('rt-track', 'rt-lesson', makeLessonResult({ xp: 42 }));
    recordRotation('rt-lesson', 'syllable');

    const exported = exportAllData();

    // Clear everything
    localStorage.clear();

    const result = importData(exported);
    expect(result.success).toBe(true);

    // Verify state matches (builtin + 1 custom)
    expect(getAllTracks()).toHaveLength(BUILTIN_TRACKS.length + 1);
    expect(getAllTracks().find(t => t.id === 'rt-track')).toBeDefined();
    expect(getTrackProgress('5-6')).toHaveLength(1);
    expect(getTrackProgress('5-6')[0].completedLessons['rt-lesson'].xp).toBe(42);
    expect(getRotationHistory()['rt-lesson']).toEqual(['syllable']);
  });

  it('clears progress for age groups not present in import', () => {
    // Pre-populate progress for 7-8
    const track78 = makeTrack({ id: 'pre-78', ageGroup: '7-8' });
    saveTrack(track78);
    saveTrackLessonResult('pre-78', 'l1', makeLessonResult({ xp: 5 }));

    const json = JSON.stringify({
      customTracks: [],
      progress: { '3-4': [] },
      rotationHistory: {},
    });

    const result = importData(json);
    expect(result.success).toBe(true);

    // 7-8 progress should be cleared since it wasn't in the import
    expect(getTrackProgress('7-8')).toEqual([]);
  });
});
