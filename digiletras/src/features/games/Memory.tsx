import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';

type Props = Omit<GameComponentProps, 'rounds'>;

interface Card { id: string; wordId: string; word: string; emoji: string; }

function makeCards(pool: readonly Word[], numPairs: number): Card[] {
  const selected = shuffle(pool).slice(0, numPairs);
  const cards: Card[] = [];
  selected.forEach(w => {
    cards.push({ id: `${w.id}-a`, wordId: w.id, word: w.word, emoji: w.emoji });
    cards.push({ id: `${w.id}-b`, wordId: w.id, word: w.word, emoji: w.emoji });
  });
  return shuffle(cards);
}

function getBestScore(level: number): number | null {
  try {
    const raw = sessionStorage.getItem(`memory_best_l${level}`);
    return raw ? parseInt(raw) : null;
  } catch { return null; }
}

function saveBestScore(level: number, attempts: number) {
  try {
    const best = getBestScore(level);
    if (best === null || attempts < best) {
      sessionStorage.setItem(`memory_best_l${level}`, String(attempts));
    }
  } catch { /* noop */ }
}

export default function Memory({ onBack, wordPool, onComplete }: Props) {
  const theme = getTheme('memory');
  const [level, setLevel] = useState(1);
  const basePool = wordPool ?? words;
  const numPairs = 3 + level;
  const [cards, setCards] = useState<Card[]>(() => makeCards(basePool, numPairs));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const [levelDone, setLevelDone] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(() => getBestScore(1));

  const totalPairs = cards.length / 2;
  const matchedPairs = matched.length / 2;
  const allMatched = matched.length === cards.length;

  useEffect(() => {
    if (allMatched && cards.length > 0) {
      saveBestScore(level, attempts);
      setBestScore(getBestScore(level));
      setLevelDone(true);
      beep('yay');
      if (onComplete) {
        const errors = Math.max(0, attempts - totalPairs);
        onComplete(errors);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched, cards.length]);

  function handleFlip(card: Card) {
    if (blocking || flipped.includes(card.id) || matched.includes(card.id)) return;
    if (flipped.length === 2) return;
    speak(card.word);
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setAttempts(a => a + 1);
      const [a, b] = next.map(id => cards.find(c => c.id === id)!);
      if (a.wordId === b.wordId) {
        beep('ok');
        setMatched(m => [...m, a.id, b.id]);
        setFlipped([]);
      } else {
        beep('no');
        setBlocking(true);
        setTimeout(() => { setFlipped([]); setBlocking(false); }, 900);
      }
    }
  }

  function nextLevel() {
    const next = level + 1;
    setLevel(next);
    const np = Math.min(3 + next, Math.min(8, basePool.length));
    setBestScore(getBestScore(next));
    setCards(makeCards(basePool, np));
    setFlipped([]); setMatched([]); setAttempts(0); setLevelDone(false);
  }

  // When level is done and no external onComplete, show level-complete via GameLayout's DoneCard
  // For the "next level" flow, we use GameLayout with done=true and onNext=nextLevel
  const showDone = levelDone && !onComplete;

  return (
    <GameLayout
      gameId="memory"
      onBack={onBack}
      currentRound={matchedPairs}
      totalRounds={totalPairs}
      done={showDone}
      score={{ correct: totalPairs, total: attempts }}
      onNext={nextLevel}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="flex justify-between w-full max-w-lg mb-4">
          <div className="flex items-center gap-2">
            <p style={{ color: theme.textColor }} className="text-lg font-semibold">
              Nível {level} • Tentativas: {attempts}
            </p>
          </div>
          {bestScore !== null && (
            <p style={{ color: theme.color }} className="text-sm" aria-label={`Recorde: ${bestScore} tentativas`}>
              🏆 Recorde: {bestScore}
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 w-full max-w-lg" role="grid" aria-label="Tabuleiro de memória">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id);
            const isMatched = matched.includes(card.id);
            const revealed = isFlipped || isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card)}
                aria-label={revealed ? `${card.word} - ${card.emoji}` : 'Carta virada'}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold border-4 ${
                  isMatched ? 'ds-feedback-correct opacity-70' :
                  isFlipped ? 'bg-yellow-50 border-yellow-400' : ''
                }`}
                style={
                  !isMatched && !isFlipped
                    ? { backgroundColor: theme.color, borderColor: theme.textColor, color: 'white' }
                    : isFlipped
                    ? { color: 'var(--color-text)' }
                    : undefined
                }
                disabled={isMatched}
              >
                {revealed ? (
                  <>
                    <span className="text-2xl">{card.emoji || card.word.charAt(0).toUpperCase()}</span>
                    <span className="text-xs mt-1">{card.word}</span>
                  </>
                ) : (
                  <span className="text-3xl">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
