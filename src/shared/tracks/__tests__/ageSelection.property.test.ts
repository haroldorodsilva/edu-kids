// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { AgeGroup } from '../types';
import { getSelectedAge, setSelectedAge } from '../trackStore';

/**
 * **Validates: Requirements 1.2, 1.3**
 *
 * Property 3: Age selection persistence
 * - For any valid AgeGroup, calling setSelectedAge(age) then getSelectedAge() returns the same age
 * - Setting a new age overwrites the previous one
 * - The selection persists across multiple get calls
 */

const ageGroupArb: fc.Arbitrary<AgeGroup> = fc.constantFrom('3-4', '5-6', '7-8');

beforeEach(() => {
  localStorage.clear();
});

describe('Property 3: Age selection persistence', () => {
  it('setSelectedAge then getSelectedAge returns the same age', () => {
    fc.assert(
      fc.property(ageGroupArb, (age: AgeGroup) => {
        localStorage.clear();
        setSelectedAge(age);
        const loaded = getSelectedAge();
        expect(loaded).toBe(age);
      }),
      { numRuns: 100 },
    );
  });

  it('setting a new age overwrites the previous one', () => {
    fc.assert(
      fc.property(ageGroupArb, ageGroupArb, (first: AgeGroup, second: AgeGroup) => {
        localStorage.clear();
        setSelectedAge(first);
        setSelectedAge(second);
        const loaded = getSelectedAge();
        expect(loaded).toBe(second);
      }),
      { numRuns: 100 },
    );
  });

  it('the selection persists across multiple get calls', () => {
    fc.assert(
      fc.property(
        ageGroupArb,
        fc.integer({ min: 2, max: 10 }),
        (age: AgeGroup, readCount: number) => {
          localStorage.clear();
          setSelectedAge(age);
          for (let i = 0; i < readCount; i++) {
            expect(getSelectedAge()).toBe(age);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
