import { randomEncouragement } from '../utils/helpers';
import { beep } from '../utils/audio';
import { useEffect } from 'react';

interface DoneCardProps {
  score?: { correct: number; total: number };
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

export default function DoneCard({ score, onBack, onNext, nextLabel }: DoneCardProps) {
  useEffect(() => { beep('yay'); }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: 'var(--gradient-hero, linear-gradient(135deg, #667eea 0%, #764ba2 100%))' }}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-pop">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{randomEncouragement()}</h2>
        {score && (
          <p className="text-lg mb-6" style={{ color: 'var(--neutral-500)' }}>
            Acertos: <span className="font-bold" style={{ color: 'var(--feedback-ok-dark)' }}>{score.correct}</span> / {score.total}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-2xl font-bold text-lg transition-colors"
            style={{ backgroundColor: 'var(--neutral-200)', color: 'var(--neutral-700)' }}
          >
            ← Voltar
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="px-6 py-3 rounded-2xl text-white font-bold text-lg transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {nextLabel || 'Próximo →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
