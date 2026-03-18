export interface Sentence {
  id: string;
  text: string;
  words: string[];
}

export const sentences: Sentence[] = [
  { id: 'f1', text: 'O gato bebe água.', words: ['O', 'gato', 'bebe', 'água.'] },
  { id: 'f2', text: 'A fada voa no sol.', words: ['A', 'fada', 'voa', 'no', 'sol.'] },
  { id: 'f3', text: 'O sapo pula no rio.', words: ['O', 'sapo', 'pula', 'no', 'rio.'] },
  { id: 'f4', text: 'A bola é do rato.', words: ['A', 'bola', 'é', 'do', 'rato.'] },
  { id: 'f5', text: 'O bolo é de uva.', words: ['O', 'bolo', 'é', 'de', 'uva.'] },
  { id: 'f6', text: 'A vaca come capim.', words: ['A', 'vaca', 'come', 'capim.'] },
  { id: 'f7', text: 'O pato nada no rio.', words: ['O', 'pato', 'nada', 'no', 'rio.'] },
  { id: 'f8', text: 'A lua brilha no céu.', words: ['A', 'lua', 'brilha', 'no', 'céu.'] },
  { id: 'f9', text: 'O lobo corre na mata.', words: ['O', 'lobo', 'corre', 'na', 'mata.'] },
  { id: 'f10', text: 'A foca nada no mar.', words: ['A', 'foca', 'nada', 'no', 'mar.'] },
  { id: 'f11', text: 'O trem vai rápido.', words: ['O', 'trem', 'vai', 'rápido.'] },
  { id: 'f12', text: 'A flor é bonita.', words: ['A', 'flor', 'é', 'bonita.'] },
];
