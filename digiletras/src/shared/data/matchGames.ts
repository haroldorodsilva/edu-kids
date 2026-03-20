import { words } from './words';
import type { Word } from './words';
import { shuffle, pickRandom } from '../utils/helpers';

export type MatchMode = 'connect' | 'type' | 'count' | 'alphabet';

/** @deprecated Use MatchMode instead */
export type MatchType = MatchMode;

export interface MatchPair {
  id: string;
  left: string;   // prompt shown on left column
  right: string;  // answer shown / expected on right column
}

export interface MatchGame {
  id: string;
  title: string;
  emoji: string;
  description: string;
  instructions: string;
  mode: MatchMode;
  pairs: MatchPair[];
  difficulty: 1 | 2 | 3;
  /** Para modo 'alphabet': a letra destaque */
  targetLetter?: string;
}

const STORAGE_KEY = 'digiletras_matchgames';

// ── Jogos estáticos (referenciados pelas trilhas builtin) ─────
const STATIC = [
  {
    id: 'mg-animals',
    title: 'Animais e Sons',
    emoji: '🐾',
    description: 'Associe cada animal ao som que ele faz',
    instructions: 'Clique no animal e depois no som correto',
    mode: 'connect' as const,
    difficulty: 1 as const,
    pairs: [
      { id: 'p1', left: '🐶 Cachorro', right: 'Au au' },
      { id: 'p2', left: '🐱 Gato',     right: 'Miau' },
      { id: 'p3', left: '🐮 Vaca',     right: 'Muuu' },
      { id: 'p4', left: '🐸 Sapo',     right: 'Croá' },
    ],
  },
  {
    id: 'mg-initials',
    title: 'Letra Inicial (Ligar)',
    emoji: '🔤',
    description: 'Ligue a palavra à sua letra inicial',
    instructions: 'Qual letra começa cada palavra?',
    mode: 'connect' as const,
    difficulty: 1 as const,
    pairs: [
      { id: 'p1', left: '🍎 Maçã',      right: 'M' },
      { id: 'p2', left: '🐘 Elefante',  right: 'E' },
      { id: 'p3', left: '🦁 Leão',      right: 'L' },
      { id: 'p4', left: '🐟 Peixe',     right: 'P' },
    ],
  },
  {
    id: 'mg-colors-type',
    title: 'Qual a Cor?',
    emoji: '🎨',
    description: 'Digite o nome da cor do objeto',
    instructions: 'Escreva a cor correta para cada item',
    mode: 'type' as const,
    difficulty: 2 as const,
    pairs: [
      { id: 'p1', left: '🍌 Banana',   right: 'amarela' },
      { id: 'p2', left: '🍎 Maçã',     right: 'vermelha' },
      { id: 'p3', left: '🌿 Folha',    right: 'verde' },
      { id: 'p4', left: '☁️ Nuvem',    right: 'branca' },
    ],
  },
  {
    id: 'mg-firstletter-type',
    title: 'Letra Inicial (Digitar)',
    emoji: '🔤',
    description: 'Digite a letra que começa cada palavra',
    instructions: 'Qual letra começa cada palavra?',
    mode: 'type' as const,
    difficulty: 1 as const,
    pairs: [
      { id: 'p1', left: '🍎', right: 'M' },
      { id: 'p2', left: '🐘', right: 'E' },
      { id: 'p3', left: '🦁', right: 'L' },
      { id: 'p4', left: '🐟', right: 'P' },
      { id: 'p5', left: '🌸', right: 'F' },
      { id: 'p6', left: '🐢', right: 'T' },
    ],
  },
  {
    id: 'mg-counting',
    title: 'Contar Objetos',
    emoji: '🔢',
    description: 'Conte os objetos e escreva o número',
    instructions: 'Quantos objetos há? Escreva o número',
    mode: 'count' as const,
    difficulty: 1 as const,
    pairs: [
      { id: 'p1', left: '🍎🍎🍎',             right: '3' },
      { id: 'p2', left: '⭐⭐',               right: '2' },
      { id: 'p3', left: '🐶🐶🐶🐶🐶',        right: '5' },
      { id: 'p4', left: '🌸🌸🌸🌸',           right: '4' },
      { id: 'p5', left: '🎈🎈🎈🎈🎈🎈',      right: '6' },
    ],
  },
] as const satisfies readonly MatchGame[];

// ── Emojis para contagem dinâmica ─────────────────────────────
const COUNT_EMOJIS = ['🍎', '⭐', '🐶', '🌸', '🎈', '🐱', '🦋', '🍕', '🎂', '🐸', '🌙', '🔥', '🍇', '🐬', '🎲'];

// ── Geradores dinâmicos (novos itens a cada chamada) ──────────

function generateAnimalSounds(): MatchGame {
  const pool: { emoji: string; name: string; sound: string }[] = [
    { emoji: '🐶', name: 'Cachorro', sound: 'Au au' },
    { emoji: '🐱', name: 'Gato', sound: 'Miau' },
    { emoji: '🐮', name: 'Vaca', sound: 'Muuu' },
    { emoji: '🐸', name: 'Sapo', sound: 'Croá' },
    { emoji: '🐔', name: 'Galinha', sound: 'Có có' },
    { emoji: '🐷', name: 'Porco', sound: 'Oinc' },
    { emoji: '🐴', name: 'Cavalo', sound: 'Ihhh' },
    { emoji: '🦁', name: 'Leão', sound: 'Roar' },
    { emoji: '🐍', name: 'Cobra', sound: 'Ssss' },
    { emoji: '🐝', name: 'Abelha', sound: 'Bzz' },
    { emoji: '🐦', name: 'Pássaro', sound: 'Piu piu' },
  ];
  const selected = pickRandom(pool, 5);
  return {
    id: 'dyn_animals',
    title: 'Animais e Sons',
    emoji: '🐾',
    description: 'Associe cada animal ao som que ele faz',
    instructions: 'Clique no animal e depois no som correto',
    mode: 'connect',
    difficulty: 1,
    pairs: selected.map((a, i) => ({ id: `p${i}`, left: `${a.emoji} ${a.name}`, right: a.sound })),
  };
}

function generateInitialsConnect(): MatchGame {
  const pool = shuffle(words.filter(w => w.difficulty <= 2));
  const used = new Set<string>();
  const selected: typeof pool = [];
  for (const w of pool) {
    const letter = w.word[0].toUpperCase();
    if (!used.has(letter) && selected.length < 5) {
      used.add(letter);
      selected.push(w);
    }
  }
  return {
    id: 'dyn_initials_connect',
    title: 'Letra Inicial (Ligar)',
    emoji: '🔤',
    description: 'Ligue a palavra à sua letra inicial',
    instructions: 'Qual letra começa cada palavra?',
    mode: 'connect',
    difficulty: 1,
    pairs: selected.map((w, i) => ({
      id: `p${i}`,
      left: `${w.emoji} ${w.word.charAt(0).toUpperCase() + w.word.slice(1)}`,
      right: w.word[0].toUpperCase(),
    })),
  };
}

function generateColorsType(): MatchGame {
  const pool: { emoji: string; name: string; color: string }[] = [
    { emoji: '🍌', name: 'Banana', color: 'amarela' },
    { emoji: '🍎', name: 'Maçã', color: 'vermelha' },
    { emoji: '🌿', name: 'Folha', color: 'verde' },
    { emoji: '☁️', name: 'Nuvem', color: 'branca' },
    { emoji: '🍊', name: 'Laranja', color: 'laranja' },
    { emoji: '🍇', name: 'Uva', color: 'roxa' },
    { emoji: '🌊', name: 'Mar', color: 'azul' },
    { emoji: '🌸', name: 'Flor', color: 'rosa' },
    { emoji: '🍫', name: 'Chocolate', color: 'marrom' },
    { emoji: '☀️', name: 'Sol', color: 'amarelo' },
    { emoji: '🍓', name: 'Morango', color: 'vermelho' },
    { emoji: '🥕', name: 'Cenoura', color: 'laranja' },
  ];
  const selected = pickRandom(pool, 5);
  return {
    id: 'dyn_colors_type',
    title: 'Qual a Cor?',
    emoji: '🎨',
    description: 'Digite o nome da cor do objeto',
    instructions: 'Escreva a cor correta para cada item',
    mode: 'type',
    difficulty: 2,
    pairs: selected.map((c, i) => ({ id: `p${i}`, left: `${c.emoji} ${c.name}`, right: c.color })),
  };
}

function generateFirstLetterType(): MatchGame {
  const selected = pickRandom(words.filter(w => w.difficulty <= 2), 6);
  return {
    id: 'dyn_firstletter_type',
    title: 'Letra Inicial (Digitar)',
    emoji: '🔤',
    description: 'Digite a letra que começa cada palavra',
    instructions: 'Qual letra começa cada palavra?',
    mode: 'type',
    difficulty: 1,
    pairs: selected.map((w, i) => ({ id: `p${i}`, left: w.emoji, right: w.word[0].toUpperCase() })),
  };
}

function generateCounting(): MatchGame {
  const emojis = pickRandom(COUNT_EMOJIS, 6);
  return {
    id: 'dyn_counting',
    title: 'Contar Objetos',
    emoji: '🔢',
    description: 'Conte os objetos e escreva o número',
    instructions: 'Quantos objetos há? Escreva o número',
    mode: 'count',
    difficulty: 1,
    pairs: emojis.map((emoji, i) => {
      const count = Math.floor(Math.random() * 8) + 2;
      return { id: `p${i}`, left: emoji.repeat(count), right: String(count) };
    }),
  };
}

function generateAlphabet(): MatchGame {
  // Escolhe uma letra aleatória que tenha pelo menos 3 palavras
  const letterMap = new Map<string, Word[]>();
  for (const w of words) {
    const letter = w.word[0].toUpperCase();
    if (!letterMap.has(letter)) letterMap.set(letter, []);
    letterMap.get(letter)!.push(w);
  }
  const validLetters = [...letterMap.entries()].filter(([, ws]) => ws.length >= 3);
  const [targetLetter, targetWords] = pickRandom(validLetters, 1)[0];

  // 2 a 4 palavras corretas
  const correctCount = Math.floor(Math.random() * 3) + 2;
  const correctWords = pickRandom(targetWords, Math.min(correctCount, targetWords.length));

  // Preenche até 6 com palavras que NÃO começam com a letra
  const wrongPool = words.filter(w => w.word[0].toUpperCase() !== targetLetter);
  const wrongWords = pickRandom(wrongPool, 6 - correctWords.length);

  const allWords = shuffle([...correctWords, ...wrongWords]);

  return {
    id: 'dyn_alphabet',
    title: `Letra ${targetLetter}`,
    emoji: '🅰️',
    description: `Quais palavras começam com ${targetLetter}?`,
    instructions: `Toque nas palavras que começam com a letra ${targetLetter}`,
    mode: 'alphabet',
    difficulty: 2,
    targetLetter,
    pairs: allWords.map((w, i) => ({
      id: `p${i}`,
      left: `${w.emoji} ${w.word}`,
      right: w.word[0].toUpperCase() === targetLetter ? 'yes' : 'no',
    })),
  };
}

// ── Gera jogos dinâmicos (novos a cada chamada) ───────────────
function generateDynamicGames(): MatchGame[] {
  return [
    generateAnimalSounds(),
    generateInitialsConnect(),
    generateColorsType(),
    generateFirstLetterType(),
    generateCounting(),
    generateAlphabet(),
  ];
}

// ── CRUD ─────────────────────────────────────────────────────
export function getMatchGames(): MatchGame[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const custom: MatchGame[] = raw ? JSON.parse(raw) : [];
    return [...generateDynamicGames(), ...STATIC, ...custom];
  } catch {
    return [...generateDynamicGames(), ...STATIC];
  }
}

export function saveMatchGame(game: MatchGame) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: MatchGame[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(g => g.id === game.id);
    if (idx >= 0) list[idx] = game; else list.push(game);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch { /* noop */ }
}

export function deleteMatchGame(id: string) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: MatchGame[] = raw ? JSON.parse(raw) : [];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter(g => g.id !== id)));
  } catch { /* noop */ }
}

export function isBuiltinGame(id: string) {
  return id.startsWith('mg-') || id.startsWith('dyn_');
}
