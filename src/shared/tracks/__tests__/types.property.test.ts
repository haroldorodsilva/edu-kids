import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type {
  AgeGroup,
  TrackGameType,
  TrackActivity,
  TrackLesson,
  TrackUnit,
  Track,
  TrackLessonResult,
  TrackProgress,
} from '../types';

/**
 * **Validates: Requirements 5.6, 9.4**
 *
 * Property 2: Round-trip serialization consistency
 * FOR ALL Track and TrackProgress objects, serializing to JSON and
 * deserializing back produces a deep-equal object.
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
  wordIds: fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
  sentenceIds: fc.option(fc.array(fc.uuid(), { minLength: 1, maxLength: 3 }), { nil: undefined }),
  storyId: fc.option(fc.uuid(), { nil: undefined }),
  storyMode: fc.option(fc.constantFrom('typing' as const, 'dictation' as const), { nil: undefined }),
  matchGameId: fc.option(fc.uuid(), { nil: undefined }),
  rounds: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
});

const trackLessonArb: fc.Arbitrary<TrackLesson> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  emoji: fc.constantFrom('📚', '🎮', '✏️', '🧩', '🎵', '🌟'),
  activities: fc.array(trackActivityArb, { minLength: 1, maxLength: 5 }),
});

const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 0xffffff }),
).map(([n]) => `#${n.toString(16).padStart(6, '0')}`);

const trackUnitArb: fc.Arbitrary<TrackUnit> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  subtitle: fc.string({ minLength: 1, maxLength: 80 }),
  emoji: fc.constantFrom('🔤', '🎨', '🔢', '📖', '✍️', '🧮'),
  color: hexColorArb,
  bg: hexColorArb,
  lessons: fc.array(trackLessonArb, { minLength: 1, maxLength: 5 }),
});

const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map((ts) => new Date(ts).toISOString());

const trackArb: fc.Arbitrary<Track> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  ageGroup: ageGroupArb,
  emoji: fc.constantFrom('🧒', '👦', '👧'),
  color: hexColorArb,
  units: fc.array(trackUnitArb, { minLength: 1, maxLength: 4 }),
  builtin: fc.boolean(),
  version: fc.integer({ min: 1, max: 10 }),
  createdAt: isoDateArb,
  updatedAt: isoDateArb,
});

const trackLessonResultArb: fc.Arbitrary<TrackLessonResult> = fc.record({
  stars: fc.integer({ min: 1, max: 3 }),
  xp: fc.integer({ min: 0, max: 1000 }),
  completedAt: isoDateArb,
  errors: fc.integer({ min: 0, max: 50 }),
});

const trackProgressArb: fc.Arbitrary<TrackProgress> = fc.record({
  id: fc.uuid(),
  trackId: fc.uuid(),
  ageGroup: ageGroupArb,
  completedLessons: fc.dictionary(fc.uuid(), trackLessonResultArb, { minKeys: 0, maxKeys: 10 }),
  totalXP: fc.integer({ min: 0, max: 100000 }),
  lastPlayedAt: isoDateArb,
  version: fc.integer({ min: 1, max: 10 }),
});

// --- Property Tests ---

describe('Property 2: Round-trip serialization consistency', () => {
  it('Track: JSON.stringify → JSON.parse produces deep-equal object', () => {
    fc.assert(
      fc.property(trackArb, (track: Track) => {
        const serialized = JSON.stringify(track);
        const deserialized = JSON.parse(serialized) as Track;
        expect(deserialized).toEqual(track);
      }),
      { numRuns: 100 },
    );
  });

  it('TrackProgress: JSON.stringify → JSON.parse produces deep-equal object', () => {
    fc.assert(
      fc.property(trackProgressArb, (progress: TrackProgress) => {
        const serialized = JSON.stringify(progress);
        const deserialized = JSON.parse(serialized) as TrackProgress;
        expect(deserialized).toEqual(progress);
      }),
      { numRuns: 100 },
    );
  });

  it('TrackActivity: JSON.stringify → JSON.parse preserves optional fields', () => {
    fc.assert(
      fc.property(trackActivityArb, (activity: TrackActivity) => {
        const serialized = JSON.stringify(activity);
        const deserialized = JSON.parse(serialized) as TrackActivity;
        expect(deserialized).toEqual(activity);
      }),
      { numRuns: 100 },
    );
  });

  it('TrackUnit: JSON.stringify → JSON.parse preserves nested lessons and activities', () => {
    fc.assert(
      fc.property(trackUnitArb, (unit: TrackUnit) => {
        const serialized = JSON.stringify(unit);
        const deserialized = JSON.parse(serialized) as TrackUnit;
        expect(deserialized).toEqual(unit);
      }),
      { numRuns: 100 },
    );
  });
});
