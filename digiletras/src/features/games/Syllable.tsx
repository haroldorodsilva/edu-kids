import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import GameLayout from '../../shared/components/GameLayout';

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

  if (!current) return null;

  return (
    <GameLayout gameId="syllable" title="🧩 Sílabas" round={round} totalRounds={effectiveRounds} done={done} correct={correct} onBack={onBack}>
      <div className="text-8xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <p className="mb-4 text-lg" style={{ color: 'var(--game-color)' }}>Monte a palavra!</p>

      {/* Slots */}
      <div className={`flex gap-2 mb-8 ${shake ? 'animate-shake' : ''}`}>
        {current.syllables.map((_syl, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300"
            style={{
              borderColor: i < selected.length ? 'var(--feedback-ok)' : 'var(--game-color)',
              backgroundColor: i < selected.length ? 'var(--feedback-ok-light)' : 'white',
              color: i < selected.length ? 'var(--feedback-ok-dark)' : 'var(--game-color)',
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
            style={{ backgroundColor: 'var(--game-color)' }}
          >
            {syl}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
