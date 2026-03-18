import { useState, useEffect } from 'react';
import { sentences } from '../../shared/data/sentences';
import type { Sentence } from '../../shared/data/sentences';
import { shuffle, pickRandom } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import DoneCard from '../../shared/components/DoneCard';
import ProgressBar from '../../shared/components/ProgressBar';

interface Props {
  onBack: () => void;
  sentencePool?: Sentence[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}

const ROUNDS = 5;

export default function BuildSentence({ onBack, sentencePool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const baseSentences = sentencePool ?? sentences;
  const [pool] = useState(() => pickRandom(baseSentences, effectiveRounds));
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const { shake, triggerShake } = useShake();
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[round];

  useEffect(() => {
    if (!current) return;
    setPlaced([]);
    setOptions(shuffle([...current.words]));
    speak(current.text);
  }, [round, current]);

  function handleWord(word: string) {
    const expected = current.words[placed.length];
    if (word === expected) {
      beep('ok');
      const next = [...placed, word];
      setPlaced(next);
      if (next.length === current.words.length) {
        setTimeout(() => speak(current.text), 200);
        setTimeout(() => {
          const newCorrect = correct + 1;
          setCorrect(newCorrect);
          if (round + 1 >= effectiveRounds) {
            if (onComplete) {
              onComplete(errors);
            } else {
              setDone(true);
            }
          } else {
            setRound(r => r + 1);
          }
        }, 800);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      triggerShake();
    }
  }

  if (done) return <DoneCard score={{ correct, total: effectiveRounds }} onBack={onBack} />;
  if (!current) return null;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #e0f2f1 0%, #4db6ac 100%)' }}>
      <ProgressBar current={round} total={effectiveRounds} color="#00695C" />
      <div className="flex items-center gap-3 w-full mb-4">
        <button onClick={onBack} className="text-teal-900 text-2xl font-bold">←</button>
        <h1 className="text-2xl font-bold text-teal-900">📝 Montar Frase</h1>
      </div>

      {/* Slots */}
      <div className={`flex flex-wrap gap-2 justify-center mb-8 min-h-16 p-4 bg-white/50 rounded-2xl w-full max-w-lg ${shake ? 'animate-shake' : ''}`}>
        {current.words.map((_, i) => (
          <div
            key={i}
            className="px-3 py-2 rounded-xl border-2 font-bold text-lg min-w-12 text-center"
            style={{
              borderStyle: 'dashed',
              borderColor: i < placed.length ? '#4CAF50' : '#B2DFDB',
              backgroundColor: i < placed.length ? '#C8E6C9' : 'white',
              color: i < placed.length ? '#2E7D32' : '#90A4AE',
            }}
          >
            {placed[i] || '___'}
          </div>
        ))}
      </div>

      {/* Word buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {options.map((word, i) => {
          const usedCount = placed.filter(p => p === word).length;
          const totalCount = current.words.filter(w => w === word).length;
          const isUsed = usedCount >= totalCount;
          return (
            <button
              key={i}
              onClick={() => !isUsed && handleWord(word)}
              disabled={isUsed}
              className="px-4 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: isUsed ? '#B2DFDB' : '#00897B', color: 'white' }}
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
