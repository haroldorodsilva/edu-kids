import { useState, useEffect } from 'react';
import { sentences } from '../../shared/data/sentences';
import type { Sentence } from '../../shared/data/sentences';
import { shuffle, pickRandom } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';

interface Props extends Pick<GameComponentProps, 'onBack' | 'rounds' | 'onComplete'> {
  sentencePool?: Sentence[];
}

const ROUNDS = 5;

export default function BuildSentence({ onBack, sentencePool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('buildsentence');
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

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="buildsentence"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Slots */}
        <div
          className={`flex flex-wrap gap-2 justify-center mb-8 min-h-16 p-4 bg-white/50 rounded-2xl w-full max-w-lg ${shake ? 'animate-shake' : ''}`}
          role="status"
          aria-live="polite"
          aria-label="Frase em construção"
        >
          {current?.words.map((_, i) => (
            <div
              key={i}
              className={`px-3 py-2 rounded-xl border-2 font-bold text-lg min-w-12 text-center transition-all duration-300 ${
                i < placed.length ? 'ds-feedback-correct' : ''
              }`}
              style={
                i < placed.length
                  ? { borderStyle: 'solid' }
                  : { borderStyle: 'dashed', borderColor: theme.bg, backgroundColor: 'white', color: '#90A4AE' }
              }
            >
              {placed[i] || '___'}
            </div>
          ))}
        </div>

        {/* Word buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {options.map((word, i) => {
            const usedCount = placed.filter(p => p === word).length;
            const totalCount = current?.words.filter(w => w === word).length ?? 0;
            const isUsed = usedCount >= totalCount;
            return (
              <button
                key={i}
                onClick={() => !isUsed && handleWord(word)}
                disabled={isUsed}
                aria-label={`Palavra ${word}`}
                className="px-4 py-3 rounded-xl font-bold text-lg text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
                style={{ backgroundColor: isUsed ? theme.bg : theme.color }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
