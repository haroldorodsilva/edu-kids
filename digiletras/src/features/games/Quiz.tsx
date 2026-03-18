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

  if (done) return <DoneCard score={{ correct, total: effectiveRounds }} onBack={onBack} />;
  if (!current) return null;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f48fb1 100%)' }}>
      <ProgressBar current={round} total={effectiveRounds} color="#E91E63" />
      <div className="flex items-center gap-3 w-full mb-2">
        <button onClick={onBack} className="text-pink-800 text-2xl font-bold">←</button>
        <h1 className="text-2xl font-bold text-pink-800">🖼️ Quiz Visual</h1>
      </div>
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
        {current.emoji}
      </div>
      <p className="text-pink-700 mb-6 text-lg">Qual é essa palavra?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {options.map((opt, i) => {
          const fb = feedback[opt];
          return (
            <button
              key={i}
              onClick={() => handleChoice(opt)}
              className="py-4 rounded-2xl font-bold text-xl border-4 transition-all duration-300 active:scale-95"
              style={{
                backgroundColor: fb === 'correct' ? '#C8E6C9' : fb === 'wrong' ? '#FFCDD2' : 'white',
                borderColor: fb === 'correct' ? '#4CAF50' : fb === 'wrong' ? '#F44336' : '#E91E63',
                color: fb ? (fb === 'correct' ? '#2E7D32' : '#C62828') : '#880E4F',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
