/**
 * Fonte única de verdade para cores e metadados dos 8 jogos.
 * Usado na PathScreen (livre), FreePlayScreen e em cada componente de jogo.
 */
export interface GameTheme {
  id: string;
  icon: string;
  label: string;
  color: string;      // cor primária (texto, bordas, botões)
  bg: string;         // cor de fundo do card e do gradiente do jogo
  gradient: string;   // ex: 'linear-gradient(135deg, #e1bee7, #ce93d8)'
  textColor: string;  // ex: '#7B1FA2'
}

export const GAME_THEMES = [
  { id: 'syllable',      icon: '🧩', label: 'Sílabas',        color: '#7B1FA2', bg: '#E1BEE7', gradient: 'linear-gradient(135deg, #E1BEE7, #CE93D8)', textColor: '#7B1FA2' },
  { id: 'quiz',          icon: '🖼️', label: 'Quiz Visual',    color: '#E91E63', bg: '#FCE4EC', gradient: 'linear-gradient(135deg, #FCE4EC, #F48FB1)', textColor: '#C2185B' },
  { id: 'fill',          icon: '✏️', label: 'Completar',      color: '#FF6F00', bg: '#FFF8E1', gradient: 'linear-gradient(135deg, #FFF8E1, #FFE082)', textColor: '#BF360C' },
  { id: 'memory',        icon: '🧠', label: 'Memória',        color: '#00897B', bg: '#E0F2F1', gradient: 'linear-gradient(135deg, #E0F2F1, #80CBC4)', textColor: '#00695C' },
  { id: 'write',         icon: '✍️', label: 'Escrever',       color: '#4527A0', bg: '#EDE7F6', gradient: 'linear-gradient(135deg, #EDE7F6, #B39DDB)', textColor: '#4527A0' },
  { id: 'firstletter',   icon: '🔤', label: 'Letra Inicial',  color: '#AD1457', bg: '#FCE4EC', gradient: 'linear-gradient(135deg, #FCE4EC, #F48FB1)', textColor: '#AD1457' },
  { id: 'buildsentence', icon: '📝', label: 'Montar Frase',   color: '#00695C', bg: '#E0F2F1', gradient: 'linear-gradient(135deg, #E0F2F1, #80CBC4)', textColor: '#00695C' },
  { id: 'storypicker',   icon: '📖', label: 'Histórias',      color: '#1565C0', bg: '#E3F2FD', gradient: 'linear-gradient(135deg, #E3F2FD, #90CAF9)', textColor: '#1565C0' },
  { id: 'matchgame',     icon: '🔗', label: 'Ligar / Digitar', color: '#6A1B9A', bg: '#F3E5F5', gradient: 'linear-gradient(135deg, #F3E5F5, #CE93D8)', textColor: '#6A1B9A' },
  { id: 'coloring',      icon: '🎨', label: 'Pintar',         color: '#E65100', bg: '#FFF3E0', gradient: 'linear-gradient(135deg, #FFF3E0, #FFCC80)', textColor: '#BF360C' },
] as const satisfies readonly GameTheme[];

/** Union type of all valid game IDs, derived from GAME_THEMES */
export type GameId = (typeof GAME_THEMES)[number]['id'];

export function getTheme(id: GameId | (string & {})): GameTheme {
  return GAME_THEMES.find(t => t.id === id) ?? GAME_THEMES[0];
}
