// Feature: app-standardization, Property 4: GameRoute renderiza o componente correto com props corretas

// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameRoute } from '../../../App';
import type { GameRouteConfig } from '../../../App';

/**
 * Mock game component that renders its received props as data attributes
 * so we can inspect what GameRoute actually passes.
 */
function MockGame(props: Record<string, unknown>) {
  return (
    <div
      data-testid="mock-game"
      data-has-onback={typeof props.onBack === 'function' ? 'true' : 'false'}
      data-has-wordpool={props.wordPool !== undefined ? 'true' : 'false'}
      data-wordpool-length={Array.isArray(props.wordPool) ? String(props.wordPool.length) : 'none'}
    />
  );
}

/** Test configs covering both noWordPool variants */
const TEST_CONFIGS: GameRouteConfig[] = [
  { id: 'test-with-pool', component: MockGame, noWordPool: false },
  { id: 'test-no-pool', component: MockGame, noWordPool: true },
];

/**
 * Property 4: GameRoute renderiza o componente correto com props corretas
 *
 * **Validates: Requirements 4.1, 4.4**
 *
 * For any configuration in GAME_ROUTES and any wordPool in navigation state,
 * the GameRoute renders the correct game component, passing onBack and
 * wordPool (when noWordPool is false).
 */
describe('Property 4: GameRoute renderiza o componente correto com props corretas', () => {
  it('renders the game component with onBack and correct wordPool handling based on noWordPool flag', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...TEST_CONFIGS),
        fc.boolean(),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 10 }),
            word: fc.string({ minLength: 1, maxLength: 20 }),
            syllables: fc.array(fc.string({ minLength: 1, maxLength: 5 }), { minLength: 1, maxLength: 4 }),
            difficulty: fc.constantFrom(1 as const, 2 as const, 3 as const),
            category: fc.string({ minLength: 1, maxLength: 15 }),
            emoji: fc.string({ minLength: 1, maxLength: 2 }),
          }),
          { minLength: 1, maxLength: 5 },
        ),
        (config, hasWordPool, wordPool) => {
          cleanup();

          const navState = hasWordPool ? { wordPool } : null;

          const { getByTestId, unmount } = render(
            <MemoryRouter
              initialEntries={[{ pathname: `/freeplay/${config.id}`, state: navState }]}
            >
              <GameRoute config={config} />
            </MemoryRouter>,
          );

          const el = getByTestId('mock-game');

          // GameRoute always passes onBack as a function
          expect(el.getAttribute('data-has-onback')).toBe('true');

          if (config.noWordPool) {
            // When noWordPool is true, wordPool should NOT be passed regardless of state
            expect(el.getAttribute('data-has-wordpool')).toBe('false');
          } else if (hasWordPool && wordPool.length > 0) {
            // When noWordPool is false and state has wordPool, it should be passed
            expect(el.getAttribute('data-has-wordpool')).toBe('true');
            expect(el.getAttribute('data-wordpool-length')).toBe(String(wordPool.length));
          }

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
