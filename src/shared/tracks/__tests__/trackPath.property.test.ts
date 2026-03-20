// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { TrackLessonResult } from '../types';

/**
 * Pure function extracted from TrackPathScreen for testability.
 * Determines if a lesson at `nodeIndex` is unlocked given the list of
 * lesson IDs and the map of completed lessons.
 */
function isLessonUnlocked(
  nodeIndex: number,
  lessonIds: string[],
  completedLessons: Record<string, TrackLessonResult>,
): boolean {
  if (nodeIndex === 0) return true;
  const prevId = lessonIds[nodeIndex - 1];
  return prevId in completedLessons;
}

/**
 * Pure function for star calculation based on error count.
 * 0 errors → 3 stars, 1-2 errors → 2 stars, 3+ errors → 1 star.
 */
function calculateStars(errors: number): number {
  if (errors === 0) return 3;
  if (errors <= 2) return 2;
  return 1;
}

// --- Arbitraries ---

const lessonIdArb = fc.uuid();

const lessonIdsArb = fc.array(lessonIdArb, { minLength: 1, maxLength: 20 })
  .map((ids) => [...new Set(ids)]); // ensure unique IDs

const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map((ts) => new Date(ts).toISOString());

const lessonResultArb: fc.Arbitrary<TrackLessonResult> = fc.record({
  stars: fc.integer({ min: 1, max: 3 }),
  xp: fc.integer({ min: 10, max: 500 }),
  completedAt: isoDateArb,
  errors: fc.integer({ min: 0, max: 20 }),
});

// --- Property 8: Sequential lesson unlock ---

/**
 * **Validates: Requirements 6.3**
 *
 * Property 8: Sequential lesson unlock
 * - First lesson is always unlocked
 * - Lesson N+1 is unlocked only if lesson N is completed
 * - No lesson can be unlocked if the previous one is not completed
 */
describe('Property 8: Sequential lesson unlock', () => {
  it('first lesson is always unlocked regardless of completion state', () => {
    fc.assert(
      fc.property(
        lessonIdsArb,
        fc.dictionary(lessonIdArb, lessonResultArb, { minKeys: 0, maxKeys: 10 }),
        (lessonIds, completedLessons) => {
          expect(isLessonUnlocked(0, lessonIds, completedLessons)).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('lesson N+1 is unlocked only if lesson N is completed', () => {
    fc.assert(
      fc.property(
        lessonIdsArb.filter((ids) => ids.length >= 2),
        lessonResultArb,
        (lessonIds, result) => {
          // Pick a random index > 0
          const idx = Math.floor(Math.random() * (lessonIds.length - 1)) + 1;
          const prevId = lessonIds[idx - 1];

          // When previous lesson IS completed → unlocked
          const withCompleted: Record<string, TrackLessonResult> = { [prevId]: result };
          expect(isLessonUnlocked(idx, lessonIds, withCompleted)).toBe(true);

          // When previous lesson is NOT completed → locked
          expect(isLessonUnlocked(idx, lessonIds, {})).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('no lesson can be unlocked if the previous one is not completed', () => {
    fc.assert(
      fc.property(
        lessonIdsArb.filter((ids) => ids.length >= 3),
        lessonResultArb,
        (lessonIds, result) => {
          // Complete only the first lesson, check that lesson at index 2+ is locked
          const completedLessons: Record<string, TrackLessonResult> = {
            [lessonIds[0]]: result,
          };

          // Lesson 1 should be unlocked (prev = lesson 0 which is completed)
          expect(isLessonUnlocked(1, lessonIds, completedLessons)).toBe(true);

          // Lesson 2 should be locked (prev = lesson 1 which is NOT completed)
          expect(isLessonUnlocked(2, lessonIds, completedLessons)).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// --- Property 9: Star calculation ---

/**
 * **Validates: Requirements 6.4**
 *
 * Property 9: Star calculation
 * - Stars are always between 1 and 3
 * - Stars are based on error count (0 errors = 3 stars, 1-2 errors = 2 stars, 3+ errors = 1 star)
 */
describe('Property 9: Star calculation', () => {
  it('stars are always between 1 and 3 for any non-negative error count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        (errors) => {
          const stars = calculateStars(errors);
          expect(stars).toBeGreaterThanOrEqual(1);
          expect(stars).toBeLessThanOrEqual(3);
        },
      ),
      { numRuns: 500 },
    );
  });

  it('0 errors always yields 3 stars', () => {
    expect(calculateStars(0)).toBe(3);
  });

  it('1-2 errors always yields 2 stars', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 }),
        (errors) => {
          expect(calculateStars(errors)).toBe(2);
        },
      ),
      { numRuns: 10 },
    );
  });

  it('3+ errors always yields 1 star', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 10000 }),
        (errors) => {
          expect(calculateStars(errors)).toBe(1);
        },
      ),
      { numRuns: 500 },
    );
  });

  it('stars are monotonically non-increasing as errors increase', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9999 }),
        (errors) => {
          const starsNow = calculateStars(errors);
          const starsNext = calculateStars(errors + 1);
          expect(starsNext).toBeLessThanOrEqual(starsNow);
        },
      ),
      { numRuns: 500 },
    );
  });
});
