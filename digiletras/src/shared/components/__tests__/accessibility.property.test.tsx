// Feature: app-standardization, Property 8: Elementos interativos possuem atributos de acessibilidade

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup } from '@testing-library/react';
import GameLayout from '../layout/GameLayout';
import { GAME_THEMES } from '../../data/gameThemes';
import type { Word } from '../../data/words';
import Quiz from '../../../features/games/Quiz';
import FirstLetter from '../../../features/games/FirstLetter';

// Stub audio module to prevent errors during rendering
vi.mock('../../utils/audio', () => ({
  beep: vi.fn(),
  speak: vi.fn(),
}));

// Stub sessionStats to prevent localStorage errors
vi.mock('../../utils/sessionStats', () => ({
  recordGamePlayed: vi.fn(),
  recordWordAttempt: vi.fn(),
}));

/** Minimal word pool for rendering game components */
const MOCK_WORDS: Word[] = [
  { id: 'w-t1', word: 'bola', syllables: ['bo', 'la'], difficulty: 1, category: 'objeto', emoji: '⚽' },
  { id: 'w-t2', word: 'gato', syllables: ['ga', 'to'], difficulty: 1, category: 'animal', emoji: '🐱' },
  { id: 'w-t3', word: 'casa', syllables: ['ca', 'sa'], difficulty: 1, category: 'lugar', emoji: '🏠' },
  { id: 'w-t4', word: 'pato', syllables: ['pa', 'to'], difficulty: 1, category: 'animal', emoji: '🦆' },
  { id: 'w-t5', word: 'mesa', syllables: ['me', 'sa'], difficulty: 1, category: 'objeto', emoji: '🪑' },
  { id: 'w-t6', word: 'sapo', syllables: ['sa', 'po'], difficulty: 1, category: 'animal', emoji: '🐸' },
  { id: 'w-t7', word: 'dado', syllables: ['da', 'do'], difficulty: 1, category: 'objeto', emoji: '🎲' },
  { id: 'w-t8', word: 'vaca', syllables: ['va', 'ca'], difficulty: 1, category: 'animal', emoji: '🐄' },
];

/**
 * Property 8: Elementos interativos possuem atributos de acessibilidade
 *
 * **Validates: Requirements 13.1, 13.3**
 *
 * For any game component rendered:
 * - All buttons must have either visible text content or an aria-label attribute
 * - Feedback containers (option grids) should have role="status" and aria-live="polite"
 */
describe('Property 8: Elementos interativos possuem atributos de acessibilidade', () => {
  it('GameLayout always renders a back button with aria-label for any game theme', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...GAME_THEMES.map(t => t.id)),
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 1, max: 10 }),
        (gameId, currentRound, totalRounds) => {
          cleanup();

          const { container, unmount } = render(
            <GameLayout
              gameId={gameId}
              onBack={vi.fn()}
              currentRound={currentRound}
              totalRounds={totalRounds}
              done={false}
            >
              <div>test content</div>
            </GameLayout>,
          );

          // All buttons must have either text content or aria-label
          const buttons = container.querySelectorAll('button');
          for (const btn of buttons) {
            const hasAriaLabel = btn.hasAttribute('aria-label') && btn.getAttribute('aria-label')!.trim().length > 0;
            const hasTextContent = (btn.textContent ?? '').trim().length > 0;
            expect(
              hasAriaLabel || hasTextContent,
              `Button should have aria-label or text content, found neither`,
            ).toBe(true);
          }

          // The back button specifically must have aria-label="Voltar"
          const backButton = container.querySelector('button[aria-label="Voltar"]');
          expect(backButton).not.toBeNull();

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Quiz option grid has role="status" and aria-live="polite"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MOCK_WORDS),
        () => {
          cleanup();

          const { container, unmount } = render(
            <Quiz onBack={vi.fn()} wordPool={MOCK_WORDS} rounds={1} />,
          );

          // Quiz renders a grid with role="status" and aria-live="polite"
          const statusElements = container.querySelectorAll('[role="status"]');
          expect(statusElements.length).toBeGreaterThanOrEqual(1);

          for (const el of statusElements) {
            expect(el.getAttribute('aria-live')).toBe('polite');
          }

          // All buttons in the quiz must have aria-label or text content
          const buttons = container.querySelectorAll('button');
          for (const btn of buttons) {
            const hasAriaLabel = btn.hasAttribute('aria-label') && btn.getAttribute('aria-label')!.trim().length > 0;
            const hasTextContent = (btn.textContent ?? '').trim().length > 0;
            expect(
              hasAriaLabel || hasTextContent,
              `Quiz button should have aria-label or text content`,
            ).toBe(true);
          }

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('FirstLetter option grid has role="status" and aria-live="polite"', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MOCK_WORDS),
        () => {
          cleanup();

          const { container, unmount } = render(
            <FirstLetter onBack={vi.fn()} wordPool={MOCK_WORDS} rounds={1} />,
          );

          // FirstLetter renders a grid with role="status" and aria-live="polite"
          const statusElements = container.querySelectorAll('[role="status"]');
          expect(statusElements.length).toBeGreaterThanOrEqual(1);

          for (const el of statusElements) {
            expect(el.getAttribute('aria-live')).toBe('polite');
          }

          // All buttons in FirstLetter must have aria-label or text content
          const buttons = container.querySelectorAll('button');
          for (const btn of buttons) {
            const hasAriaLabel = btn.hasAttribute('aria-label') && btn.getAttribute('aria-label')!.trim().length > 0;
            const hasTextContent = (btn.textContent ?? '').trim().length > 0;
            expect(
              hasAriaLabel || hasTextContent,
              `FirstLetter button should have aria-label or text content`,
            ).toBe(true);
          }

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
