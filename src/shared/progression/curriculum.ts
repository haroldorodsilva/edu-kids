import type { Unit } from './types';

export const curriculum: Unit[] = [
  {
    id: 'u1',
    title: 'Primeiras Palavras',
    subtitle: 'Palavras simples do dia a dia',
    emoji: '⚽',
    color: '#E91E63',
    bg: '#FCE4EC',
    lessons: [
      {
        id: 'u1-l1',
        title: 'Reconhecer',
        emoji: '👀',
        activities: [
          { id: 'u1-l1-a1', gameType: 'quiz',        wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'], rounds: 5 },
          { id: 'u1-l1-a2', gameType: 'memory',      wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'] },
          { id: 'u1-l1-a3', gameType: 'firstletter', wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'], rounds: 5 },
        ],
      },
      {
        id: 'u1-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u1-l2-a1', gameType: 'syllable', wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'], rounds: 5 },
          { id: 'u1-l2-a2', gameType: 'fill',     wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'], rounds: 5 },
        ],
      },
      {
        id: 'u1-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u1-l3-a1', gameType: 'write',         wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-12'], rounds: 5 },
          { id: 'u1-l3-a2', gameType: 'buildsentence',  wordIds: [], sentenceIds: ['f1', 'f6', 'f7'], rounds: 3 },
        ],
      },
    ],
  },
  {
    id: 'u2',
    title: 'Na Natureza',
    subtitle: 'Elementos do mundo natural',
    emoji: '🌙',
    color: '#00897B',
    bg: '#E0F2F1',
    lessons: [
      {
        id: 'u2-l1',
        title: 'Reconhecer',
        emoji: '👀',
        activities: [
          { id: 'u2-l1-a1', gameType: 'quiz',        wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23'], rounds: 5 },
          { id: 'u2-l1-a2', gameType: 'memory',      wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23'] },
          { id: 'u2-l1-a3', gameType: 'firstletter', wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23', 'w-24'], rounds: 6 },
        ],
      },
      {
        id: 'u2-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u2-l2-a1', gameType: 'syllable', wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23', 'w-24'], rounds: 5 },
          { id: 'u2-l2-a2', gameType: 'fill',     wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23', 'w-24'], rounds: 5 },
        ],
      },
      {
        id: 'u2-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u2-l3-a1', gameType: 'write',        wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-23', 'w-24'], rounds: 5 },
          { id: 'u2-l3-a2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f8', 'f11', 'f12'], rounds: 3 },
        ],
      },
    ],
  },
  {
    id: 'u3',
    title: 'Animais',
    subtitle: 'Bichos e criaturas',
    emoji: '🐸',
    color: '#7B1FA2',
    bg: '#E1BEE7',
    lessons: [
      {
        id: 'u3-l1',
        title: 'Reconhecer',
        emoji: '👀',
        activities: [
          { id: 'u3-l1-a1', gameType: 'quiz',        wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'], rounds: 5 },
          { id: 'u3-l1-a2', gameType: 'memory',      wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'] },
          { id: 'u3-l1-a3', gameType: 'firstletter', wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'], rounds: 5 },
        ],
      },
      {
        id: 'u3-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u3-l2-a1', gameType: 'syllable', wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'], rounds: 5 },
          { id: 'u3-l2-a2', gameType: 'fill',     wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'], rounds: 5 },
        ],
      },
      {
        id: 'u3-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u3-l3-a1', gameType: 'write',        wordIds: ['w-8', 'w-22', 'w-35', 'w-14', 'w-37'], rounds: 5 },
          { id: 'u3-l3-a2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f3', 'f9', 'f10'], rounds: 3 },
        ],
      },
    ],
  },
  {
    id: 'u4',
    title: 'Em Casa',
    subtitle: 'Objetos do cotidiano',
    emoji: '🪑',
    color: '#FF6F00',
    bg: '#FFF8E1',
    lessons: [
      {
        id: 'u4-l1',
        title: 'Reconhecer',
        emoji: '👀',
        activities: [
          { id: 'u4-l1-a1', gameType: 'quiz',        wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11'], rounds: 5 },
          { id: 'u4-l1-a2', gameType: 'memory',      wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11'] },
          { id: 'u4-l1-a3', gameType: 'firstletter', wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11', 'w-21'], rounds: 6 },
        ],
      },
      {
        id: 'u4-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u4-l2-a1', gameType: 'syllable', wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11', 'w-21'], rounds: 5 },
          { id: 'u4-l2-a2', gameType: 'fill',     wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11', 'w-21'], rounds: 5 },
        ],
      },
      {
        id: 'u4-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u4-l3-a1', gameType: 'write',        wordIds: ['w-10', 'w-25', 'w-31', 'w-13', 'w-11', 'w-21'], rounds: 5 },
          { id: 'u4-l3-a2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f2', 'f4', 'f5'], rounds: 3 },
        ],
      },
    ],
  },
  {
    id: 'u5',
    title: 'Palavras Longas',
    subtitle: 'Palavras com mais sílabas',
    emoji: '⭐',
    color: '#1565C0',
    bg: '#E3F2FD',
    lessons: [
      {
        id: 'u5-l1',
        title: 'Reconhecer',
        emoji: '👀',
        activities: [
          { id: 'u5-l1-a1', gameType: 'quiz',        wordIds: ['w-41', 'w-42', 'w-43', 'w-44', 'w-48'], rounds: 5 },
          { id: 'u5-l1-a2', gameType: 'memory',      wordIds: ['w-41', 'w-42', 'w-43', 'w-44', 'w-48'] },
          { id: 'u5-l1-a3', gameType: 'firstletter', wordIds: ['w-41', 'w-42', 'w-43', 'w-44', 'w-48', 'w-49'], rounds: 6 },
        ],
      },
      {
        id: 'u5-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u5-l2-a1', gameType: 'syllable', wordIds: ['w-41', 'w-42', 'w-43', 'w-44', 'w-48', 'w-49'], rounds: 5 },
          { id: 'u5-l2-a2', gameType: 'fill',     wordIds: ['w-41', 'w-42', 'w-43', 'w-44', 'w-48', 'w-49'], rounds: 5 },
        ],
      },
      {
        id: 'u5-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          {
            id: 'u5-l3-a1',
            gameType: 'story',
            wordIds: [],
            storyId: 's4',
            storyMode: 'typing',
          },
          {
            id: 'u5-l3-a2',
            gameType: 'story',
            wordIds: [],
            storyId: 's5',
            storyMode: 'typing',
          },
        ],
      },
    ],
  },
];
