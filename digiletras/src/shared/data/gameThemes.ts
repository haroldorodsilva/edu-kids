/**
 * Fonte única de verdade para cores e metadados dos 8 jogos.
 * Usado na PathScreen (livre), FreePlayScreen e em cada componente de jogo.
 */
export interface GameTheme {
  id: string;
  icon: string;
  label: string;
  color: string;  // cor primária (texto, bordas, botões)
  bg: string;     // cor de fundo do card e do gradiente do jogo
}

export const GAME_THEMES: GameTheme[] = [
  { id: 'syllable',     icon: '🧩', label: 'Sílabas',       color: '#7B1FA2', bg: '#E1BEE7' },
  { id: 'quiz',         icon: '🖼️', label: 'Quiz Visual',   color: '#E91E63', bg: '#FCE4EC' },
  { id: 'fill',         icon: '✏️', label: 'Completar',     color: '#FF6F00', bg: '#FFF8E1' },
  { id: 'memory',       icon: '🧠', label: 'Memória',       color: '#00897B', bg: '#E0F2F1' },
  { id: 'write',        icon: '✍️', label: 'Escrever',      color: '#4527A0', bg: '#EDE7F6' },
  { id: 'firstletter',  icon: '🔤', label: 'Letra Inicial', color: '#AD1457', bg: '#FCE4EC' },
  { id: 'buildsentence',icon: '📝', label: 'Montar Frase',  color: '#00695C', bg: '#E0F2F1' },
  { id: 'storypicker',  icon: '📖', label: 'Histórias',     color: '#1565C0', bg: '#E3F2FD' },
  { id: 'matchgame',    icon: '🔗', label: 'Ligar / Digitar', color: '#6A1B9A', bg: '#F3E5F5' },
  { id: 'coloring',     icon: '🎨', label: 'Pintar',        color: '#E65100', bg: '#FFF3E0' },
];

export function getTheme(id: string): GameTheme {
  return GAME_THEMES.find(t => t.id === id) ?? GAME_THEMES[0];
}
