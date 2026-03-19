// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { AgeGroup, Track, TrackGameType, TrackActivity, TrackLesson, TrackUnit } from '../types';
import {
  saveTrack,
  getTrackById,
  getAllTracks,
  saveTrackLessonResult,
  getTrackProgress,
} from '../trackStore';
import { BUILTIN_TRACKS } from '../builtinTracks';

/**
 * **Validates: Requirements 5.3, 5.4**
 *
 * Property 1: Save/load idempotency
 * - For any arbitrary Track, saving via saveTrack() then loading via getTrackById() returns a deep-equal object
 * - For any arbitrary list of Tracks, saving all and loading via getAllTracks() returns the same set
 * - Saving the same track twice doesn't create duplicates
 */

// --- Arbitraries (reused from types.property.test.ts pattern) ---

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

const hexColorArb = fc.integer({ min: 0, max: 0xffffff })
  .map((n) => `#${n.toString(16).padStart(6, '0')}`);

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

/** Generates a custom (non-builtin) Track with a unique ID. */
const customTrackArb: fc.Arbitrary<Track> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  ageGroup: ageGroupArb,
  emoji: fc.constantFrom('🧒', '👦', '👧'),
  color: hexColorArb,
  units: fc.array(trackUnitArb, { minLength: 1, maxLength: 4 }),
  builtin: fc.constant(false),
  version: fc.integer({ min: 1, max: 10 }),
  createdAt: isoDateArb,
  updatedAt: isoDateArb,
});

/** Generates a list of custom Tracks with unique IDs. */
const uniqueCustomTracksArb: fc.Arbitrary<Track[]> = fc
  .array(customTrackArb, { minLength: 1, maxLength: 8 })
  .map((tracks) => {
    // Deduplicate by id — keep first occurrence
    const seen = new Set<string>();
    return tracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  });

// --- Setup ---

beforeEach(() => {
  localStorage.clear();
});

// --- Property Tests ---

describe('Property 1: Save/load idempotency', () => {
  it('saving a track and loading by ID returns a deep-equal object', () => {
    fc.assert(
      fc.property(customTrackArb, (track: Track) => {
        localStorage.clear();
        saveTrack(track);
        const loaded = getTrackById(track.id);
        expect(loaded).toEqual(track);
      }),
      { numRuns: 100 },
    );
  });

  it('saving a list of tracks and loading all returns the same set', () => {
    fc.assert(
      fc.property(uniqueCustomTracksArb, (tracks: Track[]) => {
        localStorage.clear();
        for (const t of tracks) {
          saveTrack(t);
        }
        const all = getAllTracks();
        // getAllTracks returns builtin + custom tracks
        expect(all).toHaveLength(BUILTIN_TRACKS.length + tracks.length);
        for (const t of tracks) {
          const found = all.find((a) => a.id === t.id);
          expect(found).toEqual(t);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('saving the same track twice does not create duplicates', () => {
    fc.assert(
      fc.property(customTrackArb, (track: Track) => {
        localStorage.clear();
        saveTrack(track);
        saveTrack(track);
        const all = getAllTracks();
        const matching = all.filter((t) => t.id === track.id);
        expect(matching).toHaveLength(1);
        expect(matching[0]).toEqual(track);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * **Validates: Requirements 1.5**
 *
 * Property 4: Age group progress isolation
 * - Saving progress for one age group does NOT affect progress of other age groups
 * - For any combination of tracks across different age groups, each age group's progress is independent
 */

// --- Arbitraries for Property 4 ---

const ALL_AGE_GROUPS: AgeGroup[] = ['3-4', '5-6', '7-8'];

const trackLessonResultArb = fc.record({
  stars: fc.integer({ min: 1, max: 3 }),
  xp: fc.integer({ min: 10, max: 500 }),
  completedAt: isoDateArb,
  errors: fc.integer({ min: 0, max: 20 }),
});

/** Generates a custom Track pinned to a specific age group. */
function customTrackForAgeArb(age: AgeGroup): fc.Arbitrary<Track> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    ageGroup: fc.constant(age),
    emoji: fc.constantFrom('🧒', '👦', '👧'),
    color: hexColorArb,
    units: fc.array(trackUnitArb, { minLength: 1, maxLength: 2 }),
    builtin: fc.constant(false),
    version: fc.integer({ min: 1, max: 10 }),
    createdAt: isoDateArb,
    updatedAt: isoDateArb,
  });
}

describe('Property 4: Age group progress isolation', () => {
  it('saving progress for one age group does NOT affect progress of other age groups', () => {
    // Pick a target age group and generate a track + lesson result for it.
    // Then verify the other two age groups' progress arrays remain empty.
    const targetAgeArb = fc.constantFrom<AgeGroup>('3-4', '5-6', '7-8');

    fc.assert(
      fc.property(
        targetAgeArb.chain((targetAge) =>
          fc.tuple(
            fc.constant(targetAge),
            customTrackForAgeArb(targetAge),
            trackLessonResultArb,
          ),
        ),
        ([targetAge, track, result]) => {
          localStorage.clear();

          // Save the track so saveTrackLessonResult can look it up
          saveTrack(track);

          // Pick the first lesson from the first unit
          const lessonId = track.units[0].lessons[0].id;

          // Snapshot progress for all age groups BEFORE saving a result
          const beforeOther: Record<string, string> = {};
          for (const age of ALL_AGE_GROUPS) {
            if (age !== targetAge) {
              beforeOther[age] = JSON.stringify(getTrackProgress(age));
            }
          }

          // Save a lesson result for the target age group
          saveTrackLessonResult(track.id, lessonId, result);

          // The target age group should now have progress
          const targetProgress = getTrackProgress(targetAge);
          expect(targetProgress.length).toBeGreaterThan(0);

          // Other age groups must remain unchanged
          for (const age of ALL_AGE_GROUPS) {
            if (age !== targetAge) {
              const afterOther = JSON.stringify(getTrackProgress(age));
              expect(afterOther).toEqual(beforeOther[age]);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('progress across multiple age groups is independent', () => {
    // Generate one track per age group, save results for each, and verify
    // each age group only contains its own progress entries.
    fc.assert(
      fc.property(
        customTrackForAgeArb('3-4'),
        customTrackForAgeArb('5-6'),
        customTrackForAgeArb('7-8'),
        trackLessonResultArb,
        trackLessonResultArb,
        trackLessonResultArb,
        (track34, track56, track78, result34, result56, result78) => {
          localStorage.clear();

          const tracks = [track34, track56, track78];
          const results = [result34, result56, result78];

          // Save all tracks
          for (const t of tracks) saveTrack(t);

          // Save a lesson result for each age group
          for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            const lessonId = t.units[0].lessons[0].id;
            saveTrackLessonResult(t.id, lessonId, results[i]);
          }

          // Verify each age group's progress only references its own track
          for (const age of ALL_AGE_GROUPS) {
            const progress = getTrackProgress(age);
            for (const p of progress) {
              expect(p.ageGroup).toBe(age);
              // The trackId must belong to a track of this age group
              const ownerTrack = tracks.find((t) => t.id === p.trackId);
              expect(ownerTrack).toBeDefined();
              expect(ownerTrack!.ageGroup).toBe(age);
            }
          }
        },
      ),
      { numRuns: 50 },
    );
  });
});
