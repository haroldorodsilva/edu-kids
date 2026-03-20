import type { ReactNode } from 'react';
import { getTheme } from '../data/gameThemes';
import ProgressBar from './feedback/ProgressBar';
import DoneCard from './DoneCard';

interface Props {
  /** gameThemes id — ex: 'syllable', 'quiz', 'fill' */
  gameId: string;
  /** Emoji + título exibidos no header — ex: '🧩 Sílabas' */
  title: string;
  /** Progresso da rodada */
  round: number;
  totalRounds: number;
  /** Jogo concluído? Se true, exibe DoneCard */
  done: boolean;
  /** Contagem de acertos/erros para o DoneCard */
  correct: number;
  /** Callbacks */
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  /** Conteúdo do jogo */
  children: ReactNode;
}

/**
 * Layout compartilhado para todos os mini-jogos.
 * Aplica a cor temática via CSS variables e renderiza:
 * - Gradiente de fundo do jogo
 * - ProgressBar com a cor do jogo
 * - Header com botão ← (com aria-label) + título
 * - DoneCard quando `done === true`
 */
export default function GameLayout({
  gameId,
  title,
  round,
  totalRounds,
  done,
  correct,
  onBack,
  onNext,
  nextLabel,
  children,
}: Props) {
  const theme = getTheme(gameId);

  if (done) {
    return (
      <DoneCard
        score={{ correct, total: totalRounds }}
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
      />
    );
  }

  return (
    <div
      data-game={gameId}
      className="min-h-screen p-4 flex flex-col items-center"
      style={{
        '--game-color': theme.color,
        '--game-bg': theme.bg,
        background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.color}44 100%)`,
      } as React.CSSProperties}
    >
      <ProgressBar current={round} total={totalRounds} color={theme.color} />

      <div className="flex items-center gap-3 w-full mb-2">
        <button
          onClick={onBack}
          className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-xl transition-transform active:scale-95"
          style={{ color: theme.color }}
          aria-label="Voltar ao menu"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold" style={{ color: theme.color }}>
          {title}
        </h1>
      </div>

      {children}
    </div>
  );
}
