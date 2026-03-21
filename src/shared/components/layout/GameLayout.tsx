import type { ReactNode } from 'react';
import { getTheme } from '../../data/gameThemes';
import ScreenHeader from './ScreenHeader';
import ProgressBar from '../feedback/ProgressBar';
import DoneCard from '../feedback/DoneCard';
import LucideIcon from '../ui/LucideIcon';
import type { AgeGroup } from '../../tracks/types';

export interface GameLayoutProps {
  gameId: string;
  onBack: () => void;
  currentRound: number;
  totalRounds: number;
  done: boolean;
  score?: { correct: number; total: number };
  onNext?: () => void;
  children: ReactNode;
  /** Optional hint shown below the progress bar */
  hint?: ReactNode;
  /** Age group — sets data-age attribute for CSS font-size scaling */
  ageGroup?: AgeGroup;
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
  hint,
  ageGroup,
}: GameLayoutProps) {
  const theme = getTheme(gameId);

  return (
    <div className="ds-screen" data-age={ageGroup}>
      <ScreenHeader
        icon={<LucideIcon name={theme.icon} size={20} />}
        title={theme.label}
        onBack={onBack}
        gradient={theme.gradient}
      />
      <ProgressBar current={currentRound} total={totalRounds} color={theme.color} />
      {hint && !done && (
        <div style={{
          padding: '6px 20px',
          fontSize: 12,
          color: 'var(--color-text-3, rgba(0,0,0,0.45))',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          {hint}
        </div>
      )}
      {done ? (
        <DoneCard score={score} onBack={onBack} onNext={onNext} />
      ) : (
        children
      )}
    </div>
  );
}
