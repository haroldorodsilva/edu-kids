import type { ReactNode } from 'react';
import { getTheme } from '../../data/gameThemes';
import ScreenHeader from './ScreenHeader';
import ProgressBar from '../feedback/ProgressBar';
import DoneCard from '../feedback/DoneCard';
import LucideIcon from '../ui/LucideIcon';

export interface GameLayoutProps {
  gameId: string;
  onBack: () => void;
  currentRound: number;
  totalRounds: number;
  done: boolean;
  score?: { correct: number; total: number };
  onNext?: () => void;
  children: ReactNode;
}

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
        icon={<LucideIcon name={theme.icon} size={20} />}
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
