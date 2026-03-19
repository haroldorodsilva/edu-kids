// Feature: app-standardization, Property 5: Módulos de dados possuem todos os campos obrigatórios e IDs com prefixo correto

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { words, type Word } from '../words';
import { stories, type Story } from '../stories';
import { sentences, type Sentence } from '../sentences';
import { getMatchGames, type MatchGame } from '../matchGames';

// ── Static matchGames (IDs starting with mg-) ──
const staticMatchGames = getMatchGames().filter((g) => g.id.startsWith('mg-'));

// ── Arbitraries using fc.constantFrom ──

const wordArb: fc.Arbitrary<Word> = fc.constantFrom(...words);
const storyArb: fc.Arbitrary<Story> = fc.constantFrom(...stories);
const sentenceArb: fc.Arbitrary<Sentence> = fc.constantFrom(...sentences);
const matchGameArb: fc.Arbitrary<MatchGame> = fc.constantFrom(...staticMatchGames);

// ── Property Tests ──

/**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**
 */
describe('Property 5: Módulos de dados possuem todos os campos obrigatórios e IDs com prefixo correto', () => {
  it('words: all fields present with correct types and IDs start with w-', () => {
    fc.assert(
      fc.property(wordArb, (w: Word) => {
        expect(typeof w.id).toBe('string');
        expect(w.id.startsWith('w-')).toBe(true);
        expect(typeof w.word).toBe('string');
        expect(w.word.length).toBeGreaterThan(0);
        expect(Array.isArray(w.syllables)).toBe(true);
        expect(w.syllables.length).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(w.difficulty);
        expect(typeof w.category).toBe('string');
        expect(w.category.length).toBeGreaterThan(0);
        expect(typeof w.emoji).toBe('string');
        expect(w.emoji.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('stories: all fields present with correct types and IDs start with s-', () => {
    fc.assert(
      fc.property(storyArb, (s: Story) => {
        expect(typeof s.id).toBe('string');
        expect(s.id.startsWith('s')).toBe(true);
        expect(typeof s.title).toBe('string');
        expect(s.title.length).toBeGreaterThan(0);
        expect(typeof s.emoji).toBe('string');
        expect(s.emoji.length).toBeGreaterThan(0);
        expect(Array.isArray(s.sentences)).toBe(true);
        expect(s.sentences.length).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(s.difficulty);
        expect(typeof s.theme).toBe('string');
        expect(s.theme.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('sentences: all fields present with correct types and IDs start with f', () => {
    fc.assert(
      fc.property(sentenceArb, (s: Sentence) => {
        expect(typeof s.id).toBe('string');
        expect(s.id.startsWith('f')).toBe(true);
        expect(typeof s.text).toBe('string');
        expect(s.text.length).toBeGreaterThan(0);
        expect(Array.isArray(s.words)).toBe(true);
        expect(s.words.length).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(s.difficulty);
      }),
      { numRuns: 100 },
    );
  });

  it('matchGames (static): all fields present with correct types and IDs start with mg-', () => {
    fc.assert(
      fc.property(matchGameArb, (g: MatchGame) => {
        expect(typeof g.id).toBe('string');
        expect(g.id.startsWith('mg-')).toBe(true);
        expect(typeof g.title).toBe('string');
        expect(g.title.length).toBeGreaterThan(0);
        expect(typeof g.mode).toBe('string');
        expect(g.mode.length).toBeGreaterThan(0);
        expect(Array.isArray(g.pairs)).toBe(true);
        expect(g.pairs.length).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(g.difficulty);
        expect(typeof g.emoji).toBe('string');
        expect(g.emoji.length).toBeGreaterThan(0);
        expect(typeof g.description).toBe('string');
        expect(g.description.length).toBeGreaterThan(0);
        expect(typeof g.instructions).toBe('string');
        expect(g.instructions.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
