import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle, pickRandom } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';

const ROUNDS = 6;

export default function Quiz({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('quiz');

  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({});
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => { recordGamePlayed('quiz'); }, []);

  useEffect(() => {
    if (!current) return;
    const allWords = wordPool ?? words;
    const others = allWords.filter(w => w.id !== current.id);
    const distractors = others.length >= 3 ? pickRandom(others, 3) : others;
    const choices = shuffle([current.word, ...distractors.map(w => w.word)]);
    setOptions(choices);
    setFeedback({});
    speak(current.word);
  }, [round, current]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChoice(word: string) {
    if (feedback[word]) return; // already clicked this option
    const isCorrect = word === current!.word;
    setFeedback(prev => ({ ...prev, [word]: isCorrect ? 'correct' : 'wrong' }));
    beep(isCorrect ? 'ok' : 'no');

    if (!isCorrect) {
      addError();
      return;
    }

    // Correct
    setCelebrating(true);
    recordWordAttempt(current!.word, Object.values(feedback).filter(v => v === 'wrong').length);
    setTimeout(() => {
      setCelebrating(false);
      advance(true);
    }, 1200);
  }

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="quiz"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div
          className={celebrating ? 'animate-bounce-custom' : 'animate-bounce-custom'}
          style={{
            fontSize: celebrating ? 120 : 96,
            lineHeight: 1,
            marginBottom: 16,
            transition: 'font-size 0.3s ease',
            transform: celebrating ? 'scale(1.3)' : 'scale(1)',
          }}
        >
          {current?.emoji}
        </div>
        <p style={{ color: theme.textColor }} className="mb-6 text-lg">Qual é essa palavra?</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm" role="status" aria-live="polite">
          {options.map((opt, i) => {
            const fb = feedback[opt];
            return (
              <button
                key={i}
                onClick={() => handleChoice(opt)}
                aria-label={`Opção ${opt}`}
                className={`py-4 rounded-2xl font-bold text-xl border-4 transition-all duration-300 active:scale-95 ${
                  fb === 'correct' ? 'ds-feedback-correct' : fb === 'wrong' ? 'ds-feedback-wrong' : ''
                }`}
                style={
                  fb
                    ? { borderColor: fb === 'correct' ? 'var(--color-success)' : 'var(--color-danger)' }
                    : { backgroundColor: 'white', borderColor: theme.color, color: theme.textColor }
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
