import type { GameType } from '../progression/types';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'endless';

export interface GameDifficultyOverride {
  rounds?: number;
  distractors?: number;       // Quiz, FirstLetter
  revealPercentage?: number;  // Fill
  memoryPairs?: number;       // Memory
  sentenceMaxWords?: number;  // BuildSentence
  speechRate?: number;
  hintLevel?: 'full' | 'partial' | 'none';
}

export interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  /** Nome do ícone Lucide */
  icon: string;
  /** @deprecated Use `icon` */
  emoji?: string;
  color: string;
  wordDifficulties: (1 | 2 | 3)[];
  overrides: Partial<Record<GameType, GameDifficultyOverride>>;
}

export const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    id: 'easy',
    label: 'Fácil',
    icon: 'Sprout',
    color: '#66BB6A',
    wordDifficulties: [1],
    overrides: {
      syllable:       { rounds: 4 },
      quiz:           { rounds: 4, distractors: 2 },
      fill:           { rounds: 4, revealPercentage: 0.30 },
      memory:         { memoryPairs: 3 },
      write:          { rounds: 3 },
      firstletter:    { rounds: 5, distractors: 2 },
      buildsentence:  { rounds: 3, sentenceMaxWords: 4 },
    },
  },
  {
    id: 'medium',
    label: 'Médio',
    icon: 'Leaf',
    color: '#42A5F5',
    wordDifficulties: [1, 2],
    overrides: {
      syllable:       { rounds: 5 },
      quiz:           { rounds: 6, distractors: 3 },
      fill:           { rounds: 5, revealPercentage: 0.40 },
      memory:         { memoryPairs: 5 },
      write:          { rounds: 5 },
      firstletter:    { rounds: 8, distractors: 3 },
      buildsentence:  { rounds: 5, sentenceMaxWords: 6 },
    },
  },
  {
    id: 'hard',
    label: 'Difícil',
    icon: 'TreeDeciduous',
    color: '#FFA726',
    wordDifficulties: [1, 2, 3],
    overrides: {
      syllable:       { rounds: 6 },
      quiz:           { rounds: 8, distractors: 3 },
      fill:           { rounds: 6, revealPercentage: 0.50 },
      memory:         { memoryPairs: 7 },
      write:          { rounds: 6 },
      firstletter:    { rounds: 10, distractors: 3 },
      buildsentence:  { rounds: 6, sentenceMaxWords: 8 },
    },
  },
  {
    id: 'endless',
    label: 'Infinito',
    icon: 'Star',
    color: '#AB47BC',
    wordDifficulties: [1, 2, 3],
    overrides: {
      syllable:       { rounds: 999 },
      quiz:           { rounds: 999, distractors: 3 },
      fill:           { rounds: 999, revealPercentage: 0.50 },
      memory:         { memoryPairs: 8 },
      write:          { rounds: 999 },
      firstletter:    { rounds: 999, distractors: 3 },
      buildsentence:  { rounds: 999, sentenceMaxWords: 8 },
    },
  },
];

export function getDifficulty(id: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_LEVELS.find(d => d.id === id) ?? DIFFICULTY_LEVELS[1]; // default: medium
}
