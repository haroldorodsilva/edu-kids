import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import DoneCard from '../../shared/components/DoneCard';
import ProgressBar from '../../shared/components/ProgressBar';

interface Props {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}

const ROUNDS = 5;

export default function Syllable({ onBack, wordPool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const [pool] = useState(() =>
    shuffle((wordPool ?? words).filter(w => w.syllables.length >= 2)).slice(0, effectiveRounds)
  );
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const { shake, triggerShake } = useShake();
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[round];

  useEffect(() => {
    if (!current) return;
    setOptions(shuffle([...current.syllables]));
    setSelected([]);
    speak(current.word);
  }, [round, current]);

  function handleSyllable(syl: string) {
    const expected = current.syllables[selected.length];
    if (syl === expected) {
      beep('ok');
      speak(syl);
      const next = [...selected, syl];
      setSelected(next);
      if (next.length === current.syllables.length) {
        setTimeout(() => speak(current.word), 300);
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
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%)' }}>
      <ProgressBar current={round} total={effectiveRounds} color="#7B1FA2" />
      <div className="flex items-center gap-3 w-full mb-2">
        <button onClick={onBack} className="text-purple-800 text-2xl font-bold">←</button>
        <h1 className="text-2xl font-bold text-purple-800">🧩 Sílabas</h1>
      </div>
      <div className="text-8xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <p className="text-purple-700 mb-4 text-lg">Monte a palavra!</p>

      {/* Slots */}
      <div className={`flex gap-2 mb-8 ${shake ? 'animate-shake' : ''}`}>
        {current.syllables.map((_syl, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300"
            style={{
              borderColor: i < selected.length ? '#4CAF50' : '#9C27B0',
              backgroundColor: i < selected.length ? '#C8E6C9' : 'white',
              color: i < selected.length ? '#2E7D32' : '#9C27B0',
            }}
          >
            {i < selected.length ? selected[i] : '?'}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {options.map((syl, i) => (
          <button
            key={i}
            onClick={() => handleSyllable(syl)}
            disabled={selected.includes(syl) && current.syllables.filter(s => s === syl).length <= selected.filter(s => s === syl).length}
            className="px-6 py-4 rounded-2xl font-bold text-xl text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: '#7B1FA2' }}
          >
            {syl}
          </button>
        ))}
      </div>
    </div>
  );
}
