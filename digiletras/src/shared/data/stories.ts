export interface Story {
  id: string;
  title: string;
  emoji: string;
  sentences: string[];
  difficulty: 1 | 2 | 3;
  theme?: string;
}

export const stories: Story[] = [
  {
    id: 's1', title: 'O gato e a bola', emoji: '🐱', difficulty: 1, theme: 'animal',
    sentences: ['O gato viu a bola.', 'A bola é do gato.', 'O gato e a bola no sol.']
  },
  {
    id: 's2', title: 'A lua e o sapo', emoji: '🌙', difficulty: 1, theme: 'natureza',
    sentences: ['O sapo viu a lua.', 'A lua é tão bela.', 'O sapo pula no rio.']
  },
  {
    id: 's3', title: 'A pipa da fada', emoji: '🪁', difficulty: 1, theme: 'fantasia',
    sentences: ['A fada tem uma pipa.', 'A pipa voa no sol.', 'A fada ri da pipa.']
  },
  {
    id: 's4', title: 'O cavalo e o coelho', emoji: '🐴', difficulty: 2, theme: 'animal',
    sentences: ['O cavalo vive no jardim.', 'O coelho come no jardim.', 'Eles são amigos.']
  },
  {
    id: 's5', title: 'A estrela', emoji: '⭐', difficulty: 2, theme: 'natureza',
    sentences: ['A estrela brilha.', 'A boneca olha a estrela.', 'A floresta é bonita.']
  },
  {
    id: 's6', title: 'A borboleta', emoji: '🦋', difficulty: 3, theme: 'fantasia',
    sentences: ['A princesa viu uma borboleta.', 'A borboleta voou ao jardim.', 'Ela deu chocolate ao coelho.']
  },
  {
    id: 's7', title: 'O bolo do rato', emoji: '🐭', difficulty: 1, theme: 'animal',
    sentences: ['O rato viu o bolo.', 'O bolo é de uva.', 'O rato come o bolo.']
  },
  {
    id: 's8', title: 'A vaca e o café', emoji: '🐄', difficulty: 1, theme: 'animal',
    sentences: ['A vaca viu o café.', 'O café é da mesa.', 'A vaca bebe o café.']
  },
  {
    id: 's9', title: 'O lobo e a nave', emoji: '🐺', difficulty: 1, theme: 'fantasia',
    sentences: ['O lobo tem uma nave.', 'A nave voa no sol.', 'O lobo vai para a lua.']
  },
  {
    id: 's10', title: 'O trem da escola', emoji: '🚂', difficulty: 2, theme: 'lugar',
    sentences: ['O trem vai para a escola.', 'A escola tem uma janela.', 'O macaco olha a janela.']
  },
  {
    id: 's11', title: 'A girafa e o sorvete', emoji: '🦒', difficulty: 2, theme: 'animal',
    sentences: ['A girafa come sorvete.', 'O sorvete é de morango.', 'A girafa é feliz.']
  },
  {
    id: 's12', title: 'O cachorro e o sapato', emoji: '🐶', difficulty: 2, theme: 'animal',
    sentences: ['O cachorro achou um sapato.', 'O sapato é da boneca.', 'O cachorro corre no jardim.']
  },
];
