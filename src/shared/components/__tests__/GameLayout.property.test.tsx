// Feature: app-standardization, Property 1: GameLayout renderiza todos os elementos obrigatórios para qualquer tema
// Feature: app-standardization, Property 2: GameLayout exibe DoneCard quando concluído

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, within, cleanup } from '@testing-library/react';
import GameLayout from '../layout/GameLayout';
import { GAME_THEMES, getTheme } from '../../data/gameThemes';

/** Convert hex color (#RRGGBB) to rgb(r, g, b) string for comparison with jsdom */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Property 1: GameLayout renderiza todos os elementos obrigatórios para qualquer tema
 *
 * **Validates: Requirements 2.1, 2.4**
 *
 * For any valid gameId from GAME_THEMES, when GameLayout is rendered with done=false,
 * the output must contain:
 *   (a) a ScreenHeader with the theme's emoji and label
 *   (b) a ProgressBar with the theme's color
 *   (c) the children content
 */
describe('Property 1: GameLayout renderiza todos os elementos obrigatórios para qualquer tema', () => {
  it('renders ScreenHeader, ProgressBar, and children for any valid gameId when done=false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...GAME_THEMES.map(t => t.id)),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 1, max: 100 }),
        (gameId, currentRound, totalRounds) => {
          cleanup();
          const theme = getTheme(gameId);
          const childText = `child-content-${gameId}`;

          const { container, unmount } = render(
            <GameLayout
              gameId={gameId}
              onBack={vi.fn()}
              currentRound={currentRound}
              totalRounds={totalRounds}
              done={false}
            >
              <div data-testid="game-child">{childText}</div>
            </GameLayout>,
          );

          const scope = within(container);

          // (a) ScreenHeader with theme label and icon rendered as SVG
          const heading = scope.getByRole('heading', { level: 1 });
          expect(heading.textContent).toContain(theme.label);

          // Icon is now a Lucide SVG, verify it's rendered near the heading
          const header = container.querySelector('header');
          expect(header).not.toBeNull();
          const svgIcon = header!.querySelector('svg');
          expect(svgIcon).not.toBeNull();

          // (b) ProgressBar with theme color — jsdom returns rgb() format
          const progressWrapper = header!.nextElementSibling as HTMLElement;
          expect(progressWrapper).not.toBeNull();
          const innerBar = progressWrapper.querySelector('div') as HTMLElement;
          expect(innerBar).not.toBeNull();
          expect(innerBar.style.backgroundColor).toBe(hexToRgb(theme.color));

          // (c) Children content is rendered
          const child = scope.getByTestId('game-child');
          expect(child.textContent).toBe(childText);

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Property 2: GameLayout exibe DoneCard quando concluído
 *
 * **Validates: Requirement 2.3**
 *
 * For any game configuration with done=true, the output must contain DoneCard
 * with score and must NOT render children.
 */
describe('Property 2: GameLayout exibe DoneCard quando concluído', () => {
  it('renders DoneCard with score and hides children when done=true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...GAME_THEMES.map(t => t.id)),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (gameId, correct, total) => {
          cleanup();
          const safeTotal = Math.max(total, correct + 1);

          const { container, unmount } = render(
            <GameLayout
              gameId={gameId}
              onBack={vi.fn()}
              currentRound={safeTotal}
              totalRounds={safeTotal}
              done={true}
              score={{ correct, total: safeTotal }}
              onNext={vi.fn()}
            >
              <div data-testid="game-child">should-not-appear</div>
            </GameLayout>,
          );

          const scope = within(container);

          // DoneCard renders score — verify correct and total appear in the text content
          const text = container.textContent ?? '';
          expect(text).toContain(String(correct));
          expect(text).toContain(String(safeTotal));

          // DoneCard renders the trophy icon (SVG)
          const trophyIcon = container.querySelector('svg');
          expect(trophyIcon).not.toBeNull();

          // Children must NOT be rendered
          const child = scope.queryByTestId('game-child');
          expect(child).toBeNull();

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
