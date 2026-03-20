// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { AgeGroup, Track, TrackGameType, TrackActivity, TrackLesson, TrackUnit, TrackLessonResult } from '../types';
import { saveTrack, saveTrackLessonResult, getTrackProgress } from '../trackStore';

/**
 * **Validates: Requirements 6.4**
 *
 * Property 10: XP monotonically increasing
 * - After each saveTrackLessonResult() call, totalXP >= previous totalXP (when adding new lessons)
 * - totalXP equals the sum of all individual lesson XP values
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

const trackLessonArb: fc.Arbitrary<TrackLesson> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  emoji: fc.constantFrom('📚', '🎮', '✏️', '🧩'),
  activities: fc.array(trackActivityArb, { minLength: 1, maxLength: 3 }),
});

const hexColorArb = fc.integer({ min: 0, max: 0xffffff })
  .map((n) => `#${n.toString(16).padStart(6, '0')}`);

const trackUnitArb: fc.Arbitrary<TrackUnit> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 30 }),
  subtitle: fc.string({ minLength: 1, maxLength: 30 }),
  emoji: fc.constantFrom('🔤', '🎨', '🔢'),
  color: hexColorArb,
  bg: hexColorArb,
  lessons: fc.array(trackLessonArb, { minLength: 1, maxLength: 5 }),
});

const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map((ts) => new Date(ts).toISOString());

const customTrackArb: fc.Arbitrary<Track> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  ageGroup: ageGroupArb,
  emoji: fc.constantFrom('🧒', '👦', '👧'),
  color: hexColorArb,
  units: fc.array(trackUnitArb, { minLength: 1, maxLength: 3 }),
  builtin: fc.constant(false),
  version: fc.integer({ min: 1, max: 10 }),
  createdAt: isoDateArb,
  updatedAt: isoDateArb,
});

const lessonResultArb: fc.Arbitrary<TrackLessonResult> = fc.record({
  stars: fc.integer({ min: 1, max: 3 }),
  xp: fc.integer({ min: 1, max: 500 }),
  completedAt: isoDateArb,
  errors: fc.integer({ min: 0, max: 20 }),
});

// --- Setup ---

beforeEach(() => {
  localStorage.clear();
});

// --- Property Tests ---

describe('Property 10: XP monotonically increasing', () => {
  it('totalXP is >= previous totalXP after each new lesson result', () => {
    fc.assert(
      fc.property(
        customTrackArb,
        fc.array(lessonResultArb, { minLength: 1, maxLength: 10 }),
        (track, results) => {
          localStorage.clear();
          saveTrack(track);

          // Collect all unique lesson IDs from the track
          const lessonIds: string[] = [];
          for (const unit of track.units) {
            for (const lesson of unit.lessons) {
              lessonIds.push(lesson.id);
            }
          }
          if (lessonIds.length === 0) return;

          let prevTotalXP = 0;

          // Sequentially save lesson results with distinct lesson IDs
          const usedCount = Math.min(results.length, lessonIds.length);
          for (let i = 0; i < usedCount; i++) {
            saveTrackLessonResult(track.id, lessonIds[i], results[i]);

            const progressList = getTrackProgress(track.ageGroup);
            const entry = progressList.find((p) => p.trackId === track.id);
            expect(entry).toBeDefined();

            expect(entry!.totalXP).toBeGreaterThanOrEqual(prevTotalXP);
            prevTotalXP = entry!.totalXP;
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('totalXP equals the sum of all individual lesson XP values', () => {
    fc.assert(
      fc.property(
        customTrackArb,
        fc.array(lessonResultArb, { minLength: 1, maxLength: 10 }),
        (track, results) => {
          localStorage.clear();
          saveTrack(track);

          // Collect all unique lesson IDs from the track
          const lessonIds: string[] = [];
          for (const unit of track.units) {
            for (const lesson of unit.lessons) {
              lessonIds.push(lesson.id);
            }
          }
          if (lessonIds.length === 0) return;

          const usedCount = Math.min(results.length, lessonIds.length);
          let expectedSum = 0;

          for (let i = 0; i < usedCount; i++) {
            saveTrackLessonResult(track.id, lessonIds[i], results[i]);
            expectedSum += results[i].xp;
          }

          const progressList = getTrackProgress(track.ageGroup);
          const entry = progressList.find((p) => p.trackId === track.id);
          expect(entry).toBeDefined();
          expect(entry!.totalXP).toBe(expectedSum);
        },
      ),
      { numRuns: 100 },
    );
  });
});
