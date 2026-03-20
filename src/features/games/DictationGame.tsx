import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, RefreshCw } from 'lucide-react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { isTouchDevice } from '../../shared/utils/device';
import { useKeyboardInput } from '../../shared/hooks/useKeyboardInput';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import OnScreenKeyboard from '../../shared/components/ui/OnScreenKeyboard';
import type { GameComponentProps } from '../../shared/types';

const ROUNDS = 6;

export default function DictationGame({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('ditado');

  const [pool] = useState(() =>
    shuffle((wordPool ?? words).filter(w => w.word.length >= 3)).slice(0, effectiveRounds)
  );

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [typed, setTyped] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playsLeft, setPlaysLeft] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const roundErrorsRef = useRef(0);
  const isTouch = isTouchDevice();

  useEffect(() => {
    if (!current) return;
    roundErrorsRef.current = 0;
    setTyped([]);
    setRevealed(false);
    setPlaysLeft(3);
    // In dictation, we speak the word but DON'T show the emoji
    setTimeout(() => speak(current.word), 300);
    if (!isTouch) inputRef.current?.focus();
  }, [round, current, isTouch]);

  const playWord = useCallback(() => {
    if (!current || playsLeft <= 0) return;
    setPlaysLeft(p => p - 1);
    speak(current.word);
  }, [current, playsLeft]);

  const handleLetter = useCallback((key: string) => {
    if (revealed) return;
    const letter = key.toLowerCase();
    if (!letter.match(/^[a-záàâãéèêíïóôõúüçñ]$/i)) return;

    const expected = current?.word[typed.length]?.toLowerCase();
    if (!expected) return;

    if (letter === expected) {
      beep('ok');
      setFeedback('ok');
      const next = [...typed, current!.word[typed.length]];
      setTyped(next);
      if (next.length === current!.word.length) {
        setTimeout(() => {
          setFeedback(null);
          setRevealed(true);
          advance(true);
        }, 600);
      } else {
        setTimeout(() => setFeedback(null), 250);
      }
    } else {
      beep('no');
      addError();
      roundErrorsRef.current++;
      setFeedback('no');
      setShake(true);
      setTimeout(() => { setShake(false); setFeedback(null); }, 350);
    }
  }, [typed, current, advance, addError, revealed]);

  useKeyboardInput({ onChar: handleLetter, active: !isTouch });

  if (!current && !done) return null;

  const wordLen = current?.word.length ?? 0;

  return (
    <GameLayout
      gameId="ditado"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Show emoji only after correct or revealed */}
        {revealed ? (
          <div className="text-9xl mb-2 animate-bounce-custom">{current?.emoji}</div>
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: theme.bg,
              border: `4px dashed ${theme.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 48, color: theme.textColor }}>?</span>
          </div>
        )}

        <p
          style={{ color: theme.textColor, fontFamily: 'var(--font-family)', fontWeight: 700 }}
          className="mb-1 text-base"
        >
          Ouça e escreva!
        </p>

        {/* Play controls */}
        <div className="flex gap-3 items-center mb-5">
          <button
            onClick={playWord}
            disabled={playsLeft <= 0}
            aria-label="Ouvir palavra"
            className="active:scale-90 transition-transform"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              background: playsLeft > 0 ? theme.gradient : '#eee',
              border: 'none',
              color: playsLeft > 0 ? theme.textColor : 'var(--color-text-3)',
              fontFamily: 'var(--font-family)',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              cursor: playsLeft > 0 ? 'pointer' : 'not-allowed',
              boxShadow: playsLeft > 0 ? `0 3px 10px ${theme.color}33` : 'none',
            }}
          >
            <Volume2 size={18} />
            Ouvir
          </button>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-3)',
            }}
          >
            {playsLeft}× restante{playsLeft !== 1 ? 's' : ''}
          </span>
          {playsLeft <= 0 && (
            <button
              onClick={() => { setPlaysLeft(1); }}
              aria-label="Mais uma vez"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: '#f5f5f5',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-2)',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} /> +1
            </button>
          )}
        </div>

        {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly aria-label="Campo de entrada" />}

        {/* Letter boxes */}
        <div className={`flex gap-2 flex-wrap justify-center mb-6 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: wordLen }).map((_, i) => {
            const isCurrent = i === typed.length;
            const isFilled = i < typed.length;
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
                        borderColor: isCurrent ? theme.color : '#ddd',
                        backgroundColor: isCurrent ? theme.bg : 'white',
                        transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                        borderStyle: 'dashed',
                      }
                }
              >
                {isFilled ? typed[i] : '_'}
              </div>
            );
          })}
        </div>

        {/* Hint: number of letters */}
        <p
          style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-xs)' }}
          className="mb-4"
        >
          {wordLen} letra{wordLen !== 1 ? 's' : ''}
        </p>

        {isTouch ? (
          <OnScreenKeyboard onKey={handleLetter} lastFeedback={feedback} />
        ) : (
          <p style={{ color: theme.color }} className="text-sm">Digite no teclado</p>
        )}
      </div>
    </GameLayout>
  );
}
