import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle, pickRandom } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';
import GameLayout from '../../shared/components/GameLayout';

interface Props {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}

const ROUNDS = 8;

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVZ'.split('');

export default function FirstLetter({ onBack, wordPool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[round];

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
    const expected = current.word[0].toUpperCase();
    const isCorrect = letter === expected;
    const fb: Record<string, 'correct' | 'wrong'> = {};
    fb[letter] = isCorrect ? 'correct' : 'wrong';
    if (!isCorrect) {
      fb[expected] = 'correct';
      setErrors(e => e + 1);
    }
    setFeedback(fb);
    beep(isCorrect ? 'ok' : 'no');
    if (isCorrect) setCorrect(c => c + 1);
    recordWordAttempt(current.word, isCorrect ? 0 : 1);
    setTimeout(() => {
      if (round + 1 >= effectiveRounds) {
        if (onComplete) {
          onComplete(errors + (isCorrect ? 0 : 1));
        } else {
          setDone(true);
        }
      } else {
        setRound(r => r + 1);
      }
    }, 1200);
  }

  if (!current) return null;

  return (
    <GameLayout gameId="firstletter" title="🔤 Letra Inicial" round={round} totalRounds={effectiveRounds} done={done} correct={correct} onBack={onBack}>
      <div className="text-8xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <p className="text-3xl font-bold mb-2" style={{ color: 'var(--game-color)' }}>
        {Object.keys(feedback).length > 0 && feedback[current.word[0].toUpperCase()] === 'correct' ? (
          <>
            <span
              className="inline-block animate-bounce-custom"
              style={{ color: 'var(--feedback-ok)', fontSize: '2.2rem', transform: 'scale(1.4)', display: 'inline-block' }}
            >
              {current.word[0].toUpperCase()}
            </span>
            <span style={{ color: 'var(--game-color)' }}>{current.word.slice(1)}</span>
          </>
        ) : (
          current.word
        )}
      </p>
      <p className="mb-6 text-lg" style={{ color: 'var(--game-color)', opacity: 0.85 }}>Com qual letra começa?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((letter, i) => {
          const fb = feedback[letter];
          return (
            <button
              key={i}
              onClick={() => handleChoice(letter)}
              className="py-6 rounded-2xl font-bold text-4xl border-4 transition-all duration-300 active:scale-95"
              style={{
                backgroundColor: fb === 'correct' ? 'var(--feedback-ok-light)' : fb === 'wrong' ? 'var(--feedback-error-light)' : 'white',
                borderColor: fb === 'correct' ? 'var(--feedback-ok)' : fb === 'wrong' ? 'var(--feedback-error)' : 'var(--game-color)',
                color: fb ? (fb === 'correct' ? 'var(--feedback-ok-dark)' : 'var(--feedback-error-dark)') : 'var(--game-color)',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </GameLayout>
  );
}
