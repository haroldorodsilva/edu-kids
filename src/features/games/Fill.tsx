import { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { isTouchDevice } from '../../shared/utils/device';
import { useKeyboardInput } from '../../shared/hooks/useKeyboardInput';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import OnScreenKeyboard from '../../shared/components/ui/OnScreenKeyboard';
import type { GameComponentProps } from '../../shared/types';

const ROUNDS = 5;

function makeSlots(word: string) {
  const letters = word.split('');
  const blanks = new Set<number>();
  const count = Math.max(1, Math.floor(letters.length * 0.4));
  while (blanks.size < count) blanks.add(Math.floor(Math.random() * letters.length));
  return letters.map((l, i) => ({ letter: l, blank: blanks.has(i), filled: blanks.has(i) ? '' : l }));
}

export default function Fill({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('fill');
  const basePool = wordPool ?? words;

  const [pool] = useState(() => shuffle(basePool).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [slots, setSlots] = useState(() => makeSlots(shuffle(basePool)[0]?.word || 'bola'));
  const [currentBlank, setCurrentBlank] = useState(0);
  const [shake, setShake] = useState(false);
  const roundErrorsRef = useRef(0);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTouch = isTouchDevice();

  useEffect(() => { recordGamePlayed('fill'); }, []);

  useEffect(() => {
    if (!current) return;
    roundErrorsRef.current = 0;
    const s = makeSlots(current.word);
    setSlots(s);
    const firstBlank = s.findIndex(sl => sl.blank);
    setCurrentBlank(firstBlank >= 0 ? firstBlank : 0);
    speak(current.word);
    if (!isTouch) inputRef.current?.focus();
  }, [round, current, isTouch]);

  const blankIndices = slots.map((s, i) => s.blank ? i : -1).filter(i => i >= 0);
  const currentBlankOrder = blankIndices.indexOf(currentBlank);

  const handleLetter = useCallback((key: string) => {
    const letter = key.toLowerCase();
    if (!letter.match(/^[a-záàâãéèêíïóôõúüçñ]$/i)) return;

    const expected = slots[currentBlank]?.letter.toLowerCase();
    if (letter === expected) {
      beep('ok');
      setFeedback('ok');
      const newSlots = [...slots];
      newSlots[currentBlank] = { ...newSlots[currentBlank], filled: slots[currentBlank].letter };
      setSlots(newSlots);
      const nextBlankOrder = currentBlankOrder + 1;
      if (nextBlankOrder >= blankIndices.length) {
        setTimeout(() => {
          setFeedback(null);
          recordWordAttempt(current!.word, roundErrorsRef.current);
          advance(true);
        }, 600);
      } else {
        setCurrentBlank(blankIndices[nextBlankOrder]);
        setTimeout(() => setFeedback(null), 300);
      }
    } else {
      beep('no');
      addError();
      roundErrorsRef.current++;
      setFeedback('no');
      setShake(true);
      setTimeout(() => { setShake(false); setFeedback(null); }, 350);
    }
  }, [slots, currentBlank, blankIndices, currentBlankOrder, advance, addError, current]);

  // Teclado físico (desktop) via hook centralizado
  useKeyboardInput({ onChar: handleLetter, active: !isTouch });

  // Contagem de lacunas restantes
  const remaining = blankIndices.length - currentBlankOrder;

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="fill"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-8xl mb-2 animate-bounce-custom">{current?.emoji}</div>
        <p style={{ color: theme.textColor }} className="mb-2 text-lg">Complete as letras!</p>
        <p style={{ color: theme.color }} className="text-sm mb-4" role="status" aria-live="polite">
          {remaining > 0 ? `Faltam ${remaining} letra${remaining > 1 ? 's' : ''}` : <Check size={16} className="inline" />}
        </p>

        {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly aria-label="Campo de entrada do teclado" />}

        <div className={`flex gap-2 flex-wrap justify-center mb-6 ${shake ? 'animate-shake' : ''}`}>
          {slots.map((slot, i) => {
            const isCurrentBlank = i === currentBlank && slot.blank && !slot.filled;
            const isFilled = !slot.blank || !!slot.filled;
            return (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300 ${
                  isFilled ? 'ds-feedback-correct' : ''
                }`}
                style={
                  isFilled
                    ? undefined
                    : {
                        borderColor: isCurrentBlank ? theme.color : '#ddd',
                        backgroundColor: isCurrentBlank ? theme.bg : 'white',
                        transform: isCurrentBlank ? 'scale(1.15)' : 'scale(1)',
                        borderStyle: 'dashed',
                      }
                }
              >
                {slot.blank ? slot.filled || '' : slot.letter}
              </div>
            );
          })}
        </div>

        {isTouch ? (
          <OnScreenKeyboard onKey={handleLetter} lastFeedback={feedback} />
        ) : (
          <p style={{ color: theme.color }} className="text-sm">Digite a letra no teclado</p>
        )}
      </div>
    </GameLayout>
  );
}
