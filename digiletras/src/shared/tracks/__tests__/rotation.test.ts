import { describe, it, expect, vi, afterEach } from 'vitest';
import { selectNextGame } from '../rotation';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('selectNextGame', () => {
  it('returns the only available type when there is just one', () => {
    expect(selectNextGame(['quiz'], ['quiz', 'quiz'], 5)).toBe('quiz');
  });

  it('returns a type from availableTypes (never something outside)', () => {
    const available = ['quiz', 'memory', 'fill'];
    for (let i = 0; i < 20; i++) {
      const result = selectNextGame(available, [], 5);
      expect(available).toContain(result);
    }
  });

  it('picks an unplayed type when some types have not been played recently', () => {
    const available = ['quiz', 'memory', 'fill', 'write'];
    const recent = ['quiz', 'memory'];
    // With only fill and write unplayed, result must be one of them
    for (let i = 0; i < 30; i++) {
      const result = selectNextGame(available, recent, 5);
      expect(['fill', 'write']).toContain(result);
    }
  });

  it('avoids the most recent game when all types have been played', () => {
    const available = ['quiz', 'memory'];
    const recent = ['quiz', 'memory'];
    // Should prefer 'memory' (not the most recent 'quiz')... wait, most recent is first
    // recent[0] = 'quiz', so it should avoid 'quiz' and pick 'memory'
    for (let i = 0; i < 20; i++) {
      const result = selectNextGame(available, recent, 5);
      expect(result).toBe('memory');
    }
  });

  it('respects maxHistory — ignores games beyond the window', () => {
    const available = ['quiz', 'memory', 'fill'];
    // recent has all 3 types, but maxHistory=1 means only 'quiz' is considered recent
    const recent = ['quiz', 'memory', 'fill'];
    for (let i = 0; i < 30; i++) {
      const result = selectNextGame(available, recent, 1);
      expect(['memory', 'fill']).toContain(result);
    }
  });

  it('works with empty recentGames', () => {
    const available = ['quiz', 'memory', 'fill'];
    for (let i = 0; i < 20; i++) {
      const result = selectNextGame(available, [], 5);
      expect(available).toContain(result);
    }
  });

  it('handles maxHistory of 0 (treats all as unplayed)', () => {
    const available = ['quiz', 'memory'];
    const recent = ['quiz', 'memory'];
    for (let i = 0; i < 20; i++) {
      const result = selectNextGame(available, recent, 0);
      expect(available).toContain(result);
    }
  });

  it('uses default maxHistory of 5', () => {
    const available = ['a', 'b', 'c', 'd', 'e', 'f'];
    const recent = ['a', 'b', 'c', 'd', 'e'];
    // Only 'f' is unplayed within the default window of 5
    for (let i = 0; i < 20; i++) {
      const result = selectNextGame(available, recent);
      expect(result).toBe('f');
    }
  });
});
