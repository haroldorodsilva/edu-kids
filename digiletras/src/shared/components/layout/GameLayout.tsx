import type { ReactNode } from 'react';
import { getTheme } from '../../data/gameThemes';
import ScreenHeader from './ScreenHeader';
import ProgressBar from '../feedback/ProgressBar';
import DoneCard from '../feedback/DoneCard';

export interface GameLayoutProps {
  /** ID do jogo para buscar tema em gameThemes.ts */
  gameId: string;
  /** Callback do botão voltar */
  onBack: () => void;
  /** Índice da rodada atual (0-based) */
  currentRound: number;
  /** Número total de rodadas */
  totalRounds: number;
  /** Se true, exibe DoneCard em vez de children */
  done: boolean;
  /** Pontuação para o DoneCard */
  score?: { correct: number; total: number };
  /** Callback para botão "Próximo" no DoneCard */
  onNext?: () => void;
  /** Conteúdo do jogo */
  children: ReactNode;
}

/**
 * Wrapper de composição que fornece a estrutura visual padrão de todos os jogos.
 *
 * Renderiza `ScreenHeader` com tema do jogo, `ProgressBar` com cor do tema,
 * e alterna entre `children` (jogo ativo) e `DoneCard` (jogo concluído).
 */
export default function GameLayout({
  gameId,
  onBack,
  currentRound,
  totalRounds,
  done,
  score,
  onNext,
  children,
}: GameLayoutProps) {
  const theme = getTheme(gameId);

  return (
    <div className="ds-screen">
      <ScreenHeader
        emoji={theme.icon}
        title={theme.label}
        onBack={onBack}
        gradient={theme.gradient}
      />
      <ProgressBar current={currentRound} total={totalRounds} color={theme.color} />
      {done ? (
        <DoneCard score={score} onBack={onBack} onNext={onNext} />
      ) : (
        children
      )}
    </div>
  );
}
