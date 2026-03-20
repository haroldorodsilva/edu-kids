import type { Track } from './types';

const NOW = '2025-01-01T00:00:00.000Z';

/**
 * Trilhas de exemplo pré-configuradas (builtin).
 *
 * - Trilha 3–4 anos: reconhecimento de letras, cores/formas, contagem 1–5
 * - Trilha 5–6 anos: sílabas, leitura/escrita, números até 10
 * - Trilha 7–8 anos: leitura fluente, montar frases, matemática básica
 *
 * Todas marcadas como builtin: true para diferenciar de trilhas do admin.
 */
export const BUILTIN_TRACKS: Track[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 3–4 ANOS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-3-4',
    name: 'Descobrindo o Mundo',
    ageGroup: '3-4',
    emoji: '🧒',
    color: '#22c55e',
    builtin: true,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Primeiras Letras (quiz + memória com palavras concretas) ──
      {
        id: 'u-3-4-1',
        title: 'Primeiras Letras',
        subtitle: 'Reconhecendo palavras e figuras',
        emoji: '🔤',
        color: '#22c55e',
        bg: '#f0fdf4',
        lessons: [
          {
            id: 'l-3-4-1-1',
            title: 'Animais',
            emoji: '🐱',
            activities: [
              { id: 'a-3-4-1-1-1', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
              { id: 'a-3-4-1-1-2', gameType: 'memory', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-2',
            title: 'Coisas de Casa',
            emoji: '🏠',
            activities: [
              { id: 'a-3-4-1-2-1', gameType: 'quiz', wordIds: ['w-1', 'w-3', 'w-25', 'w-10'], rounds: 4 },
              { id: 'a-3-4-1-2-2', gameType: 'memory', wordIds: ['w-1', 'w-3', 'w-25', 'w-10'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-3',
            title: 'Comidas',
            emoji: '🍎',
            activities: [
              { id: 'a-3-4-1-3-1', gameType: 'quiz', wordIds: ['w-15', 'w-16', 'w-17', 'w-18'], rounds: 4 },
              { id: 'a-3-4-1-3-2', gameType: 'memory', wordIds: ['w-15', 'w-16', 'w-17', 'w-18'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-4',
            title: 'Natureza',
            emoji: '☀️',
            activities: [
              { id: 'a-3-4-1-4-1', gameType: 'quiz', wordIds: ['w-5', 'w-6', 'w-23', 'w-32'], rounds: 4 },
              { id: 'a-3-4-1-4-2', gameType: 'memory', wordIds: ['w-5', 'w-6', 'w-23', 'w-32'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-5',
            title: 'Revisão',
            emoji: '⭐',
            activities: [
              { id: 'a-3-4-1-5-1', gameType: 'quiz', wordIds: ['w-2', 'w-1', 'w-15', 'w-6', 'w-7'], rounds: 5 },
              { id: 'a-3-4-1-5-2', gameType: 'memory', wordIds: ['w-4', 'w-3', 'w-16', 'w-5', 'w-8'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 2: Cores e Formas (matchgame connect) ─────────────────
      {
        id: 'u-3-4-2',
        title: 'Cores e Formas',
        subtitle: 'Associando cores e formas',
        emoji: '🎨',
        color: '#f59e0b',
        bg: '#fffbeb',
        lessons: [
          {
            id: 'l-3-4-2-1',
            title: 'Animais e Sons',
            emoji: '🐾',
            activities: [
              { id: 'a-3-4-2-1-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-animals', rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-2-2',
            title: 'Letra Inicial',
            emoji: '🔤',
            activities: [
              { id: 'a-3-4-2-2-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-initials', rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-2-3',
            title: 'Mais Animais',
            emoji: '🐶',
            activities: [
              { id: 'a-3-4-2-3-1', gameType: 'quiz', wordIds: ['w-22', 'w-14', 'w-73', 'w-35'], rounds: 4 },
              { id: 'a-3-4-2-3-2', gameType: 'memory', wordIds: ['w-22', 'w-14', 'w-73', 'w-35', 'w-9'], rounds: 4 },
            ],
          },
        ],
      },
      // ── Unidade 3: Contar até 5 (matchgame count) ─────────────────────
      {
        id: 'u-3-4-3',
        title: 'Contar até 5',
        subtitle: 'Aprendendo a contar objetos',
        emoji: '🔢',
        color: '#3b82f6',
        bg: '#eff6ff',
        lessons: [
          {
            id: 'l-3-4-3-1',
            title: 'Contar Objetos',
            emoji: '🍎',
            activities: [
              { id: 'a-3-4-3-1-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
            ],
          },
          {
            id: 'l-3-4-3-2',
            title: 'Números e Bichos',
            emoji: '🐶',
            activities: [
              { id: 'a-3-4-3-2-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
              { id: 'a-3-4-3-2-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-35', 'w-22'], rounds: 5 },
            ],
          },
          {
            id: 'l-3-4-3-3',
            title: 'Contar e Lembrar',
            emoji: '🧠',
            activities: [
              { id: 'a-3-4-3-3-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
              { id: 'a-3-4-3-3-2', gameType: 'memory', wordIds: ['w-1', 'w-6', 'w-5', 'w-7', 'w-15'], rounds: 5 },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 5–6 ANOS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-5-6',
    name: 'Aprendendo a Ler',
    ageGroup: '5-6',
    emoji: '👦',
    color: '#3b82f6',
    builtin: true,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Sílabas Simples (syllable, fill com BA-CA-DA) ──────
      {
        id: 'u-5-6-1',
        title: 'Sílabas Simples',
        subtitle: 'Famílias silábicas BA, CA, DA',
        emoji: '📖',
        color: '#3b82f6',
        bg: '#eff6ff',
        lessons: [
          {
            id: 'l-5-6-1-1',
            title: 'Família BA',
            emoji: '🍌',
            activities: [
              { id: 'a-5-6-1-1-1', gameType: 'syllable', wordIds: ['w-1', 'w-15', 'w-72', 'w-31', 'w-79'], rounds: 5 },
              { id: 'a-5-6-1-1-2', gameType: 'fill', wordIds: ['w-1', 'w-15', 'w-72', 'w-31'], rounds: 4 },
            ],
          },
          {
            id: 'l-5-6-1-2',
            title: 'Família CA',
            emoji: '🏠',
            activities: [
              { id: 'a-5-6-1-2-1', gameType: 'syllable', wordIds: ['w-3', 'w-25', 'w-26', 'w-91', 'w-92'], rounds: 5 },
              { id: 'a-5-6-1-2-2', gameType: 'fill', wordIds: ['w-3', 'w-25', 'w-26', 'w-91'], rounds: 4 },
            ],
          },
          {
            id: 'l-5-6-1-3',
            title: 'Família DA',
            emoji: '🎲',
            activities: [
              { id: 'a-5-6-1-3-1', gameType: 'syllable', wordIds: ['w-11', 'w-30', 'w-78', 'w-82'], rounds: 4 },
              { id: 'a-5-6-1-3-2', gameType: 'fill', wordIds: ['w-11', 'w-30', 'w-78'], rounds: 3 },
            ],
          },
          {
            id: 'l-5-6-1-4',
            title: 'Mistura BA-CA-DA',
            emoji: '🎯',
            activities: [
              { id: 'a-5-6-1-4-1', gameType: 'syllable', wordIds: ['w-1', 'w-3', 'w-11', 'w-72', 'w-25'], rounds: 5 },
              { id: 'a-5-6-1-4-2', gameType: 'fill', wordIds: ['w-15', 'w-26', 'w-30', 'w-79', 'w-91'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 2: Ler e Escrever (write, quiz nível 1) ──────────────
      {
        id: 'u-5-6-2',
        title: 'Ler e Escrever',
        subtitle: 'Escrevendo palavras simples',
        emoji: '✏️',
        color: '#10b981',
        bg: '#ecfdf5',
        lessons: [
          {
            id: 'l-5-6-2-1',
            title: 'Animais',
            emoji: '🐱',
            activities: [
              { id: 'a-5-6-2-1-1', gameType: 'write', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
              { id: 'a-5-6-2-1-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-2-2',
            title: 'Comidas',
            emoji: '🍎',
            activities: [
              { id: 'a-5-6-2-2-1', gameType: 'write', wordIds: ['w-15', 'w-16', 'w-18', 'w-30', 'w-89'], rounds: 5 },
              { id: 'a-5-6-2-2-2', gameType: 'quiz', wordIds: ['w-15', 'w-16', 'w-18', 'w-30', 'w-89'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-2-3',
            title: 'Natureza',
            emoji: '🌸',
            activities: [
              { id: 'a-5-6-2-3-1', gameType: 'write', wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-102'], rounds: 5 },
              { id: 'a-5-6-2-3-2', gameType: 'quiz', wordIds: ['w-5', 'w-6', 'w-32', 'w-38', 'w-102'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-2-4',
            title: 'Histórias Fáceis',
            emoji: '📚',
            activities: [
              { id: 'a-5-6-2-4-1', gameType: 'story', wordIds: [], storyId: 's1', storyMode: 'typing' },
              { id: 'a-5-6-2-4-2', gameType: 'story', wordIds: [], storyId: 's2', storyMode: 'typing' },
            ],
          },
        ],
      },
      // ── Unidade 3: Números até 10 (contagem) ──────────────────────────
      {
        id: 'u-5-6-3',
        title: 'Números até 10',
        subtitle: 'Contando e reconhecendo números',
        emoji: '🔢',
        color: '#f59e0b',
        bg: '#fffbeb',
        lessons: [
          {
            id: 'l-5-6-3-1',
            title: 'Contar até 5',
            emoji: '✋',
            activities: [
              { id: 'a-5-6-3-1-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-3-2',
            title: 'Contar até 10',
            emoji: '🔟',
            activities: [
              { id: 'a-5-6-3-2-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
              { id: 'a-5-6-3-2-2', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-firstletter-type', rounds: 6 },
            ],
          },
          {
            id: 'l-5-6-3-3',
            title: 'Números e Palavras',
            emoji: '📝',
            activities: [
              { id: 'a-5-6-3-3-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
              { id: 'a-5-6-3-3-2', gameType: 'write', wordIds: ['w-6', 'w-5', 'w-32', 'w-33', 'w-37'], rounds: 5 },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 7–8 ANOS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-7-8',
    name: 'Leitura e Escrita',
    ageGroup: '7-8',
    emoji: '👧',
    color: '#8b5cf6',
    builtin: true,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Leitura Fluente (write, fill nível 2–3) ────────────
      {
        id: 'u-7-8-1',
        title: 'Leitura Fluente',
        subtitle: 'Palavras mais longas e complexas',
        emoji: '📖',
        color: '#8b5cf6',
        bg: '#f5f3ff',
        lessons: [
          {
            id: 'l-7-8-1-1',
            title: 'Trissílabos',
            emoji: '📝',
            activities: [
              { id: 'a-7-8-1-1-1', gameType: 'write', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
              { id: 'a-7-8-1-1-2', gameType: 'fill', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
            ],
          },
          {
            id: 'l-7-8-1-2',
            title: 'Dígrafos',
            emoji: '🔠',
            activities: [
              { id: 'a-7-8-1-2-1', gameType: 'write', wordIds: ['w-46', 'w-57', 'w-60', 'w-65', 'w-127'], rounds: 5 },
              { id: 'a-7-8-1-2-2', gameType: 'fill', wordIds: ['w-46', 'w-57', 'w-60', 'w-65', 'w-127'], rounds: 5 },
            ],
          },
          {
            id: 'l-7-8-1-3',
            title: 'Palavras Longas',
            emoji: '🦋',
            activities: [
              { id: 'a-7-8-1-3-1', gameType: 'write', wordIds: ['w-66', 'w-67', 'w-68', 'w-69', 'w-70'], rounds: 5 },
              { id: 'a-7-8-1-3-2', gameType: 'fill', wordIds: ['w-66', 'w-67', 'w-68', 'w-69', 'w-70'], rounds: 5 },
            ],
          },
          {
            id: 'l-7-8-1-4',
            title: 'Desafio Avançado',
            emoji: '🏆',
            activities: [
              { id: 'a-7-8-1-4-1', gameType: 'write', wordIds: ['w-182', 'w-183', 'w-184', 'w-187', 'w-192'], rounds: 5 },
              { id: 'a-7-8-1-4-2', gameType: 'fill', wordIds: ['w-185', 'w-186', 'w-193', 'w-195', 'w-196'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 2: Montar Frases (buildsentence, stories) ─────────────
      {
        id: 'u-7-8-2',
        title: 'Montar Frases',
        subtitle: 'Construindo e lendo frases completas',
        emoji: '🧩',
        color: '#ec4899',
        bg: '#fdf2f8',
        lessons: [
          {
            id: 'l-7-8-2-1',
            title: 'Frases Simples',
            emoji: '💬',
            activities: [
              { id: 'a-7-8-2-1-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f1', 'f2', 'f3'], rounds: 3 },
            ],
          },
          {
            id: 'l-7-8-2-2',
            title: 'Mais Frases',
            emoji: '📝',
            activities: [
              { id: 'a-7-8-2-2-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f4', 'f5', 'f6'], rounds: 3 },
              { id: 'a-7-8-2-2-2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f7', 'f8', 'f9'], rounds: 3 },
            ],
          },
          {
            id: 'l-7-8-2-3',
            title: 'Histórias Nível 2',
            emoji: '📚',
            activities: [
              { id: 'a-7-8-2-3-1', gameType: 'story', wordIds: [], storyId: 's4', storyMode: 'typing' },
              { id: 'a-7-8-2-3-2', gameType: 'story', wordIds: [], storyId: 's5', storyMode: 'typing' },
            ],
          },
          {
            id: 'l-7-8-2-4',
            title: 'Histórias Avançadas',
            emoji: '🦋',
            activities: [
              { id: 'a-7-8-2-4-1', gameType: 'story', wordIds: [], storyId: 's6', storyMode: 'typing' },
              { id: 'a-7-8-2-4-2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f10', 'f11', 'f12'], rounds: 3 },
            ],
          },
        ],
      },
      // ── Unidade 3: Matemática (matchgame type adição/subtração) ───────
      {
        id: 'u-7-8-3',
        title: 'Matemática',
        subtitle: 'Adição e subtração até 20',
        emoji: '➕',
        color: '#f59e0b',
        bg: '#fffbeb',
        lessons: [
          {
            id: 'l-7-8-3-1',
            title: 'Qual a Cor?',
            emoji: '🎨',
            activities: [
              { id: 'a-7-8-3-1-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-colors-type', rounds: 4 },
            ],
          },
          {
            id: 'l-7-8-3-2',
            title: 'Letra Inicial',
            emoji: '🔤',
            activities: [
              { id: 'a-7-8-3-2-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-firstletter-type', rounds: 6 },
            ],
          },
          {
            id: 'l-7-8-3-3',
            title: 'Contar e Digitar',
            emoji: '🔢',
            activities: [
              { id: 'a-7-8-3-3-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-counting', rounds: 5 },
              { id: 'a-7-8-3-3-2', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-colors-type', rounds: 4 },
            ],
          },
        ],
      },
    ],
  },
];
