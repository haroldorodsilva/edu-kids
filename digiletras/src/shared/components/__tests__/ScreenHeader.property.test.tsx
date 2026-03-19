// Feature: app-standardization, Property 3: ScreenHeader renderiza com estrutura e acessibilidade corretas

// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ScreenHeader from '../layout/ScreenHeader';

/**
 * Property-based test for ScreenHeader component.
 *
 * **Validates: Requirements 6.1, 6.4**
 *
 * For any valid combination of props (title, emoji, onBack), the ScreenHeader renders:
 *   (a) a back button with aria-label="Voltar" and min dimensions of 44x44 pixels
 *   (b) the title containing the emoji and the text
 *   (c) the gradient background applied
 */
describe('Property 3: ScreenHeader renderiza com estrutura e acessibilidade corretas', () => {
  it('renders back button with correct aria-label and minimum touch target, title with emoji, and gradient background', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 5 }),
        fc.constant(vi.fn()),
        (title, emoji, onBack) => {
          const { unmount } = render(
            <ScreenHeader title={title} emoji={emoji} onBack={onBack} />,
          );

          // (a) Back button with aria-label="Voltar" and min 44x44 dimensions
          const backButton = screen.getByRole('button', { name: 'Voltar' });
          expect(backButton).toBeDefined();
          expect(backButton.getAttribute('aria-label')).toBe('Voltar');

          const style = backButton.style;
          const minWidth = parseInt(style.minWidth, 10);
          const minHeight = parseInt(style.minHeight, 10);
          expect(minWidth).toBeGreaterThanOrEqual(44);
          expect(minHeight).toBeGreaterThanOrEqual(44);

          // (b) Title containing emoji and text
          const heading = screen.getByRole('heading', { level: 1 });
          expect(heading).toBeDefined();
          expect(heading.textContent).toContain(emoji);
          expect(heading.textContent).toContain(title);

          // (c) Gradient background applied (default gradient)
          const header = heading.closest('header');
          expect(header).not.toBeNull();
          expect(header!.style.background).toBeTruthy();

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
