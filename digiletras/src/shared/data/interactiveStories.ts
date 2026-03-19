import type { AgeGroup } from '../config/ageGroups';

// ── Activity types within a story page ──────────────────────

/** Fill missing letters in a word from the story */
export interface FillWordActivity {
  type: 'fill_word';
  word: string;
  emoji: string;
  hint: string;
}

/** Show a letter, pick images that start with it */
export interface PickLetterActivity {
  type: 'pick_letter';
  letter: string;
  options: { emoji: string; word: string; correct: boolean }[];
}

/** Connect words to images by dragging/tapping */
export interface MatchPairsActivity {
  type: 'match_pairs';
  pairs: { word: string; emoji: string }[];
}

/** Pick the correct syllable to complete a word */
export interface PickSyllableActivity {
  type: 'pick_syllable';
  word: string;
  syllables: string[];
  missingIndex: number;
  options: string[];
  emoji: string;
}

/** Identify vowels/consonants in a highlighted word */
export interface PickVowelsActivity {
  type: 'pick_vowels';
  word: string;
  emoji: string;
}

/** Reorder words to form a sentence */
export interface OrderSentenceActivity {
  type: 'order_sentence';
  sentence: string;
}

export type StoryActivity =
  | FillWordActivity
  | PickLetterActivity
  | MatchPairsActivity
  | PickSyllableActivity
  | PickVowelsActivity
  | OrderSentenceActivity;

// ── Story page ──────────────────────────────────────────────

export interface StoryPage {
  text: string;
  illustration: string;
  activity?: StoryActivity;
}

// ── Interactive Story ───────────────────────────────────────

export interface InteractiveStory {
  id: string;
  title: string;
  emoji: string;
  difficulty: 1 | 2 | 3;
  theme: string;
  description: string;
  ageGroup: AgeGroup;
  pages: StoryPage[];
}

// ── Built-in stories ────────────────────────────────────────

export const interactiveStories: InteractiveStory[] = [
  // ═══════════════════════════════════════════════════════════
  // STORY 1 — O Gato e as Vogais (pre / alpha1)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'is-1',
    title: 'O Gato e as Vogais',
    emoji: '🐱',
    difficulty: 1,
    theme: 'animal',
    description: 'O gato Miau descobre as vogais escondidas em casa!',
    ageGroup: 'pre',
    pages: [
      {
        text: 'Era uma vez um gato chamado Miau. Ele morava numa casa cheia de letras.',
        illustration: '🐱🏠✨',
      },
      {
        text: 'Um dia, Miau encontrou a letra A escondida atrás do sofá. "A de Asa!" ele disse.',
        illustration: '🐱🛋️',
        activity: {
          type: 'pick_vowels',
          word: 'ASA',
          emoji: '🪽',
        },
      },
      {
        text: 'Depois, Miau achou a letra E na janela. "E de Estrela!" pensou.',
        illustration: '🐱🪟⭐',
        activity: {
          type: 'fill_word',
          word: 'estrela',
          emoji: '⭐',
          hint: 'Brilha no céu à noite',
        },
      },
      {
        text: 'Na cozinha, a letra I estava no pote de biscoitos. "I de Ilha!"',
        illustration: '🐱🍪',
        activity: {
          type: 'pick_letter',
          letter: 'I',
          options: [
            { emoji: '🏝️', word: 'ilha', correct: true },
            { emoji: '⚽', word: 'bola', correct: false },
            { emoji: '🐸', word: 'sapo', correct: false },
            { emoji: '🧊', word: 'iglu', correct: true },
          ],
        },
      },
      {
        text: 'No jardim, a letra O descansava numa flor. "O de Ovo!" sorriu Miau.',
        illustration: '🐱🌺',
        activity: {
          type: 'pick_letter',
          letter: 'O',
          options: [
            { emoji: '🥚', word: 'ovo', correct: true },
            { emoji: '🐱', word: 'gato', correct: false },
            { emoji: '👁️', word: 'olho', correct: true },
            { emoji: '🌙', word: 'lua', correct: false },
          ],
        },
      },
      {
        text: 'Por fim, a letra U estava no telhado! "U de Uva!" A-E-I-O-U, Miau aprendeu todas!',
        illustration: '🐱🏠🎉',
        activity: {
          type: 'match_pairs',
          pairs: [
            { word: 'A', emoji: '🪽' },
            { word: 'E', emoji: '⭐' },
            { word: 'I', emoji: '🏝️' },
            { word: 'O', emoji: '🥚' },
            { word: 'U', emoji: '🍇' },
          ],
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // STORY 2 — A Floresta das Letras (alpha1)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'is-2',
    title: 'A Floresta das Letras',
    emoji: '🌳',
    difficulty: 1,
    theme: 'natureza',
    description: 'Uma aventura pela floresta encontrando letras e animais!',
    ageGroup: 'alpha1',
    pages: [
      {
        text: 'Nina entrou na Floresta das Letras. Cada árvore tinha uma letra mágica.',
        illustration: '👧🌳🔤',
      },
      {
        text: 'Na primeira árvore, a letra B brilhava. Nina viu animais ao redor.',
        illustration: '🌳✨',
        activity: {
          type: 'pick_letter',
          letter: 'B',
          options: [
            { emoji: '⚽', word: 'bola', correct: true },
            { emoji: '🐱', word: 'gato', correct: false },
            { emoji: '👢', word: 'bota', correct: true },
            { emoji: '🌙', word: 'lua', correct: false },
            { emoji: '🐄', word: 'boi', correct: true },
            { emoji: '🦆', word: 'pato', correct: false },
          ],
        },
      },
      {
        text: '"Que legal!" disse Nina. Na segunda árvore, a letra C guardava um segredo.',
        illustration: '👧🌲',
        activity: {
          type: 'pick_letter',
          letter: 'C',
          options: [
            { emoji: '🏠', word: 'casa', correct: true },
            { emoji: '🐸', word: 'sapo', correct: false },
            { emoji: '☕', word: 'café', correct: true },
            { emoji: '🐭', word: 'rato', correct: false },
            { emoji: '🐶', word: 'cão', correct: true },
            { emoji: '🌸', word: 'flor', correct: false },
          ],
        },
      },
      {
        text: 'Nina achou a árvore da letra F. Flores e frutas apareceram!',
        illustration: '👧🌸🍎',
        activity: {
          type: 'fill_word',
          word: 'flor',
          emoji: '🌸',
          hint: 'Nasce no jardim e é bem bonita',
        },
      },
      {
        text: 'No fim da floresta, Nina juntou todas as palavras que aprendeu.',
        illustration: '👧🎒📚',
        activity: {
          type: 'match_pairs',
          pairs: [
            { word: 'bola', emoji: '⚽' },
            { word: 'casa', emoji: '🏠' },
            { word: 'flor', emoji: '🌸' },
            { word: 'sapo', emoji: '🐸' },
          ],
        },
      },
      {
        text: '"A floresta me ensinou muitas letras!" disse Nina feliz. Fim!',
        illustration: '👧🌈✨',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // STORY 3 — O Sapo e as Sílabas (alpha1 / alpha2)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'is-3',
    title: 'O Sapo e as Sílabas',
    emoji: '🐸',
    difficulty: 2,
    theme: 'animal',
    description: 'O sapinho Tito aprende a dividir palavras em pedacinhos!',
    ageGroup: 'alpha1',
    pages: [
      {
        text: 'O sapinho Tito morava num lago encantado. Tudo por lá tinha sílabas mágicas.',
        illustration: '🐸🌊✨',
      },
      {
        text: '"SA-PO!" disse Tito, pulando de alegria. "Meu nome tem duas sílabas!"',
        illustration: '🐸💬',
        activity: {
          type: 'pick_syllable',
          word: 'sapo',
          syllables: ['sa', 'po'],
          missingIndex: 1,
          options: ['po', 'to', 'la', 'bo'],
          emoji: '🐸',
        },
      },
      {
        text: 'Tito viu uma bola na margem. "BO-LA!" ele contou os pedacinhos.',
        illustration: '🐸⚽',
        activity: {
          type: 'pick_syllable',
          word: 'bola',
          syllables: ['bo', 'la'],
          missingIndex: 0,
          options: ['bo', 'ca', 'pa', 'ga'],
          emoji: '⚽',
        },
      },
      {
        text: 'Uma borboleta pousou na folha. "BOR-BO-LE-TA! Quatro pedacinhos!"',
        illustration: '🦋🍃',
        activity: {
          type: 'fill_word',
          word: 'borboleta',
          emoji: '🦋',
          hint: 'Um inseto com asas coloridas',
        },
      },
      {
        text: 'À noite, Tito olhou para a lua e conectou as palavras que aprendeu.',
        illustration: '🐸🌙',
        activity: {
          type: 'match_pairs',
          pairs: [
            { word: 'sapo', emoji: '🐸' },
            { word: 'bola', emoji: '⚽' },
            { word: 'lua', emoji: '🌙' },
            { word: 'flor', emoji: '🌸' },
            { word: 'gato', emoji: '🐱' },
          ],
        },
      },
      {
        text: '"Cada palavra é feita de pedacinhos!" Tito dormiu feliz, sonhando com sílabas.',
        illustration: '🐸💤🌟',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // STORY 4 — A Festa das Palavras (alpha2)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'is-4',
    title: 'A Festa das Palavras',
    emoji: '🎪',
    difficulty: 2,
    theme: 'fantasia',
    description: 'Uma festa mágica onde as palavras ganham vida e formam frases!',
    ageGroup: 'alpha2',
    pages: [
      {
        text: 'No reino das palavras, hoje era dia de festa! Todas as letras iriam dançar juntas.',
        illustration: '🎪🎉✨',
      },
      {
        text: 'Primeiro, as vogais entraram no palco. A-E-I-O-U brilhavam como estrelas.',
        illustration: '⭐🎤',
        activity: {
          type: 'pick_vowels',
          word: 'BORBOLETA',
          emoji: '🦋',
        },
      },
      {
        text: 'A palavra MACACO subiu ao palco e mostrou suas sílabas.',
        illustration: '🐒🎤',
        activity: {
          type: 'pick_syllable',
          word: 'macaco',
          syllables: ['ma', 'ca', 'co'],
          missingIndex: 1,
          options: ['ca', 'pa', 'ta', 'da'],
          emoji: '🐒',
        },
      },
      {
        text: 'Depois, a letra G chamou seus amigos para dançar.',
        illustration: '🔤💃',
        activity: {
          type: 'pick_letter',
          letter: 'G',
          options: [
            { emoji: '🐱', word: 'gato', correct: true },
            { emoji: '⚽', word: 'bola', correct: false },
            { emoji: '🧊', word: 'gelo', correct: true },
            { emoji: '🌸', word: 'flor', correct: false },
            { emoji: '🪿', word: 'ganso', correct: true },
            { emoji: '🐸', word: 'sapo', correct: false },
          ],
        },
      },
      {
        text: 'Na hora do show, as palavras se juntaram para formar uma frase especial.',
        illustration: '🎪📝',
        activity: {
          type: 'order_sentence',
          sentence: 'O gato bebe leite',
        },
      },
      {
        text: 'No grand finale, todos ligaram as palavras aos seus significados.',
        illustration: '🎆🎊',
        activity: {
          type: 'match_pairs',
          pairs: [
            { word: 'gato', emoji: '🐱' },
            { word: 'bola', emoji: '⚽' },
            { word: 'casa', emoji: '🏠' },
            { word: 'flor', emoji: '🌸' },
            { word: 'lua', emoji: '🌙' },
          ],
        },
      },
      {
        text: '"As palavras são mágicas!" disseram todos. E a festa continuou até o sol nascer. Fim!',
        illustration: '🌅🎉🔤',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // STORY 5 — O Tesouro do Pirata (alpha2 / fluent)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'is-5',
    title: 'O Tesouro do Pirata',
    emoji: '🏴‍☠️',
    difficulty: 3,
    theme: 'fantasia',
    description: 'Desvende pistas e forme frases para encontrar o tesouro!',
    ageGroup: 'alpha2',
    pages: [
      {
        text: 'O pirata Barba-Longa encontrou um mapa misterioso. Para abrir o tesouro, precisava resolver enigmas de palavras!',
        illustration: '🏴‍☠️🗺️✨',
      },
      {
        text: 'A primeira pista dizia: "Encontre a letra P entre as imagens!"',
        illustration: '🏴‍☠️🔍',
        activity: {
          type: 'pick_letter',
          letter: 'P',
          options: [
            { emoji: '🦆', word: 'pato', correct: true },
            { emoji: '🐱', word: 'gato', correct: false },
            { emoji: '🍕', word: 'pizza', correct: true },
            { emoji: '🔥', word: 'fogo', correct: false },
            { emoji: '🪁', word: 'pipa', correct: true },
            { emoji: '🌙', word: 'lua', correct: false },
          ],
        },
      },
      {
        text: 'A segunda pista: "Complete a palavra secreta para avançar!"',
        illustration: '🏴‍☠️📜',
        activity: {
          type: 'fill_word',
          word: 'tesouro',
          emoji: '💰',
          hint: 'O que o pirata procura',
        },
      },
      {
        text: 'A terceira pista: "Junte as palavras certas para decifrar a mensagem!"',
        illustration: '🏴‍☠️🧩',
        activity: {
          type: 'match_pairs',
          pairs: [
            { word: 'navio', emoji: '🚢' },
            { word: 'mapa', emoji: '🗺️' },
            { word: 'ilha', emoji: '🏝️' },
            { word: 'ouro', emoji: '🪙' },
          ],
        },
      },
      {
        text: 'A última pista: "Ordene as palavras para encontrar o tesouro!"',
        illustration: '🏴‍☠️💎',
        activity: {
          type: 'order_sentence',
          sentence: 'O tesouro está na ilha',
        },
      },
      {
        text: 'Barba-Longa encontrou o tesouro! Dentro do baú havia... livros cheios de palavras mágicas! "O maior tesouro é aprender!" disse ele. Fim!',
        illustration: '🏴‍☠️📚💎✨',
      },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────

export function getInteractiveStories(): InteractiveStory[] {
  return interactiveStories;
}

export function getInteractiveStoriesByAge(age: AgeGroup): InteractiveStory[] {
  const order: AgeGroup[] = ['pre', 'alpha1', 'alpha2', 'fluent'];
  const idx = order.indexOf(age);
  return interactiveStories.filter(s => order.indexOf(s.ageGroup) <= idx);
}

export function getInteractiveStoryById(id: string): InteractiveStory | undefined {
  return interactiveStories.find(s => s.id === id);
}
