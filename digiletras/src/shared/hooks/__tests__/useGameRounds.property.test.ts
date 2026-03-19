// Feature: app-standardization, Property 7: useGameRounds gerencia progressão de rodadas corretamente

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useGameRounds } from '../useGameRounds';

/**
 * Property-based test for useGameRounds hook.
 *
 * **Validates: Requirements 12.1**
 *
 * For any pool of items and number of total rounds, and any sequence of
 * advance(isCorrect) calls:
 * - round increments by 1 after each advance until reaching totalRounds
 * - correct equals the number of advance(true) calls
 * - errors equals the number of advance(false) calls plus addError() calls
 * - done is true only when round + 1 >= totalRounds after an advance
 * - onComplete is called exactly once when done becomes true
 */
describe('Property 7: useGameRounds gerencia progressão de rodadas corretamente', () => {
  it('manages round progression, counters, done state, and onComplete correctly for any sequence of advance calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.array(fc.boolean(), { minLength: 0, maxLength: 40 }),
        (totalRounds, advanceSequence) => {
          const pool = Array.from({ length: totalRounds }, (_, i) => i);
          const onComplete = vi.fn();

          const { result } = renderHook(() =>
            useGameRounds({ pool, totalRounds, onComplete }),
          );

          // Initial state
          expect(result.current.round).toBe(0);
          expect(result.current.correct).toBe(0);
          expect(result.current.errors).toBe(0);
          expect(result.current.done).toBe(false);
          expect(result.current.current).toBe(0);

          let expectedCorrect = 0;
          let expectedErrors = 0;
          let expectedRound = 0;
          let expectedDone = false;

          for (const isCorrect of advanceSequence) {
            if (expectedDone) {
              // After done, advance is a no-op
              act(() => {
                result.current.advance(isCorrect);
              });

              expect(result.current.round).toBe(expectedRound);
              expect(result.current.correct).toBe(expectedCorrect);
              expect(result.current.errors).toBe(expectedErrors);
              expect(result.current.done).toBe(true);
              continue;
            }

            // Track expected counters
            if (isCorrect) {
              expectedCorrect += 1;
            } else {
              expectedErrors += 1;
            }

            // Check if this advance finishes the game
            const willFinish = expectedRound + 1 >= totalRounds;

            act(() => {
              result.current.advance(isCorrect);
            });

            if (willFinish) {
              expectedDone = true;
              // round stays at the same value when finishing
            } else {
              expectedRound += 1;
            }

            expect(result.current.correct).toBe(expectedCorrect);
            expect(result.current.errors).toBe(expectedErrors);
            expect(result.current.round).toBe(expectedRound);
            expect(result.current.done).toBe(expectedDone);
          }

          // onComplete called exactly once when done, or not at all if never done
          if (expectedDone) {
            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onComplete).toHaveBeenCalledWith(expectedErrors);
          } else {
            expect(onComplete).not.toHaveBeenCalled();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('tracks errors from addError() calls combined with advance(false) calls', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 15 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('advance-true', 'advance-false', 'addError'),
          }),
          { minLength: 1, maxLength: 30 },
        ),
        (totalRounds, actions) => {
          const pool = Array.from({ length: totalRounds }, (_, i) => i);
          const onComplete = vi.fn();

          const { result } = renderHook(() =>
            useGameRounds({ pool, totalRounds, onComplete }),
          );

          let expectedCorrect = 0;
          let expectedErrors = 0;
          let expectedRound = 0;
          let expectedDone = false;

          for (const action of actions) {
            if (action.type === 'addError') {
              // addError always increments errors (no done guard)
              expectedErrors += 1;
              act(() => {
                result.current.addError();
              });
              // addError does not advance round or change done
              expect(result.current.errors).toBe(expectedErrors);
              expect(result.current.round).toBe(expectedRound);
              expect(result.current.done).toBe(expectedDone);
              continue;
            }

            const isCorrect = action.type === 'advance-true';

            if (expectedDone) {
              act(() => {
                result.current.advance(isCorrect);
              });
              // no-op after done
              expect(result.current.round).toBe(expectedRound);
              expect(result.current.correct).toBe(expectedCorrect);
              expect(result.current.errors).toBe(expectedErrors);
              expect(result.current.done).toBe(true);
              continue;
            }

            if (isCorrect) {
              expectedCorrect += 1;
            } else {
              expectedErrors += 1;
            }

            const willFinish = expectedRound + 1 >= totalRounds;

            act(() => {
              result.current.advance(isCorrect);
            });

            if (willFinish) {
              expectedDone = true;
            } else {
              expectedRound += 1;
            }

            expect(result.current.correct).toBe(expectedCorrect);
            expect(result.current.errors).toBe(expectedErrors);
            expect(result.current.round).toBe(expectedRound);
            expect(result.current.done).toBe(expectedDone);
          }

          if (expectedDone) {
            expect(onComplete).toHaveBeenCalledTimes(1);
          } else {
            expect(onComplete).not.toHaveBeenCalled();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
