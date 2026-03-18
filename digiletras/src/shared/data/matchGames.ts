export type MatchType = 'connect' | 'type' | 'count';

export interface MatchPair {
  id: string;
  left: string;   // prompt shown on left column
  right: string;  // answer shown / expected on right column
}

export interface MatchGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  instructions: string;
  type: MatchType;
  pairs: MatchPair[];
}

const STORAGE_KEY = 'digiletras_matchgames';

// ── Built-in sample games ─────────────────────────────────────
const BUILTIN: MatchGame[] = [
  {
    id: 'builtin_animals',
    name: 'Animais e Sons',
    emoji: '🐾',
    description: 'Associe cada animal ao som que ele faz',
    instructions: 'Clique no animal e depois no som correto',
    type: 'connect',
    pairs: [
      { id: 'p1', left: '🐶 Cachorro', right: 'Au au' },
      { id: 'p2', left: '🐱 Gato',     right: 'Miau' },
      { id: 'p3', left: '🐮 Vaca',     right: 'Muuu' },
      { id: 'p4', left: '🐸 Sapo',     right: 'Croá' },
    ],
  },
  {
    id: 'builtin_initials',
    name: 'Letra Inicial',
    emoji: '🔤',
    description: 'Ligue a palavra à sua letra inicial',
    instructions: 'Qual letra começa cada palavra?',
    type: 'connect',
    pairs: [
      { id: 'p1', left: '🍎 Maçã',      right: 'M' },
      { id: 'p2', left: '🐘 Elefante',  right: 'E' },
      { id: 'p3', left: '🦁 Leão',      right: 'L' },
      { id: 'p4', left: '🐟 Peixe',     right: 'P' },
    ],
  },
  {
    id: 'builtin_colors_type',
    name: 'Qual a Cor?',
    emoji: '🎨',
    description: 'Digite o nome da cor do objeto',
    instructions: 'Escreva a cor correta para cada item',
    type: 'type',
    pairs: [
      { id: 'p1', left: '🍌 Banana',   right: 'amarela' },
      { id: 'p2', left: '🍎 Maçã',     right: 'vermelha' },
      { id: 'p3', left: '🌿 Folha',    right: 'verde' },
      { id: 'p4', left: '☁️ Nuvem',    right: 'branca' },
    ],
  },
  {
    id: 'builtin_firstletter_type',
    name: 'Letra Inicial',
    emoji: '🔤',
    description: 'Digite a letra que começa cada palavra',
    instructions: 'Qual letra começa cada palavra?',
    type: 'type',
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
    id: 'builtin_counting',
    name: 'Contar Objetos',
    emoji: '🔢',
    description: 'Conte os objetos e escreva o número',
    instructions: 'Quantos objetos há? Escreva o número',
    type: 'count',
    pairs: [
      { id: 'p1', left: '🍎🍎🍎',             right: '3' },
      { id: 'p2', left: '⭐⭐',               right: '2' },
      { id: 'p3', left: '🐶🐶🐶🐶🐶',        right: '5' },
      { id: 'p4', left: '🌸🌸🌸🌸',           right: '4' },
      { id: 'p5', left: '🎈🎈🎈🎈🎈🎈',      right: '6' },
    ],
  },
];

// ── CRUD ─────────────────────────────────────────────────────
export function getMatchGames(): MatchGame[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const custom: MatchGame[] = raw ? JSON.parse(raw) : [];
    return [...BUILTIN, ...custom];
  } catch {
    return BUILTIN;
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
  return id.startsWith('builtin_');
}
