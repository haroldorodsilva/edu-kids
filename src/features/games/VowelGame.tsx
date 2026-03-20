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

const ROUNDS = 6;
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

function getVowels(word: string): string[] {
  return word
    .toUpperCase()
    .split('')
    .filter(l => VOWELS.has(l));
}

export default function VowelGame({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('vowelgame');

  const [pool] = useState(() =>
    shuffle((wordPool ?? words).filter(w => getVowels(w.word).length >= 1)).slice(0, effectiveRounds)
  );

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  // Which vowel positions have been found (by index in the word)
  const [foundIndices, setFoundIndices] = useState<Set<number>>(new Set());
  const { shake, triggerShake } = useShake();

  const letters = current ? current.word.toUpperCase().split('') : [];
  const vowelIndices = letters.reduce<number[]>((acc, l, i) => {
    if (VOWELS.has(l)) acc.push(i);
    return acc;
  }, []);

  useEffect(() => {
    if (!current) return;
    setFoundIndices(new Set());
    speak(current.word);
  }, [round, current]);

  function handleLetter(idx: number) {
    if (!current) return;
    if (foundIndices.has(idx)) return;

    const letter = letters[idx];
    if (VOWELS.has(letter)) {
      beep('ok');
      speak(letter.toLowerCase());
      const next = new Set(foundIndices);
      next.add(idx);
      setFoundIndices(next);

      // Check if all vowels found
      const allFound = vowelIndices.every(vi => next.has(vi));
      if (allFound) {
        setTimeout(() => speak(current.word), 300);
        setTimeout(() => advance(true), 900);
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
      gameId="vowelgame"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-8xl mb-2 animate-bounce-custom">{current?.emoji}</div>

        <p
          style={{ color: theme.textColor, fontFamily: 'var(--font-family)' }}
          className="mb-1 text-base font-semibold"
        >
          Toque nas <strong>vogais</strong>!
        </p>
        <p
          style={{ color: 'var(--color-text-2)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xs)' }}
          className="mb-6"
        >
          A · E · I · O · U
        </p>

        {/* Word letters as tappable buttons */}
        <div className={`flex gap-2 flex-wrap justify-center mb-8 ${shake ? 'animate-shake' : ''}`}>
          {letters.map((letter, idx) => {
            const isVowel = VOWELS.has(letter);
            const found = foundIndices.has(idx);
            return (
              <button
                key={idx}
                onClick={() => handleLetter(idx)}
                disabled={found}
                aria-label={`Letra ${letter}`}
                className="transition-all duration-300 active:scale-95"
                style={{
                  width: 56,
                  height: 64,
                  borderRadius: 'var(--radius-lg)',
                  border: `3px solid ${found ? '#4CAF50' : theme.color}`,
                  background: found ? '#E8F5E9' : 'white',
                  color: found ? '#2E7D32' : theme.textColor,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 800,
                  fontSize: 28,
                  cursor: found ? 'default' : 'pointer',
                  boxShadow: found
                    ? '0 2px 8px rgba(76,175,80,.3)'
                    : isVowel
                    ? `0 2px 8px ${theme.color}33`
                    : 'var(--shadow-sm)',
                  transform: found ? 'scale(1.08)' : undefined,
                }}
              >
                {found ? (
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                    {letter}
                    <span style={{ fontSize: 12, marginTop: 2 }}>✓</span>
                  </span>
                ) : (
                  letter
                )}
              </button>
            );
          })}
        </div>

        {/* Progress hint */}
        <p style={{ color: 'var(--color-text-2)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)' }}>
          {foundIndices.size}/{vowelIndices.length} vogai{vowelIndices.length !== 1 ? 's' : ''} encontrada{foundIndices.size !== 1 ? 's' : ''}
        </p>
      </div>
    </GameLayout>
  );
}
