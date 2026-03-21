// Caça palavras prontos — cada puzzle tem título, enunciado e lista de palavras
export interface PuzzleWord {
  word: string;
  emoji: string;
}

export interface WordSearchPuzzle {
  id: string;
  title: string;
  description: string;
  emoji: string;
  words: PuzzleWord[];
}

export const WORD_SEARCH_PUZZLES: WordSearchPuzzle[] = [
  {
    id: 'animais',
    title: 'Animais',
    description: 'Encontre os animais escondidos no caça palavras!',
    emoji: '🐾',
    words: [
      { word: 'gato',    emoji: '🐱' },
      { word: 'cachorro', emoji: '🐶' },
      { word: 'pato',    emoji: '🦆' },
      { word: 'sapo',    emoji: '🐸' },
      { word: 'lobo',    emoji: '🐺' },
      { word: 'rato',    emoji: '🐭' },
    ],
  },
  {
    id: 'frutas',
    title: 'Frutas',
    description: 'Descubra as frutas no caça palavras!',
    emoji: '🍎',
    words: [
      { word: 'uva',    emoji: '🍇' },
      { word: 'maca',   emoji: '🍎' },
      { word: 'pera',   emoji: '🍐' },
      { word: 'mango',  emoji: '🥭' },
      { word: 'banana', emoji: '🍌' },
      { word: 'melao',  emoji: '🍈' },
    ],
  },
  {
    id: 'escola',
    title: 'Escola',
    description: 'Encontre as palavras da sala de aula!',
    emoji: '✏️',
    words: [
      { word: 'livro',   emoji: '📚' },
      { word: 'lapis',   emoji: '✏️' },
      { word: 'borracha', emoji: '🧹' },
      { word: 'regua',   emoji: '📏' },
      { word: 'caderno', emoji: '📓' },
      { word: 'mochila', emoji: '🎒' },
    ],
  },
  {
    id: 'cores',
    title: 'Cores',
    description: 'Ache as cores escondidas!',
    emoji: '🎨',
    words: [
      { word: 'azul',     emoji: '🔵' },
      { word: 'verde',    emoji: '🟢' },
      { word: 'rosa',     emoji: '🌸' },
      { word: 'amarelo',  emoji: '🟡' },
      { word: 'branco',   emoji: '⬜' },
      { word: 'laranja',  emoji: '🟠' },
    ],
  },
  {
    id: 'corpo',
    title: 'Corpo Humano',
    description: 'Encontre as partes do corpo!',
    emoji: '🧍',
    words: [
      { word: 'olho',    emoji: '👁️' },
      { word: 'nariz',   emoji: '👃' },
      { word: 'boca',    emoji: '👄' },
      { word: 'mao',     emoji: '✋' },
      { word: 'pe',      emoji: '🦶' },
      { word: 'orelha',  emoji: '👂' },
    ],
  },
];
