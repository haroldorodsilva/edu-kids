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

const ROUNDS = 8;

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVZ'.split('');

export default function FirstLetter({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('firstletter');

  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));

  const { current, round, correct, done, advance } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'>>({});

  useEffect(() => { recordGamePlayed('firstletter'); }, []);

  useEffect(() => {
    if (!current) return;
    const first = current.word[0].toUpperCase();
    const others = LETTERS.filter(l => l !== first);
    const choices = shuffle([first, ...pickRandom(others, 3)]);
    setOptions(choices);
    setFeedback({});
    speak(current.word);
  }, [round, current]);

  function handleChoice(letter: string) {
    if (Object.keys(feedback).length > 0) return;
    const expected = current!.word[0].toUpperCase();
    const isCorrect = letter === expected;
    const fb: Record<string, 'correct' | 'wrong'> = {};
    fb[letter] = isCorrect ? 'correct' : 'wrong';
    if (!isCorrect) {
      fb[expected] = 'correct';
    }
    setFeedback(fb);
    beep(isCorrect ? 'ok' : 'no');
    recordWordAttempt(current!.word, isCorrect ? 0 : 1);
    setTimeout(() => {
      advance(isCorrect);
    }, 1200);
  }

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="firstletter"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-8xl mb-2 animate-bounce-custom">{current?.emoji}</div>
        <p style={{ color: theme.textColor }} className="text-3xl font-bold mb-2">
          {Object.keys(feedback).length > 0 && feedback[current!.word[0].toUpperCase()] === 'correct' ? (
            <>
              <span
                className="inline-block animate-bounce-custom"
                style={{ color: '#4CAF50', fontSize: '2.2rem', transform: 'scale(1.4)', display: 'inline-block' }}
              >
                {current!.word[0].toUpperCase()}
              </span>
              <span style={{ color: theme.textColor }}>{current!.word.slice(1)}</span>
            </>
          ) : (
            current?.word
          )}
        </p>
        <p style={{ color: theme.color }} className="mb-6 text-lg">Com qual letra começa?</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs" role="status" aria-live="polite">
          {options.map((letter, i) => {
            const fb = feedback[letter];
            return (
              <button
                key={i}
                onClick={() => handleChoice(letter)}
                aria-label={`Letra ${letter}`}
                className={`py-6 rounded-2xl font-bold text-4xl border-4 transition-all duration-300 active:scale-95 ${
                  fb === 'correct' ? 'ds-feedback-correct' : fb === 'wrong' ? 'ds-feedback-wrong' : ''
                }`}
                style={
                  fb
                    ? undefined
                    : { backgroundColor: 'white', borderColor: theme.color, color: theme.textColor }
                }
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
