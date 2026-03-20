import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
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

const ROUNDS = 6;

export default function Write({ onBack, wordPool, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? ROUNDS;
  const theme = getTheme('write');

  const [pool] = useState(() => shuffle(wordPool ?? words).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<Word>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [typed, setTyped] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const roundErrorsRef = useRef(0);
  const isTouch = isTouchDevice();

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
      const next = [...typed, current!.word[typed.length]];
      setTyped(next);
      if (next.length === current!.word.length) {
        setTimeout(() => {
          setFeedback(null);
          recordWordAttempt(current!.word, roundErrorsRef.current);
          advance(true);
        }, 800);
      } else {
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
  }, [typed, current, advance, addError]);

  // Teclado físico (desktop) via hook centralizado
  useKeyboardInput({ onChar: handleLetter, active: !isTouch });

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="write"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-9xl mb-2 animate-bounce-custom">{current?.emoji}</div>
        <div className="flex items-center gap-3 mb-4">
          <p style={{ color: theme.textColor }} className="text-lg">O que é isso? Digite!</p>
          <button
            onClick={() => current && speak(current.word)}
            className="px-3 py-1.5 rounded-xl font-bold text-sm active:scale-95 transition-transform"
            style={{ backgroundColor: theme.bg, color: theme.textColor }}
            aria-label="Ouvir a palavra"
          >
            <Volume2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Ouvir
          </button>
        </div>

        {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly aria-label="Campo de entrada do teclado" />}

        <div className={`flex gap-2 flex-wrap justify-center mb-6 ${shake ? 'animate-shake' : ''}`}>
          {current?.word.split('').map((_letter, i) => {
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

        {isTouch ? (
          <OnScreenKeyboard onKey={handleLetter} lastFeedback={feedback} />
        ) : (
          <p style={{ color: theme.color }} className="text-sm">Digite no teclado</p>
        )}
      </div>
    </GameLayout>
  );
}
