import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle, pickRandom } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';
import DoneCard from '../../shared/components/DoneCard';
import ProgressBar from '../../shared/components/ProgressBar';

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

  if (done) return <DoneCard score={{ correct, total: effectiveRounds }} onBack={onBack} />;
  if (!current) return null;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #ec407a 100%)' }}>
      <ProgressBar current={round} total={effectiveRounds} color="#AD1457" />
      <div className="flex items-center gap-3 w-full mb-2">
        <button onClick={onBack} className="text-pink-900 text-2xl font-bold">←</button>
        <h1 className="text-2xl font-bold text-pink-900">🔤 Letra Inicial</h1>
      </div>
      <div className="text-8xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <p className="text-3xl font-bold text-pink-800 mb-2">
        {Object.keys(feedback).length > 0 && feedback[current.word[0].toUpperCase()] === 'correct' ? (
          <>
            <span
              className="inline-block animate-bounce-custom"
              style={{ color: '#4CAF50', fontSize: '2.2rem', transform: 'scale(1.4)', display: 'inline-block' }}
            >
              {current.word[0].toUpperCase()}
            </span>
            <span style={{ color: '#AD1457' }}>{current.word.slice(1)}</span>
          </>
        ) : (
          current.word
        )}
      </p>
      <p className="text-pink-700 mb-6 text-lg">Com qual letra começa?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((letter, i) => {
          const fb = feedback[letter];
          return (
            <button
              key={i}
              onClick={() => handleChoice(letter)}
              className="py-6 rounded-2xl font-bold text-4xl border-4 transition-all duration-300 active:scale-95"
              style={{
                backgroundColor: fb === 'correct' ? '#C8E6C9' : fb === 'wrong' ? '#FFCDD2' : 'white',
                borderColor: fb === 'correct' ? '#4CAF50' : fb === 'wrong' ? '#F44336' : '#AD1457',
                color: fb ? (fb === 'correct' ? '#2E7D32' : '#C62828') : '#880E4F',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
