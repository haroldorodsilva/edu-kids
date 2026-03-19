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

const ROUNDS = 6;

export default function Quiz({ onBack, wordPool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({});
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [done, setDone] = useState(false);

  const current = pool[round];

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
    const isCorrect = word === current.word;
    setFeedback(prev => ({ ...prev, [word]: isCorrect ? 'correct' : 'wrong' }));
    beep(isCorrect ? 'ok' : 'no');

    if (!isCorrect) {
      setErrors(e => e + 1);
      // just flash red — stay on same question, wait for correct click
      return;
    }

    // Correct
    setCorrect(c => c + 1);
    setCelebrating(true);
    recordWordAttempt(current.word, Object.values(feedback).filter(v => v === 'wrong').length);
    setTimeout(() => {
      setCelebrating(false);
      if (round + 1 >= effectiveRounds) {
        if (onComplete) {
          onComplete(errors + 0); // errors already accumulated
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
    <GameLayout gameId="quiz" title="🖼️ Quiz Visual" round={round} totalRounds={effectiveRounds} done={done} correct={correct} onBack={onBack}>
      <div
        className={celebrating ? 'animate-bounce-custom' : ''}
        style={{
          fontSize: celebrating ? 120 : 96,
          lineHeight: 1,
          marginBottom: 16,
          transition: 'font-size 0.3s ease',
          transform: celebrating ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        {current.emoji}
      </div>
      <p className="mb-6 text-lg" style={{ color: 'var(--game-color)' }}>Qual é essa palavra?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt, i) => {
          const fb = feedback[opt];
          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              className="py-4 rounded-2xl font-bold text-xl border-4 transition-all duration-300 active:scale-95"
              style={{
                backgroundColor: fb === 'correct' ? 'var(--feedback-ok-light)' : fb === 'wrong' ? 'var(--feedback-error-light)' : 'white',
                borderColor: fb === 'correct' ? 'var(--feedback-ok)' : fb === 'wrong' ? 'var(--feedback-error)' : 'var(--game-color)',
                color: fb ? (fb === 'correct' ? 'var(--feedback-ok-dark)' : 'var(--feedback-error-dark)') : 'var(--game-color)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </GameLayout>
  );
}
