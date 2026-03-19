export interface Sentence {
  id: string;
  text: string;
  words: string[];
  difficulty: 1 | 2 | 3;
}

export const sentences = [
  { id: 'f1', text: 'O gato bebe água.', words: ['O', 'gato', 'bebe', 'água.'], difficulty: 1 },
  { id: 'f2', text: 'A fada voa no sol.', words: ['A', 'fada', 'voa', 'no', 'sol.'], difficulty: 1 },
  { id: 'f3', text: 'O sapo pula no rio.', words: ['O', 'sapo', 'pula', 'no', 'rio.'], difficulty: 1 },
  { id: 'f4', text: 'A bola é do rato.', words: ['A', 'bola', 'é', 'do', 'rato.'], difficulty: 1 },
  { id: 'f5', text: 'O bolo é de uva.', words: ['O', 'bolo', 'é', 'de', 'uva.'], difficulty: 1 },
  { id: 'f6', text: 'A vaca come capim.', words: ['A', 'vaca', 'come', 'capim.'], difficulty: 1 },
  { id: 'f7', text: 'O pato nada no rio.', words: ['O', 'pato', 'nada', 'no', 'rio.'], difficulty: 1 },
  { id: 'f8', text: 'A lua brilha no céu.', words: ['A', 'lua', 'brilha', 'no', 'céu.'], difficulty: 2 },
  { id: 'f9', text: 'O lobo corre na mata.', words: ['O', 'lobo', 'corre', 'na', 'mata.'], difficulty: 2 },
  { id: 'f10', text: 'A foca nada no mar.', words: ['A', 'foca', 'nada', 'no', 'mar.'], difficulty: 2 },
  { id: 'f11', text: 'O trem vai rápido.', words: ['O', 'trem', 'vai', 'rápido.'], difficulty: 2 },
  { id: 'f12', text: 'A flor é bonita.', words: ['A', 'flor', 'é', 'bonita.'], difficulty: 1 },
] as const satisfies readonly Sentence[];
