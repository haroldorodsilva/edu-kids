import type { GameType } from '../progression/types';
import type { DifficultyLevel } from './difficultyLevels';

export type AgeGroup = 'pre' | 'alpha1' | 'alpha2' | 'fluent';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  ageRange: string;
  emoji: string;
  color: string;
  description: string;
  wordDifficulties: (1 | 2 | 3)[];
  availableGames: GameType[];
  defaultDifficulty: DifficultyLevel;
  /** IDs das unidades do currículo visíveis para esta faixa */
  curriculumUnits: string[];
  /** Velocidade da fala (TTS rate) */
  speechRate: number;
}

export const AGE_GROUPS: AgeGroupConfig[] = [
  {
    id: 'pre',
    label: 'Descoberta',
    ageRange: '4–5 anos',
    emoji: '🌱',
    color: '#66BB6A',
    description: 'Reconhecimento visual, associação som-imagem',
    wordDifficulties: [1],
    availableGames: ['quiz', 'memory', 'firstletter'],
    defaultDifficulty: 'easy',
    curriculumUnits: ['u1'],
    speechRate: 0.6,
  },
  {
    id: 'alpha1',
    label: 'Alfabetização I',
    ageRange: '6 anos',
    emoji: '🌿',
    color: '#42A5F5',
    description: 'Sílabas, decodificação, escrita guiada',
    wordDifficulties: [1, 2],
    availableGames: ['syllable', 'quiz', 'fill', 'memory', 'write', 'firstletter', 'buildsentence'],
    defaultDifficulty: 'medium',
    curriculumUnits: ['u1', 'u2', 'u3'],
    speechRate: 0.7,
  },
  {
    id: 'alpha2',
    label: 'Alfabetização II',
    ageRange: '7 anos',
    emoji: '🌳',
    color: '#FFA726',
    description: 'Fluência silábica, escrita autônoma, compreensão',
    wordDifficulties: [1, 2, 3],
    availableGames: ['syllable', 'quiz', 'fill', 'memory', 'write', 'firstletter', 'buildsentence', 'story'],
    defaultDifficulty: 'medium',
    curriculumUnits: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    speechRate: 0.75,
  },
  {
    id: 'fluent',
    label: 'Fluência',
    ageRange: '8+ anos',
    emoji: '🌟',
    color: '#AB47BC',
    description: 'Velocidade, precisão, ditado, compreensão textual',
    wordDifficulties: [1, 2, 3],
    availableGames: ['syllable', 'quiz', 'fill', 'memory', 'write', 'firstletter', 'buildsentence', 'story'],
    defaultDifficulty: 'hard',
    curriculumUnits: [], // vazio = todas
    speechRate: 0.85,
  },
];

export function getAgeGroup(id: AgeGroup): AgeGroupConfig {
  return AGE_GROUPS.find(ag => ag.id === id) ?? AGE_GROUPS[1]; // default: alpha1
}

// ── Storage ──────────────────────────────────────────────────
const AGE_KEY = 'silabrinca_age_group';

export function getSavedAgeGroup(): AgeGroup | null {
  try {
    const val = localStorage.getItem(AGE_KEY);
    if (val && AGE_GROUPS.some(ag => ag.id === val)) return val as AgeGroup;
  } catch { /* noop */ }
  return null;
}

export function saveAgeGroup(id: AgeGroup) {
  try { localStorage.setItem(AGE_KEY, id); } catch { /* noop */ }
}
