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

const ROUNDS = 6;

export default function Write({ onBack, wordPool, rounds, onComplete }: Props) {
  const effectiveRounds = rounds ?? ROUNDS;
  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));
  const [round, setRound] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const roundErrorsRef = useRef(0);
  const isTouch = isTouchDevice();

  const current = pool[round];

  useEffect(() => { recordGamePlayed('write'); }, []);

  useEffect(() => {
    if (!current) return;
    roundErrorsRef.current = 0;
    setTyped([]);
    speak(current.word);
    if (!isTouch) inputRef.current?.focus();
  }, [round, current, isTouch]);

  const handleLetter = useCallback((key: string) => {
    const letter = key.toLowerCase();
    if (!letter.match(/^[a-záàâãéèêíïóôõúüçñ]$/i)) return;

    const expected = current?.word[typed.length]?.toLowerCase();
    if (!expected) return;

    if (letter === expected) {
      beep('ok');
      setFeedback('ok');
      const next = [...typed, current.word[typed.length]];
      setTyped(next);
      if (next.length === current.word.length) {
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
        }, 800);
      } else {
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
  }, [typed, current, round, correct, errors, effectiveRounds, onComplete]);

  // Teclado físico (desktop) via hook centralizado
  useKeyboardInput({ onChar: handleLetter, active: !isTouch });

  if (!current) return null;

  return (
    <GameLayout gameId="write" title="✍️ Escrever" round={round} totalRounds={effectiveRounds} done={done} correct={correct} onBack={onBack}>
      <div className="text-9xl mb-2 animate-bounce-custom">{current.emoji}</div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-lg" style={{ color: 'var(--game-color)' }}>O que é isso? Digite!</p>
        <button
          onClick={() => speak(current.word)}
          className="px-3 py-1.5 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--game-bg)', color: 'var(--game-color)' }}
          aria-label="Ouvir a palavra"
        >
          🔊 Ouvir
        </button>
      </div>

      {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly />}

      <div className={`flex gap-2 flex-wrap justify-center mb-6 ${shake ? 'animate-shake' : ''}`}>
        {current.word.split('').map((_letter, i) => {
          const isCurrent = i === typed.length;
          const isFilled = i < typed.length;
          return (
            <div
              key={i}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-4 transition-all duration-300"
              style={{
                borderColor: isFilled ? 'var(--feedback-ok)' : isCurrent ? 'var(--feedback-current)' : 'var(--neutral-200)',
                backgroundColor: isFilled ? 'var(--feedback-ok-light)' : isCurrent ? 'var(--feedback-current-light)' : 'white',
                transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                borderStyle: !isFilled ? 'dashed' : 'solid',
              }}
            >
              {isFilled ? typed[i] : '_'}
            </div>
          );
        })}
      </div>

      {isTouch ? (
        <OnScreenKeyboard onKey={handleLetter} lastFeedback={feedback} />
      ) : (
        <p className="text-sm" style={{ color: 'var(--game-color)', opacity: 0.7 }}>Digite no teclado</p>
      )}
    </GameLayout>
  );
}
