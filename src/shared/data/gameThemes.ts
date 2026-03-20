/**
 * Fonte única de verdade para cores e metadados dos jogos.
 * Usa nomes de ícones Lucide em vez de emojis.
 */
export interface GameTheme {
  id: string;
  icon: string;        // nome do ícone Lucide
  label: string;
  color: string;
  bg: string;
  gradient: string;
  textColor: string;
}

export const GAME_THEMES = [
  { id: 'syllable',      icon: 'Puzzle',         label: 'Sílabas',        color: '#7B1FA2', bg: '#E1BEE7', gradient: 'linear-gradient(135deg, #E1BEE7, #CE93D8)', textColor: '#7B1FA2' },
  { id: 'quiz',          icon: 'Image',          label: 'Quiz Visual',    color: '#E91E63', bg: '#FCE4EC', gradient: 'linear-gradient(135deg, #FCE4EC, #F48FB1)', textColor: '#C2185B' },
  { id: 'fill',          icon: 'PencilLine',     label: 'Completar',      color: '#FF6F00', bg: '#FFF8E1', gradient: 'linear-gradient(135deg, #FFF8E1, #FFE082)', textColor: '#BF360C' },
  { id: 'memory',        icon: 'Brain',          label: 'Memória',        color: '#00897B', bg: '#E0F2F1', gradient: 'linear-gradient(135deg, #E0F2F1, #80CBC4)', textColor: '#00695C' },
  { id: 'write',         icon: 'PenTool',        label: 'Escrever',       color: '#4527A0', bg: '#EDE7F6', gradient: 'linear-gradient(135deg, #EDE7F6, #B39DDB)', textColor: '#4527A0' },
  { id: 'firstletter',   icon: 'CaseSensitive',  label: 'Letra Inicial',  color: '#AD1457', bg: '#FCE4EC', gradient: 'linear-gradient(135deg, #FCE4EC, #F48FB1)', textColor: '#AD1457' },
  { id: 'buildsentence', icon: 'FileText',       label: 'Montar Frase',   color: '#00695C', bg: '#E0F2F1', gradient: 'linear-gradient(135deg, #E0F2F1, #80CBC4)', textColor: '#00695C' },
  { id: 'storypicker',   icon: 'BookOpen',       label: 'Histórias',      color: '#1565C0', bg: '#E3F2FD', gradient: 'linear-gradient(135deg, #E3F2FD, #90CAF9)', textColor: '#1565C0' },
  { id: 'matchgame',     icon: 'Link',           label: 'Ligar / Digitar', color: '#6A1B9A', bg: '#F3E5F5', gradient: 'linear-gradient(135deg, #F3E5F5, #CE93D8)', textColor: '#6A1B9A' },
  // Novos jogos
  { id: 'vowelgame',     icon: 'Star',           label: 'Vogais',         color: '#F57F17', bg: '#FFF9C4', gradient: 'linear-gradient(135deg, #FFF9C4, #FFF176)', textColor: '#E65100' },
  { id: 'silfamilia',    icon: 'Grid3x3',        label: 'Família Silábica', color: '#0288D1', bg: '#E1F5FE', gradient: 'linear-gradient(135deg, #E1F5FE, #81D4FA)', textColor: '#01579B' },
  { id: 'ditado',        icon: 'Mic',            label: 'Ditado',         color: '#388E3C', bg: '#E8F5E9', gradient: 'linear-gradient(135deg, #E8F5E9, #A5D6A7)', textColor: '#1B5E20' },
] as const satisfies readonly GameTheme[];

/** Union type of all valid game IDs, derived from GAME_THEMES */
export type GameId = (typeof GAME_THEMES)[number]['id'];

export function getTheme(id: GameId | (string & {})): GameTheme {
  return GAME_THEMES.find(t => t.id === id) ?? GAME_THEMES[0];
}
