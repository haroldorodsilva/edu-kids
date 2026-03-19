import { useState, useEffect, useRef, useCallback } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { isTouchDevice } from '../../shared/utils/device';
import { useKeyboardInput } from '../../shared/hooks/useKeyboardInput';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';
import GameLayout from '../../shared/components/GameLayout';
import OnScreenKeyboard from '../../shared/components/OnScreenKeyboard';

interface Props {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}

const ROUNDS = 5;

function makeSlots(word: string) {
  const letters = word.split('');
  const blanks = new Set<number>();
  const count = Math.max(1, Math.floor(letters.length * 0.4));
  while (blanks.size < count) blanks.add(Math.floor(Math.random() * letters.length));
  return letters.map((l, i) => ({ letter: l, blank: blanks.has(i), filled: blanks.has(i) ? '' : l }));
}

export default function Fill({ onBack, wordPool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const basePool = wordPool ?? words;
  const [pool] = useState(() => shuffle(basePool).slice(0, effectiveRounds));
  const [round, setRound] = useState(0);
  const [slots, setSlots] = useState(() => makeSlots(shuffle(basePool)[0]?.word || 'bola'));
  const [currentBlank, setCurrentBlank] = useState(0);
  const [shake, setShake] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const roundErrorsRef = useRef(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTouch = isTouchDevice();

  const current = pool[round];

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
          recordWordAttempt(current.word, roundErrorsRef.current);
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
        }, 600);
      } else {
        setCurrentBlank(blankIndices[nextBlankOrder]);
        setTimeout(() => setFeedback(null), 300);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      roundErrorsRef.current++;
      setFeedback('no');
      setShake(true);
      setTimeout(() => { setShake(false); setFeedback(null); }, 350);
    }
  }, [slots, currentBlank, blankIndices, currentBlankOrder, round, correct, errors, effectiveRounds, onComplete, current]);

  // Teclado físico (desktop) via hook centralizado
  useKeyboardInput({ onChar: handleLetter, active: !isTouch });

  // Contagem de lacunas restantes
  const remaining = blankIndices.length - currentBlankOrder;

  if (!current) return null;

  return (
    <GameLayout gameId="fill" title="✏️ Completar" round={round} totalRounds={effectiveRounds} done={done} correct={correct} onBack={onBack}>
      <div className="text-8xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <p className="mb-2 text-lg" style={{ color: 'var(--game-color)' }}>Complete as letras!</p>
      <p className="text-sm mb-4" style={{ color: 'var(--game-color)', opacity: 0.7 }}>
        {remaining > 0 ? `Faltam ${remaining} letra${remaining > 1 ? 's' : ''}` : '✅'}
      </p>

      {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly />}

      <div className={`flex gap-2 flex-wrap justify-center mb-6 ${shake ? 'animate-shake' : ''}`}>
        {slots.map((slot, i) => {
          const isCurrentBlank = i === currentBlank && slot.blank && !slot.filled;
          return (
            <div
              key={i}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300"
              style={{
                borderColor: !slot.blank ? 'var(--feedback-ok)' : slot.filled ? 'var(--feedback-ok)' : isCurrentBlank ? 'var(--feedback-current)' : 'var(--neutral-200)',
                backgroundColor: !slot.blank ? 'var(--feedback-ok-light)' : slot.filled ? 'var(--feedback-ok-light)' : isCurrentBlank ? 'var(--feedback-current-light)' : 'white',
                transform: isCurrentBlank ? 'scale(1.15)' : 'scale(1)',
                borderStyle: slot.blank && !slot.filled ? 'dashed' : 'solid',
              }}
            >
              {slot.blank ? slot.filled || '' : slot.letter}
            </div>
          );
        })}
      </div>

      {isTouch ? (
        <OnScreenKeyboard onKey={handleLetter} lastFeedback={feedback} />
      ) : (
        <p className="text-sm" style={{ color: 'var(--game-color)', opacity: 0.7 }}>Digite a letra no teclado</p>
      )}
    </GameLayout>
  );
}
