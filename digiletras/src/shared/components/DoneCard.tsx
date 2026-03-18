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
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center animate-pop">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-purple-700 mb-2">{randomEncouragement()}</h2>
        {score && (
          <p className="text-lg text-gray-600 mb-6">
            Acertos: <span className="font-bold text-green-600">{score.correct}</span> / {score.total}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-200 rounded-2xl text-gray-700 font-bold text-lg hover:bg-gray-300 transition-colors"
          >
            ← Voltar
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="px-6 py-3 bg-purple-600 rounded-2xl text-white font-bold text-lg hover:bg-purple-700 transition-colors"
            >
              {nextLabel || 'Próximo →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
