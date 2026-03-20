import { randomEncouragement } from '../../utils/helpers';
import { beep } from '../../utils/audio';
import { useEffect } from 'react';
import { Trophy, Star, ArrowLeft, ChevronRight } from 'lucide-react';

interface DoneCardProps {
  score?: { correct: number; total: number };
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

export default function DoneCard({ score, onBack, onNext, nextLabel }: DoneCardProps) {
  useEffect(() => { beep('yay'); }, []);

  const stars = score
    ? score.correct === score.total ? 3 : score.correct >= score.total / 2 ? 2 : 1
    : 3;

  return (
    <div
      className="ds-screen"
      style={{
        background: 'var(--gradient-hero)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
      }}
    >
      <div
        className="ds-card-elevated animate-pop"
        style={{
          padding: 'var(--spacing-xl)',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-md)' }}><Trophy size={48} color="var(--color-primary-dark)" /></div>

        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-primary-dark)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          {randomEncouragement()}
        </h2>

        {score && (
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-2)',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            Acertos:{' '}
            <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
              {score.correct}
            </span>{' '}
            / {score.total}
          </p>
        )}

        <div
          style={{
            fontSize: 'var(--font-size-2xl)',
            marginBottom: 'var(--spacing-lg)',
          }}
          aria-label={`${stars} estrelas`}
        >
          {Array.from({ length: stars }, (_, i) => <Star key={i} size={24} fill="#FFD700" color="#FFD700" />)}
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
          <button
            className="ds-btn ds-btn-ghost"
            onClick={onBack}
            aria-label="Voltar"
          >
            <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Voltar
          </button>
          {onNext && (
            <button
              className="ds-btn ds-btn-primary"
              onClick={onNext}
            >
              {nextLabel || <>Próximo <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
