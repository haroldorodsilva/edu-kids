import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';

const ROUNDS = 5;

export default function Syllable({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('syllable');

  const [pool] = useState(() =>
    shuffle((wordPool ?? words).filter(w => w.syllables.length >= 2)).slice(0, effectiveRounds)
  );

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const { shake, triggerShake } = useShake();

  useEffect(() => {
    if (!current) return;
    setOptions(shuffle([...current.syllables]));
    setSelected([]);
    speak(current.word);
  }, [round, current]);

  function handleSyllable(syl: string) {
    if (!current) return;
    const expected = current.syllables[selected.length];
    if (syl === expected) {
      beep('ok');
      speak(syl);
      const next = [...selected, syl];
      setSelected(next);
      if (next.length === current.syllables.length) {
        setTimeout(() => speak(current.word), 300);
        setTimeout(() => {
          advance(true);
        }, 800);
      }
    } else {
      beep('no');
      addError();
      triggerShake();
    }
  }

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="syllable"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-8xl mb-2 animate-bounce-custom">{current?.emoji}</div>
        <p style={{ color: theme.textColor }} className="mb-4 text-lg">Monte a palavra!</p>

        {/* Slots */}
        <div className={`flex gap-2 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {current?.syllables.map((_syl, i) => (
            <div
              key={i}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 ${
                i < selected.length ? 'ds-feedback-correct' : ''
              }`}
              style={
                i < selected.length
                  ? undefined
                  : { borderColor: theme.color, backgroundColor: 'white', color: theme.color }
              }
            >
              {i < selected.length ? selected[i] : '?'}
            </div>
          ))}
        </div>

        {/* Syllable buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {options.map((syl, i) => (
            <button
              key={i}
              onClick={() => handleSyllable(syl)}
              disabled={
                selected.includes(syl) &&
                (current?.syllables.filter(s => s === syl).length ?? 0) <=
                  selected.filter(s => s === syl).length
              }
              aria-label={`Sílaba ${syl}`}
              className="px-6 py-4 rounded-2xl font-bold text-xl text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: theme.color }}
            >
              {syl}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
