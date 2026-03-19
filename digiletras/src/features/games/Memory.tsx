import { useState, useEffect } from 'react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { getTheme } from '../../shared/data/gameThemes';

interface Props {
  onBack: () => void;
  wordPool?: Word[];
  onComplete?: (errors: number) => void;
}

interface Card { id: string; wordId: string; word: string; emoji: string; }

function makeCards(pool: Word[], numPairs: number): Card[] {
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

  const allMatched = matched.length === cards.length;

  useEffect(() => {
    if (allMatched && cards.length > 0) {
      saveBestScore(level, attempts);
      setBestScore(getBestScore(level));
      setLevelDone(true);
      beep('yay');
      if (onComplete) {
        const errors = Math.max(0, attempts - cards.length / 2);
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

  if (levelDone && !onComplete) {
    const isRecord = bestScore === attempts;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.color} 100%)` }}>
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center animate-pop">
          <div className="text-6xl mb-3">{isRecord ? '🏆' : '🎉'}</div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: theme.color }}>Nível {level} completo!</h2>
          <p className="text-gray-600 mb-1">Tentativas: <strong>{attempts}</strong></p>
          {bestScore !== null && (
            <p className="text-sm mb-4" style={{ color: isRecord ? 'var(--feedback-error)' : 'var(--neutral-400)' }}>
              {isRecord ? '⭐ Novo recorde!' : `Recorde: ${bestScore} tentativas`}
            </p>
          )}
          <div className="flex gap-3 justify-center mt-2">
            <button onClick={onBack} className="px-5 py-3 bg-gray-200 rounded-2xl font-bold text-gray-700">← Voltar</button>
            <button onClick={nextLevel} className="px-5 py-3 rounded-2xl font-bold text-white" style={{ backgroundColor: theme.color }}>Próximo Nível →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.color}44 100%)` }}>
      <div className="flex justify-between w-full max-w-lg mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-2xl font-bold" style={{ color: theme.color }} aria-label="Voltar ao menu">←</button>
          <h1 className="text-2xl font-bold" style={{ color: theme.color }}>🧠 Memória</h1>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm" style={{ color: theme.color }}>Nível {level} • Tent: {attempts}</p>
          {bestScore !== null && (
            <p className="text-xs" style={{ color: theme.color, opacity: 0.7 }}>🏆 Recorde: {bestScore}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card)}
              className="aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-300 border-4"
              style={{
                backgroundColor: isMatched ? 'var(--feedback-ok-light)' : isFlipped ? 'var(--feedback-celebrate-light)' : theme.color,
                borderColor: isMatched ? 'var(--feedback-ok)' : isFlipped ? 'var(--feedback-celebrate)' : `${theme.color}CC`,
                opacity: isMatched ? 0.7 : 1,
                color: isMatched || isFlipped ? 'var(--neutral-800)' : 'white',
              }}
            >
              {isFlipped || isMatched ? (
                <>
                  <span className="text-2xl">{card.emoji}</span>
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
  );
}
