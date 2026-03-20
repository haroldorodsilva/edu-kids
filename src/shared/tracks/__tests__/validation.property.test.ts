// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { AgeGroup, Track, TrackGameType, TrackActivity, TrackLesson, TrackUnit } from '../types';
import { validateTrack } from '../../../features/admin/TrackEditor';
import { BUILTIN_TRACKS } from '../builtinTracks';
import { words } from '../../data/words';
import { stories } from '../../data/stories';
import { sentences } from '../../data/sentences';
import { getMatchGames } from '../../data/matchGames';

/**
 * **Validates: Requirements 7.5**
 *
 * Property 11: Minimum lesson validation
 * - A track where all lessons have >= 1 activity passes validation (returns null)
 * - A track where any lesson has 0 activities fails validation (returns non-null error string)
 * - A track with no units fails validation
 * - A track with empty name fails validation
 */

// --- Arbitraries ---

const ageGroupArb: fc.Arbitrary<AgeGroup> = fc.constantFrom('3-4', '5-6', '7-8');

const gameTypeArb: fc.Arbitrary<TrackGameType> = fc.constantFrom(
  'syllable', 'quiz', 'fill', 'memory', 'write',
  'firstletter', 'buildsentence', 'story', 'matchgame',
);

const trackActivityArb: fc.Arbitrary<TrackActivity> = fc.record({
  id: fc.uuid(),
  gameType: gameTypeArb,
  wordIds: fc.array(fc.uuid(), { minLength: 0, maxLength: 3 }),
});

const hexColorArb = fc.integer({ min: 0, max: 0xffffff })
  .map((n) => `#${n.toString(16).padStart(6, '0')}`);

const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map((ts) => new Date(ts).toISOString());

/** Non-blank string (at least one non-whitespace char) */
const nonBlankStringArb = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0);

/** Lesson with at least 1 activity (valid) */
const validLessonArb: fc.Arbitrary<TrackLesson> = fc.record({
  id: fc.uuid(),
  title: nonBlankStringArb,
  emoji: fc.constantFrom('📚', '🎮', '✏️', '🧩'),
  activities: fc.array(trackActivityArb, { minLength: 1, maxLength: 5 }),
});

/** Lesson with exactly 0 activities (invalid) */
const emptyLessonArb: fc.Arbitrary<TrackLesson> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  emoji: fc.constantFrom('📚', '🎮', '✏️', '🧩'),
  activities: fc.constant([]),
});

/** Unit with all valid lessons */
const validUnitArb: fc.Arbitrary<TrackUnit> = fc.record({
  id: fc.uuid(),
  title: nonBlankStringArb,
  subtitle: fc.string({ minLength: 1, maxLength: 30 }),
  emoji: fc.constantFrom('🔤', '🎨', '🔢'),
  color: hexColorArb,
  bg: hexColorArb,
  lessons: fc.array(validLessonArb, { minLength: 1, maxLength: 5 }),
});

/** Build a fully valid track */
const validTrackArb: fc.Arbitrary<Track> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  ageGroup: ageGroupArb,
  emoji: fc.constantFrom('🧒', '👦', '👧'),
  color: hexColorArb,
  units: fc.array(validUnitArb, { minLength: 1, maxLength: 3 }),
  builtin: fc.boolean(),
  version: fc.integer({ min: 1, max: 10 }),
  createdAt: isoDateArb,
  updatedAt: isoDateArb,
});

// --- Property Tests ---

describe('Property 11: Minimum lesson validation', () => {
  it('a track where all lessons have >= 1 activity passes validation', () => {
    fc.assert(
      fc.property(validTrackArb, (track) => {
        const result = validateTrack(track);
        expect(result).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it('a track where any lesson has 0 activities fails validation', () => {
    // Generate a track that has at least one unit containing an empty lesson
    const unitWithEmptyLessonArb: fc.Arbitrary<TrackUnit> = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 30 }),
      subtitle: fc.string({ minLength: 1, maxLength: 30 }),
      emoji: fc.constantFrom('🔤', '🎨', '🔢'),
      color: hexColorArb,
      bg: hexColorArb,
      lessons: fc.tuple(
        fc.array(validLessonArb, { minLength: 0, maxLength: 3 }),
        emptyLessonArb,
        fc.array(validLessonArb, { minLength: 0, maxLength: 3 }),
      ).map(([before, empty, after]) => [...before, empty, ...after]),
    });

    const trackWithEmptyLessonArb: fc.Arbitrary<Track> = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      ageGroup: ageGroupArb,
      emoji: fc.constantFrom('🧒', '👦', '👧'),
      color: hexColorArb,
      units: fc.tuple(
        fc.array(validUnitArb, { minLength: 0, maxLength: 2 }),
        unitWithEmptyLessonArb,
        fc.array(validUnitArb, { minLength: 0, maxLength: 2 }),
      ).map(([before, bad, after]) => [...before, bad, ...after]),
      builtin: fc.boolean(),
      version: fc.integer({ min: 1, max: 10 }),
      createdAt: isoDateArb,
      updatedAt: isoDateArb,
    });

    fc.assert(
      fc.property(trackWithEmptyLessonArb, (track) => {
        const result = validateTrack(track);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
      }),
      { numRuns: 100 },
    );
  });

  it('a track with no units fails validation', () => {
    const trackNoUnitsArb: fc.Arbitrary<Track> = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      ageGroup: ageGroupArb,
      emoji: fc.constantFrom('🧒', '👦', '👧'),
      color: hexColorArb,
      units: fc.constant([]),
      builtin: fc.boolean(),
      version: fc.integer({ min: 1, max: 10 }),
      createdAt: isoDateArb,
      updatedAt: isoDateArb,
    });

    fc.assert(
      fc.property(trackNoUnitsArb, (track) => {
        const result = validateTrack(track);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
      }),
      { numRuns: 100 },
    );
  });

  it('a track with empty name fails validation', () => {
    const emptyNameArb = fc.constantFrom('', '   ', '\t', '\n');

    const trackEmptyNameArb: fc.Arbitrary<Track> = fc.record({
      id: fc.uuid(),
      name: emptyNameArb,
      ageGroup: ageGroupArb,
      emoji: fc.constantFrom('🧒', '👦', '👧'),
      color: hexColorArb,
      units: fc.array(validUnitArb, { minLength: 1, maxLength: 3 }),
      builtin: fc.boolean(),
      version: fc.integer({ min: 1, max: 10 }),
      createdAt: isoDateArb,
      updatedAt: isoDateArb,
    });

    fc.assert(
      fc.property(trackEmptyNameArb, (track) => {
        const result = validateTrack(track);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 *
 * Property 12: Integridade das trilhas builtin
 * - Devem existir exatamente 3 trilhas builtin, uma para cada faixa etária ('3-4', '5-6', '7-8')
 * - Cada trilha builtin deve ter builtin: true
 * - Cada trilha deve ter pelo menos 3 unidades
 * - Cada unidade deve ter pelo menos 3 lições
 * - Cada lição deve ter pelo menos 1 atividade
 * - Todos os IDs de palavras referenciados devem existir no banco de palavras
 * - Todos os IDs de histórias referenciados devem existir no banco de histórias
 * - Todos os IDs de frases referenciados devem existir no banco de frases
 * - Todos os IDs de matchGames referenciados devem existir nos matchGames
 * - Todos os IDs (track, unit, lesson, activity) devem ser únicos
 * - Cada trilha deve ter campos obrigatórios válidos
 */

describe('Property 12: Integridade das trilhas builtin', () => {
  const wordIds = new Set<string>(words.map((w) => w.id));
  const storyIds = new Set<string>(stories.map((s) => s.id));
  const sentenceIds = new Set<string>(sentences.map((s) => s.id));
  const matchGameIds = new Set(getMatchGames().map((g) => g.id));

  it('devem existir exatamente 3 trilhas builtin, uma para cada faixa etária', () => {
    expect(BUILTIN_TRACKS).toHaveLength(3);
    const ageGroups = BUILTIN_TRACKS.map((t) => t.ageGroup).sort();
    expect(ageGroups).toEqual(['3-4', '5-6', '7-8']);
  });

  it('cada trilha builtin deve ter builtin: true', () => {
    for (const track of BUILTIN_TRACKS) {
      expect(track.builtin).toBe(true);
    }
  });

  it('cada trilha deve ter pelo menos 3 unidades', () => {
    for (const track of BUILTIN_TRACKS) {
      expect(track.units.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('cada unidade deve ter pelo menos 3 lições', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        expect(unit.lessons.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('cada lição deve ter pelo menos 1 atividade', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        for (const lesson of unit.lessons) {
          expect(lesson.activities.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('todos os IDs de palavras referenciados devem existir no banco de palavras', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        for (const lesson of unit.lessons) {
          for (const activity of lesson.activities) {
            for (const wid of activity.wordIds) {
              expect(wordIds.has(wid), `wordId "${wid}" não encontrado (trilha ${track.id}, atividade ${activity.id})`).toBe(true);
            }
          }
        }
      }
    }
  });

  it('todos os IDs de histórias referenciados devem existir no banco de histórias', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        for (const lesson of unit.lessons) {
          for (const activity of lesson.activities) {
            if (activity.storyId) {
              expect(storyIds.has(activity.storyId), `storyId "${activity.storyId}" não encontrado (trilha ${track.id}, atividade ${activity.id})`).toBe(true);
            }
          }
        }
      }
    }
  });

  it('todos os IDs de frases referenciados devem existir no banco de frases', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        for (const lesson of unit.lessons) {
          for (const activity of lesson.activities) {
            if (activity.sentenceIds) {
              for (const sid of activity.sentenceIds) {
                expect(sentenceIds.has(sid), `sentenceId "${sid}" não encontrado (trilha ${track.id}, atividade ${activity.id})`).toBe(true);
              }
            }
          }
        }
      }
    }
  });

  it('todos os IDs de matchGames referenciados devem existir nos matchGames', () => {
    for (const track of BUILTIN_TRACKS) {
      for (const unit of track.units) {
        for (const lesson of unit.lessons) {
          for (const activity of lesson.activities) {
            if (activity.matchGameId) {
              expect(matchGameIds.has(activity.matchGameId), `matchGameId "${activity.matchGameId}" não encontrado (trilha ${track.id}, atividade ${activity.id})`).toBe(true);
            }
          }
        }
      }
    }
  });

  it('todos os IDs (track, unit, lesson, activity) devem ser únicos', () => {
    const allIds: string[] = [];
    for (const track of BUILTIN_TRACKS) {
      allIds.push(track.id);
      for (const unit of track.units) {
        allIds.push(unit.id);
        for (const lesson of unit.lessons) {
          allIds.push(lesson.id);
          for (const activity of lesson.activities) {
            allIds.push(activity.id);
          }
        }
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('cada trilha deve ter campos obrigatórios válidos', () => {
    for (const track of BUILTIN_TRACKS) {
      expect(track.id).toBeTruthy();
      expect(typeof track.id).toBe('string');
      expect(track.name).toBeTruthy();
      expect(typeof track.name).toBe('string');
      expect(['3-4', '5-6', '7-8']).toContain(track.ageGroup);
      expect(track.emoji).toBeTruthy();
      expect(track.color).toBeTruthy();
      expect(typeof track.version).toBe('number');
      expect(track.version).toBeGreaterThanOrEqual(1);
      expect(track.createdAt).toBeTruthy();
      expect(track.updatedAt).toBeTruthy();
      // Verificar que timestamps são datas ISO válidas
      expect(new Date(track.createdAt).toISOString()).toBe(track.createdAt);
      expect(new Date(track.updatedAt).toISOString()).toBe(track.updatedAt);
    }
  });
});
