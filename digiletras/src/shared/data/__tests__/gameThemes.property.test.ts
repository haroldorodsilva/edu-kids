import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GAME_THEMES, getTheme, type GameTheme } from '../gameThemes';

// ── Helpers for WCAG contrast calculation ──

/** Parse a hex color string (#RRGGBB) into [r, g, b] in 0–255. */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Convert an sRGB channel (0–255) to its linear value. */
function linearize(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Compute relative luminance per WCAG 2.x. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Compute contrast ratio between two hex colors. */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── Arbitraries ──

/** Picks a random index into GAME_THEMES. */
const themeIndexArb = fc.integer({ min: 0, max: GAME_THEMES.length - 1 });

/** Picks a random theme from GAME_THEMES. */
const themeArb: fc.Arbitrary<GameTheme> = themeIndexArb.map((i) => GAME_THEMES[i]);

// ── Property Tests ──

// Feature: app-standardization, Property 6: GameThemes possuem todos os campos obrigatórios incluindo gradiente válido
describe('Property 6: GameThemes possuem todos os campos obrigatórios incluindo gradiente válido', () => {
  /**
   * **Validates: Requirements 7.1, 7.4**
   *
   * For every theme in GAME_THEMES, fields id, icon, label, color, bg,
   * gradient, and textColor must be present and non-empty strings.
   * The gradient field must start with "linear-gradient".
   */
  it('every theme has all required fields as non-empty strings and a valid gradient', () => {
    fc.assert(
      fc.property(themeArb, (theme: GameTheme) => {
        const requiredFields: (keyof GameTheme)[] = [
          'id', 'icon', 'label', 'color', 'bg', 'gradient', 'textColor',
        ];

        for (const field of requiredFields) {
          expect(typeof theme[field]).toBe('string');
          expect((theme[field] as string).length).toBeGreaterThan(0);
        }

        expect(theme.gradient.startsWith('linear-gradient')).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: app-standardization, Property 9: Combinações de cores dos temas atendem requisitos de contraste
describe('Property 9: Combinações de cores dos temas atendem requisitos de contraste', () => {
  /**
   * **Validates: Requisito 13.4**
   *
   * For every theme, the contrast ratio between textColor and bg
   * must be >= 4.5:1 (WCAG AA for normal text).
   */
  it('textColor vs bg contrast ratio is at least 4.5:1 for every theme', () => {
    fc.assert(
      fc.property(themeArb, (theme: GameTheme) => {
        const ratio = contrastRatio(theme.textColor, theme.bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: app-standardization, Property 10: getTheme retorna tema válido para qualquer GameId
describe('Property 10: getTheme retorna tema válido para qualquer GameId', () => {
  /**
   * **Validates: Requisito 9.4**
   *
   * For every id in GAME_THEMES, getTheme(id) returns the theme with
   * matching id. For random strings not in GAME_THEMES, getTheme returns
   * GAME_THEMES[0] as fallback.
   */
  it('getTheme returns the correct theme for every valid GameId', () => {
    fc.assert(
      fc.property(themeArb, (theme: GameTheme) => {
        const result = getTheme(theme.id);
        expect(result.id).toBe(theme.id);
        expect(result).toEqual(theme);
      }),
      { numRuns: 100 },
    );
  });

  it('getTheme returns the first theme as fallback for unknown ids', () => {
    const validIds = new Set<string>(GAME_THEMES.map((t) => t.id));

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !validIds.has(s)),
        (randomId: string) => {
          const result = getTheme(randomId);
          expect(result).toEqual(GAME_THEMES[0]);
        },
      ),
      { numRuns: 100 },
    );
  });
});
