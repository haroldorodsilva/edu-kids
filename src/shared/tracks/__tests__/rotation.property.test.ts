import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { selectNextGame } from '../rotation';

/**
 * Property-based tests for the game rotation engine (selectNextGame).
 *
 * These tests verify universal properties that must hold across all valid inputs,
 * complementing the example-based tests in rotation.test.ts.
 */

// --- Arbitraries ---

/** Generates a non-empty array of unique game type strings. */
const availableTypesArb = (min = 1, max = 9): fc.Arbitrary<string[]> =>
  fc.uniqueArray(
    fc.constantFrom(
      'syllable', 'quiz', 'fill', 'memory', 'write',
      'firstletter', 'buildsentence', 'story', 'matchgame',
    ),
    { minLength: min, maxLength: max },
  );

/** Generates a recentGames array drawn from a given set of available types. */
const recentGamesArb = (availableTypes: string[]): fc.Arbitrary<string[]> =>
  fc.array(fc.constantFrom(...availableTypes), { minLength: 0, maxLength: 10 });

// --- Property Tests ---

/**
 * **Validates: Requirements 3.1, 3.5**
 *
 * Property 5: Non-consecutive repetition
 * When there are 2+ available types, calling selectNextGame with the last game
 * as recentGames[0] should return a different type.
 */
describe('Property 5: Non-consecutive repetition', () => {
  it('never returns the same type as the most recent game when 2+ types are available', () => {
    fc.assert(
      fc.property(
        availableTypesArb(2, 9).chain((types) =>
          fc.tuple(
            fc.constant(types),
            fc.constantFrom(...types),
            fc.integer({ min: 1, max: 10 }),
          ),
        ),
        ([availableTypes, lastPlayed, maxHistory]) => {
          // Place lastPlayed as the most recent game
          const recentGames = [lastPlayed];
          const result = selectNextGame(availableTypes, recentGames, maxHistory);
          expect(result).not.toBe(lastPlayed);
        },
      ),
      { numRuns: 200 },
    );
  });
});

/**
 * **Validates: Requirements 3.3**
 *
 * Property 6: Complete type coverage
 * Over N calls (where N >= availableTypes.length), all available types should
 * eventually be selected. We simulate sequential calls by feeding results back
 * into recentGames.
 */
describe('Property 6: Complete type coverage', () => {
  it('all available types are eventually selected over enough sequential calls', () => {
    fc.assert(
      fc.property(
        availableTypesArb(2, 9),
        (availableTypes) => {
          const seen = new Set<string>();
          const recentGames: string[] = [];
          const maxHistory = 5;

          // Run enough iterations to cycle through all types multiple times
          const iterations = availableTypes.length * 3;
          for (let i = 0; i < iterations; i++) {
            const result = selectNextGame(availableTypes, recentGames, maxHistory);
            seen.add(result);
            recentGames.unshift(result);
            if (recentGames.length > maxHistory) {
              recentGames.pop();
            }
          }

          // All available types should have been selected at least once
          for (const type of availableTypes) {
            expect(seen.has(type)).toBe(true);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});

/**
 * **Validates: Requirements 3.5**
 *
 * Property 7: Always valid return
 * For any inputs, selectNextGame always returns a value from availableTypes.
 */
describe('Property 7: Always valid return', () => {
  it('always returns a value contained in availableTypes', () => {
    fc.assert(
      fc.property(
        availableTypesArb(1, 9).chain((types) =>
          fc.tuple(
            fc.constant(types),
            recentGamesArb(types),
            fc.integer({ min: 0, max: 20 }),
          ),
        ),
        ([availableTypes, recentGames, maxHistory]) => {
          const result = selectNextGame(availableTypes, recentGames, maxHistory);
          expect(availableTypes).toContain(result);
        },
      ),
      { numRuns: 300 },
    );
  });
});
