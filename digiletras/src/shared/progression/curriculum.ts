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
          { id: 'u1-l1-a1', gameType: 'quiz',        wordIds: ['1', '2', '3', '4', '12'], rounds: 5 },
          { id: 'u1-l1-a2', gameType: 'memory',      wordIds: ['1', '2', '3', '4', '12'] },
          { id: 'u1-l1-a3', gameType: 'firstletter', wordIds: ['1', '2', '3', '4', '12'], rounds: 5 },
        ],
      },
      {
        id: 'u1-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u1-l2-a1', gameType: 'syllable', wordIds: ['1', '2', '3', '4', '12'], rounds: 5 },
          { id: 'u1-l2-a2', gameType: 'fill',     wordIds: ['1', '2', '3', '4', '12'], rounds: 5 },
        ],
      },
      {
        id: 'u1-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u1-l3-a1', gameType: 'write',         wordIds: ['1', '2', '3', '4', '12'], rounds: 5 },
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
          { id: 'u2-l1-a1', gameType: 'quiz',        wordIds: ['5', '6', '32', '38', '23'], rounds: 5 },
          { id: 'u2-l1-a2', gameType: 'memory',      wordIds: ['5', '6', '32', '38', '23'] },
          { id: 'u2-l1-a3', gameType: 'firstletter', wordIds: ['5', '6', '32', '38', '23', '24'], rounds: 6 },
        ],
      },
      {
        id: 'u2-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u2-l2-a1', gameType: 'syllable', wordIds: ['5', '6', '32', '38', '23', '24'], rounds: 5 },
          { id: 'u2-l2-a2', gameType: 'fill',     wordIds: ['5', '6', '32', '38', '23', '24'], rounds: 5 },
        ],
      },
      {
        id: 'u2-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u2-l3-a1', gameType: 'write',        wordIds: ['5', '6', '32', '38', '23', '24'], rounds: 5 },
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
          { id: 'u3-l1-a1', gameType: 'quiz',        wordIds: ['8', '22', '35', '14', '37'], rounds: 5 },
          { id: 'u3-l1-a2', gameType: 'memory',      wordIds: ['8', '22', '35', '14', '37'] },
          { id: 'u3-l1-a3', gameType: 'firstletter', wordIds: ['8', '22', '35', '14', '37'], rounds: 5 },
        ],
      },
      {
        id: 'u3-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u3-l2-a1', gameType: 'syllable', wordIds: ['8', '22', '35', '14', '37'], rounds: 5 },
          { id: 'u3-l2-a2', gameType: 'fill',     wordIds: ['8', '22', '35', '14', '37'], rounds: 5 },
        ],
      },
      {
        id: 'u3-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u3-l3-a1', gameType: 'write',        wordIds: ['8', '22', '35', '14', '37'], rounds: 5 },
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
          { id: 'u4-l1-a1', gameType: 'quiz',        wordIds: ['10', '25', '31', '13', '11'], rounds: 5 },
          { id: 'u4-l1-a2', gameType: 'memory',      wordIds: ['10', '25', '31', '13', '11'] },
          { id: 'u4-l1-a3', gameType: 'firstletter', wordIds: ['10', '25', '31', '13', '11', '21'], rounds: 6 },
        ],
      },
      {
        id: 'u4-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u4-l2-a1', gameType: 'syllable', wordIds: ['10', '25', '31', '13', '11', '21'], rounds: 5 },
          { id: 'u4-l2-a2', gameType: 'fill',     wordIds: ['10', '25', '31', '13', '11', '21'], rounds: 5 },
        ],
      },
      {
        id: 'u4-l3',
        title: 'Escrever',
        emoji: '✍️',
        activities: [
          { id: 'u4-l3-a1', gameType: 'write',        wordIds: ['10', '25', '31', '13', '11', '21'], rounds: 5 },
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
          { id: 'u5-l1-a1', gameType: 'quiz',        wordIds: ['41', '42', '43', '44', '48'], rounds: 5 },
          { id: 'u5-l1-a2', gameType: 'memory',      wordIds: ['41', '42', '43', '44', '48'] },
          { id: 'u5-l1-a3', gameType: 'firstletter', wordIds: ['41', '42', '43', '44', '48', '49'], rounds: 6 },
        ],
      },
      {
        id: 'u5-l2',
        title: 'Sílabas',
        emoji: '🧩',
        activities: [
          { id: 'u5-l2-a1', gameType: 'syllable', wordIds: ['41', '42', '43', '44', '48', '49'], rounds: 5 },
          { id: 'u5-l2-a2', gameType: 'fill',     wordIds: ['41', '42', '43', '44', '48', '49'], rounds: 5 },
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
