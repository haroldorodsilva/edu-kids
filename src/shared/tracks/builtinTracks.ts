import type { Track } from './types';

const NOW = '2025-01-01T00:00:00.000Z';

/**
 * Trilhas de aprendizagem pré-configuradas (builtin).
 *
 * Progressão pedagógica:
 * - 3–4 anos  → Vogais, reconhecimento visual, memória, letra inicial
 * - 5–6 anos  → Família silábica, sílabas simples, leitura inicial, escrita
 * - 7–8 anos  → Sílabas avançadas, trissílabas, frases, histórias
 * - 9–10 anos → Ditado, leitura fluente, frases complexas, histórias avançadas
 */
export const BUILTIN_TRACKS: Track[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 3–4 ANOS — Descobrindo o Mundo
  // Foco: vogais, reconhecimento visual, memória, letra inicial
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-3-4',
    name: 'Descobrindo o Mundo',
    ageGroup: '3-4',
    emoji: '🧒',
    color: '#22c55e',
    builtin: true,
    version: 2,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: As Vogais ────────────────────────────────────────────────
      {
        id: 'u-3-4-1',
        title: 'As Vogais',
        subtitle: 'Conhecendo A · E · I · O · U',
        emoji: '🔤',
        color: '#F57F17',
        bg: '#FFF9C4',
        lessons: [
          {
            id: 'l-3-4-1-1',
            title: 'Vogais com Animais',
            emoji: '🐱',
            activities: [
              { id: 'a-3-4-1-1-1', gameType: 'vowelgame', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
              { id: 'a-3-4-1-1-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-2',
            title: 'Vogais com Comidas',
            emoji: '🍎',
            activities: [
              { id: 'a-3-4-1-2-1', gameType: 'vowelgame', wordIds: ['w-15', 'w-16', 'w-17', 'w-18'], rounds: 4 },
              { id: 'a-3-4-1-2-2', gameType: 'quiz', wordIds: ['w-15', 'w-16', 'w-17', 'w-18'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-3',
            title: 'Vogais com Natureza',
            emoji: '☀️',
            activities: [
              { id: 'a-3-4-1-3-1', gameType: 'vowelgame', wordIds: ['w-5', 'w-6', 'w-23', 'w-32'], rounds: 4 },
              { id: 'a-3-4-1-3-2', gameType: 'memory', wordIds: ['w-5', 'w-6', 'w-23', 'w-32'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-1-4',
            title: 'Revisão das Vogais',
            emoji: '⭐',
            activities: [
              { id: 'a-3-4-1-4-1', gameType: 'vowelgame', wordIds: ['w-2', 'w-15', 'w-5', 'w-1', 'w-7'], rounds: 5 },
              { id: 'a-3-4-1-4-2', gameType: 'memory', wordIds: ['w-4', 'w-16', 'w-6', 'w-3', 'w-8'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 2: Reconhecer Letras ────────────────────────────────────────
      {
        id: 'u-3-4-2',
        title: 'Reconhecer Letras',
        subtitle: 'Letra inicial das palavras',
        emoji: '🔠',
        color: '#22c55e',
        bg: '#f0fdf4',
        lessons: [
          {
            id: 'l-3-4-2-1',
            title: 'Qual Letra?',
            emoji: '🐾',
            activities: [
              { id: 'a-3-4-2-1-1', gameType: 'firstletter', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
              { id: 'a-3-4-2-1-2', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-initials', rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-2-2',
            title: 'Animais e Iniciais',
            emoji: '🐶',
            activities: [
              { id: 'a-3-4-2-2-1', gameType: 'firstletter', wordIds: ['w-22', 'w-14', 'w-73', 'w-35'], rounds: 4 },
              { id: 'a-3-4-2-2-2', gameType: 'memory', wordIds: ['w-22', 'w-14', 'w-73', 'w-35', 'w-9'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-2-3',
            title: 'Ligar Sons',
            emoji: '🔗',
            activities: [
              { id: 'a-3-4-2-3-1', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-animals', rounds: 4 },
            ],
          },
        ],
      },
      // ── Unidade 3: Memória e Diversão ───────────────────────────────────────
      {
        id: 'u-3-4-3',
        title: 'Memória e Diversão',
        subtitle: 'Treine a memória e divirta-se!',
        emoji: '🧠',
        color: '#3b82f6',
        bg: '#eff6ff',
        lessons: [
          {
            id: 'l-3-4-3-1',
            title: 'Memória de Animais',
            emoji: '🐘',
            activities: [
              { id: 'a-3-4-3-1-1', gameType: 'memory', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
              { id: 'a-3-4-3-1-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
            ],
          },
          {
            id: 'l-3-4-3-2',
            title: 'Memória de Comidas',
            emoji: '🍌',
            activities: [
              { id: 'a-3-4-3-2-1', gameType: 'memory', wordIds: ['w-15', 'w-16', 'w-17', 'w-18', 'w-30'], rounds: 5 },
              { id: 'a-3-4-3-2-2', gameType: 'vowelgame', wordIds: ['w-15', 'w-16', 'w-17', 'w-18'], rounds: 4 },
            ],
          },
          {
            id: 'l-3-4-3-3',
            title: 'Desafio Final',
            emoji: '🏆',
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
  // TRILHA 5–6 ANOS — Aprendendo a Ler
  // Foco: vogais em palavras, família silábica, sílabas simples, escrita inicial
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-5-6',
    name: 'Aprendendo a Ler',
    ageGroup: '5-6',
    emoji: '👦',
    color: '#3b82f6',
    builtin: true,
    version: 2,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Vogais e Consoantes ─────────────────────────────────────
      {
        id: 'u-5-6-1',
        title: 'Vogais e Consoantes',
        subtitle: 'A diferença entre vogais e consoantes',
        emoji: '🔤',
        color: '#F57F17',
        bg: '#FFF9C4',
        lessons: [
          {
            id: 'l-5-6-1-1',
            title: 'Encontrando as Vogais',
            emoji: '🎯',
            activities: [
              { id: 'a-5-6-1-1-1', gameType: 'vowelgame', wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5'], rounds: 5 },
              { id: 'a-5-6-1-1-2', gameType: 'firstletter', wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-1-2',
            title: 'Vogais em Animais',
            emoji: '🐱',
            activities: [
              { id: 'a-5-6-1-2-1', gameType: 'vowelgame', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
              { id: 'a-5-6-1-2-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-1-3',
            title: 'Memória de Letras',
            emoji: '🧠',
            activities: [
              { id: 'a-5-6-1-3-1', gameType: 'memory', wordIds: ['w-1', 'w-2', 'w-3', 'w-4', 'w-5'], rounds: 5 },
              { id: 'a-5-6-1-3-2', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-initials', rounds: 4 },
            ],
          },
        ],
      },
      // ── Unidade 2: Família Silábica ─────────────────────────────────────────
      {
        id: 'u-5-6-2',
        title: 'Família Silábica',
        subtitle: 'Consoante + Vogal = Sílaba (BA, CA, DA...)',
        emoji: '📖',
        color: '#0288D1',
        bg: '#E1F5FE',
        lessons: [
          {
            id: 'l-5-6-2-1',
            title: 'Família B (BA BE BI BO BU)',
            emoji: '🍌',
            activities: [
              { id: 'a-5-6-2-1-1', gameType: 'silfamilia', wordIds: [], rounds: 5 },
              { id: 'a-5-6-2-1-2', gameType: 'syllable', wordIds: ['w-1', 'w-15', 'w-72', 'w-31', 'w-79'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-2-2',
            title: 'Família M (MA ME MI MO MU)',
            emoji: '🍯',
            activities: [
              { id: 'a-5-6-2-2-1', gameType: 'silfamilia', wordIds: [], rounds: 5 },
              { id: 'a-5-6-2-2-2', gameType: 'fill', wordIds: ['w-1', 'w-15', 'w-72', 'w-31'], rounds: 4 },
            ],
          },
          {
            id: 'l-5-6-2-3',
            title: 'Família P (PA PE PI PO PU)',
            emoji: '🦆',
            activities: [
              { id: 'a-5-6-2-3-1', gameType: 'silfamilia', wordIds: [], rounds: 5 },
              { id: 'a-5-6-2-3-2', gameType: 'syllable', wordIds: ['w-3', 'w-25', 'w-26', 'w-91', 'w-92'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-2-4',
            title: 'Mistura de Famílias',
            emoji: '🎯',
            activities: [
              { id: 'a-5-6-2-4-1', gameType: 'silfamilia', wordIds: [], rounds: 8 },
              { id: 'a-5-6-2-4-2', gameType: 'fill', wordIds: ['w-15', 'w-26', 'w-30', 'w-79', 'w-91'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 3: Sílabas e Palavras ──────────────────────────────────────
      {
        id: 'u-5-6-3',
        title: 'Sílabas e Palavras',
        subtitle: 'Montando palavras com sílabas',
        emoji: '🧩',
        color: '#3b82f6',
        bg: '#eff6ff',
        lessons: [
          {
            id: 'l-5-6-3-1',
            title: 'Monte a Palavra',
            emoji: '🔡',
            activities: [
              { id: 'a-5-6-3-1-1', gameType: 'syllable', wordIds: ['w-1', 'w-3', 'w-11', 'w-72', 'w-25'], rounds: 5 },
              { id: 'a-5-6-3-1-2', gameType: 'fill', wordIds: ['w-2', 'w-4', 'w-8', 'w-12'], rounds: 4 },
            ],
          },
          {
            id: 'l-5-6-3-2',
            title: 'Completar Palavras',
            emoji: '✏️',
            activities: [
              { id: 'a-5-6-3-2-1', gameType: 'fill', wordIds: ['w-5', 'w-6', 'w-23', 'w-32', 'w-15'], rounds: 5 },
              { id: 'a-5-6-3-2-2', gameType: 'quiz', wordIds: ['w-5', 'w-6', 'w-23', 'w-32', 'w-15'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 4: Leitura e Escrita Inicial ───────────────────────────────
      {
        id: 'u-5-6-4',
        title: 'Leitura e Escrita',
        subtitle: 'Escrevendo as primeiras palavras',
        emoji: '✏️',
        color: '#10b981',
        bg: '#ecfdf5',
        lessons: [
          {
            id: 'l-5-6-4-1',
            title: 'Escrever Animais',
            emoji: '🐱',
            activities: [
              { id: 'a-5-6-4-1-1', gameType: 'write', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
              { id: 'a-5-6-4-1-2', gameType: 'quiz', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-22'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-4-2',
            title: 'Escrever Comidas',
            emoji: '🍎',
            activities: [
              { id: 'a-5-6-4-2-1', gameType: 'write', wordIds: ['w-15', 'w-16', 'w-18', 'w-30', 'w-89'], rounds: 5 },
              { id: 'a-5-6-4-2-2', gameType: 'quiz', wordIds: ['w-15', 'w-16', 'w-18', 'w-30', 'w-89'], rounds: 5 },
            ],
          },
          {
            id: 'l-5-6-4-3',
            title: 'Primeira Históriinha',
            emoji: '📚',
            activities: [
              { id: 'a-5-6-4-3-1', gameType: 'story', wordIds: [], storyId: 's1', storyMode: 'typing' },
              { id: 'a-5-6-4-3-2', gameType: 'story', wordIds: [], storyId: 's7', storyMode: 'typing' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 7–8 ANOS — Lendo e Escrevendo
  // Foco: sílabas complexas, trissílabas, frases, histórias
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-7-8',
    name: 'Lendo e Escrevendo',
    ageGroup: '7-8',
    emoji: '👧',
    color: '#8b5cf6',
    builtin: true,
    version: 2,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Sílabas Avançadas ────────────────────────────────────────
      {
        id: 'u-7-8-1',
        title: 'Sílabas Avançadas',
        subtitle: 'Famílias silábicas mais desafiadoras',
        emoji: '🔠',
        color: '#0288D1',
        bg: '#E1F5FE',
        lessons: [
          {
            id: 'l-7-8-1-1',
            title: 'Família T e V',
            emoji: '🐯',
            activities: [
              { id: 'a-7-8-1-1-1', gameType: 'silfamilia', wordIds: [], rounds: 8 },
              { id: 'a-7-8-1-1-2', gameType: 'syllable', wordIds: ['w-11', 'w-30', 'w-78', 'w-82', 'w-3'], rounds: 5 },
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
        ],
      },
      // ── Unidade 2: Trissílabas ──────────────────────────────────────────────
      {
        id: 'u-7-8-2',
        title: 'Trissílabas',
        subtitle: 'Palavras com três sílabas',
        emoji: '📝',
        color: '#8b5cf6',
        bg: '#f5f3ff',
        lessons: [
          {
            id: 'l-7-8-2-1',
            title: 'Três Sílabas',
            emoji: '📝',
            activities: [
              { id: 'a-7-8-2-1-1', gameType: 'syllable', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
              { id: 'a-7-8-2-1-2', gameType: 'write', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
            ],
          },
          {
            id: 'l-7-8-2-2',
            title: 'Palavras Longas',
            emoji: '🦋',
            activities: [
              { id: 'a-7-8-2-2-1', gameType: 'syllable', wordIds: ['w-66', 'w-67', 'w-68', 'w-69', 'w-70'], rounds: 5 },
              { id: 'a-7-8-2-2-2', gameType: 'fill', wordIds: ['w-66', 'w-67', 'w-68', 'w-69', 'w-70'], rounds: 5 },
            ],
          },
          {
            id: 'l-7-8-2-3',
            title: 'Vogais em Trissílabas',
            emoji: '🔤',
            activities: [
              { id: 'a-7-8-2-3-1', gameType: 'vowelgame', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
              { id: 'a-7-8-2-3-2', gameType: 'write', wordIds: ['w-41', 'w-44', 'w-47', 'w-48', 'w-42'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 3: Montar Frases ────────────────────────────────────────────
      {
        id: 'u-7-8-3',
        title: 'Montar Frases',
        subtitle: 'Construindo frases completas',
        emoji: '🧩',
        color: '#ec4899',
        bg: '#fdf2f8',
        lessons: [
          {
            id: 'l-7-8-3-1',
            title: 'Frases Simples',
            emoji: '💬',
            activities: [
              { id: 'a-7-8-3-1-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f1', 'f2', 'f3'], rounds: 3 },
            ],
          },
          {
            id: 'l-7-8-3-2',
            title: 'Mais Frases',
            emoji: '📝',
            activities: [
              { id: 'a-7-8-3-2-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f4', 'f5', 'f6'], rounds: 3 },
              { id: 'a-7-8-3-2-2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f7', 'f8', 'f9'], rounds: 3 },
            ],
          },
          {
            id: 'l-7-8-3-3',
            title: 'Frases e Histórias',
            emoji: '📚',
            activities: [
              { id: 'a-7-8-3-3-1', gameType: 'story', wordIds: [], storyId: 's4', storyMode: 'typing' },
              { id: 'a-7-8-3-3-2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f10', 'f11', 'f12'], rounds: 3 },
            ],
          },
        ],
      },
      // ── Unidade 4: Histórias e Leitura ─────────────────────────────────────
      {
        id: 'u-7-8-4',
        title: 'Histórias',
        subtitle: 'Leitura e compreensão de histórias',
        emoji: '📚',
        color: '#1565C0',
        bg: '#E3F2FD',
        lessons: [
          {
            id: 'l-7-8-4-1',
            title: 'O Cavalo e o Coelho',
            emoji: '🐴',
            activities: [
              { id: 'a-7-8-4-1-1', gameType: 'story', wordIds: [], storyId: 's4', storyMode: 'typing' },
              { id: 'a-7-8-4-1-2', gameType: 'story', wordIds: [], storyId: 's5', storyMode: 'typing' },
            ],
          },
          {
            id: 'l-7-8-4-2',
            title: 'Histórias com Ditado',
            emoji: '✍️',
            activities: [
              { id: 'a-7-8-4-2-1', gameType: 'story', wordIds: [], storyId: 's10', storyMode: 'typing' },
              { id: 'a-7-8-4-2-2', gameType: 'story', wordIds: [], storyId: 's11', storyMode: 'typing' },
            ],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRILHA 9–10 ANOS — Leitura Fluente
  // Foco: ditado, leitura fluente, frases complexas, histórias avançadas
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'builtin-9-10',
    name: 'Leitura Fluente',
    ageGroup: '9-10',
    emoji: '🎓',
    color: '#7c3aed',
    builtin: true,
    version: 1,
    createdAt: NOW,
    updatedAt: NOW,
    units: [
      // ── Unidade 1: Ditado ───────────────────────────────────────────────────
      {
        id: 'u-9-10-1',
        title: 'Ditado',
        subtitle: 'Ouça e escreva a palavra',
        emoji: '🎤',
        color: '#388E3C',
        bg: '#E8F5E9',
        lessons: [
          {
            id: 'l-9-10-1-1',
            title: 'Ditado Fácil',
            emoji: '🔊',
            activities: [
              { id: 'a-9-10-1-1-1', gameType: 'ditado', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-15'], rounds: 5 },
              { id: 'a-9-10-1-1-2', gameType: 'write', wordIds: ['w-2', 'w-4', 'w-8', 'w-12', 'w-15'], rounds: 5 },
            ],
          },
          {
            id: 'l-9-10-1-2',
            title: 'Ditado Médio',
            emoji: '🔉',
            activities: [
              { id: 'a-9-10-1-2-1', gameType: 'ditado', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
              { id: 'a-9-10-1-2-2', gameType: 'fill', wordIds: ['w-41', 'w-42', 'w-44', 'w-47', 'w-48'], rounds: 5 },
            ],
          },
          {
            id: 'l-9-10-1-3',
            title: 'Ditado Avançado',
            emoji: '🔈',
            activities: [
              { id: 'a-9-10-1-3-1', gameType: 'ditado', wordIds: ['w-182', 'w-183', 'w-184', 'w-187', 'w-192'], rounds: 5 },
              { id: 'a-9-10-1-3-2', gameType: 'ditado', wordIds: ['w-66', 'w-67', 'w-68', 'w-69', 'w-70'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 2: Palavras Difíceis ────────────────────────────────────────
      {
        id: 'u-9-10-2',
        title: 'Palavras Difíceis',
        subtitle: 'Dígrafos, encontros vocálicos e mais',
        emoji: '🏋️',
        color: '#8b5cf6',
        bg: '#f5f3ff',
        lessons: [
          {
            id: 'l-9-10-2-1',
            title: 'Dígrafos',
            emoji: '🔠',
            activities: [
              { id: 'a-9-10-2-1-1', gameType: 'ditado', wordIds: ['w-46', 'w-57', 'w-60', 'w-65', 'w-127'], rounds: 5 },
              { id: 'a-9-10-2-1-2', gameType: 'syllable', wordIds: ['w-46', 'w-57', 'w-60', 'w-65', 'w-127'], rounds: 5 },
            ],
          },
          {
            id: 'l-9-10-2-2',
            title: 'Palavras Longas',
            emoji: '🦋',
            activities: [
              { id: 'a-9-10-2-2-1', gameType: 'ditado', wordIds: ['w-182', 'w-183', 'w-184', 'w-187', 'w-192'], rounds: 5 },
              { id: 'a-9-10-2-2-2', gameType: 'write', wordIds: ['w-185', 'w-186', 'w-193', 'w-195', 'w-196'], rounds: 5 },
            ],
          },
          {
            id: 'l-9-10-2-3',
            title: 'Desafio Total',
            emoji: '🏆',
            activities: [
              { id: 'a-9-10-2-3-1', gameType: 'ditado', wordIds: ['w-41', 'w-46', 'w-66', 'w-182', 'w-192'], rounds: 5 },
              { id: 'a-9-10-2-3-2', gameType: 'fill', wordIds: ['w-185', 'w-186', 'w-127', 'w-57', 'w-68'], rounds: 5 },
            ],
          },
        ],
      },
      // ── Unidade 3: Frases Complexas ─────────────────────────────────────────
      {
        id: 'u-9-10-3',
        title: 'Frases Complexas',
        subtitle: 'Construindo e lendo frases elaboradas',
        emoji: '📝',
        color: '#ec4899',
        bg: '#fdf2f8',
        lessons: [
          {
            id: 'l-9-10-3-1',
            title: 'Montar Todas as Frases',
            emoji: '🧩',
            activities: [
              { id: 'a-9-10-3-1-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f1', 'f2', 'f3', 'f4'], rounds: 4 },
              { id: 'a-9-10-3-1-2', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f5', 'f6', 'f7', 'f8'], rounds: 4 },
            ],
          },
          {
            id: 'l-9-10-3-2',
            title: 'Frases com Ditado',
            emoji: '🎤',
            activities: [
              { id: 'a-9-10-3-2-1', gameType: 'buildsentence', wordIds: [], sentenceIds: ['f9', 'f10', 'f11', 'f12'], rounds: 4 },
              { id: 'a-9-10-3-2-2', gameType: 'matchgame', wordIds: [], matchGameId: 'mg-firstletter-type', rounds: 6 },
            ],
          },
        ],
      },
      // ── Unidade 4: Histórias Avançadas ──────────────────────────────────────
      {
        id: 'u-9-10-4',
        title: 'Histórias Avançadas',
        subtitle: 'Leitura e ditado de histórias',
        emoji: '📖',
        color: '#1565C0',
        bg: '#E3F2FD',
        lessons: [
          {
            id: 'l-9-10-4-1',
            title: 'A Borboleta',
            emoji: '🦋',
            activities: [
              { id: 'a-9-10-4-1-1', gameType: 'story', wordIds: [], storyId: 's6', storyMode: 'typing' },
              { id: 'a-9-10-4-1-2', gameType: 'story', wordIds: [], storyId: 's12', storyMode: 'typing' },
            ],
          },
          {
            id: 'l-9-10-4-2',
            title: 'Ditado de Histórias',
            emoji: '✍️',
            activities: [
              { id: 'a-9-10-4-2-1', gameType: 'story', wordIds: [], storyId: 's6', storyMode: 'dictation' },
              { id: 'a-9-10-4-2-2', gameType: 'story', wordIds: [], storyId: 's11', storyMode: 'dictation' },
            ],
          },
          {
            id: 'l-9-10-4-3',
            title: 'Leitura Livre',
            emoji: '🌟',
            activities: [
              { id: 'a-9-10-4-3-1', gameType: 'story', wordIds: [], storyId: 's4', storyMode: 'dictation' },
              { id: 'a-9-10-4-3-2', gameType: 'story', wordIds: [], storyId: 's5', storyMode: 'dictation' },
              { id: 'a-9-10-4-3-3', gameType: 'ditado', wordIds: ['w-182', 'w-183', 'w-184', 'w-185', 'w-186', 'w-192'], rounds: 6 },
            ],
          },
        ],
      },
    ],
  },
];
