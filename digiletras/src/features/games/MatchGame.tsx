import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { getMatchGames, type MatchGame, type MatchPair } from '../../shared/data/matchGames';
import { beep } from '../../shared/utils/audio';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import type { GameComponentProps } from '../../shared/types';

interface Props extends Pick<GameComponentProps, 'onBack' | 'onComplete'> {
  /** Optional: jump directly to a specific game by ID (skip picker) */
  gameId?: string;
}

// Split "🐶 Cachorro" → { icon: "🐶", label: "Cachorro" }
// Leaves "Au au" or "M" as { icon: "", label: "Au au" }
// Normalize for comparison: lowercase + remove diacritics
function normalizeAnswer(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function splitContent(text: string): { icon: string; label: string } {
  const spaceIdx = text.indexOf(' ');
  if (spaceIdx > 0) {
    const first = text.slice(0, spaceIdx);
    const rest  = text.slice(spaceIdx + 1).trim();
    if (/\p{Emoji}/u.test(first) && rest) return { icon: first, label: rest };
  }
  // Pure emoji string (no Latin letters) — show as big icon, no label
  if (/\p{Emoji}/u.test(text) && !/[A-Za-zÀ-ÖØ-öø-ÿ]/u.test(text)) {
    return { icon: text, label: '' };
  }
  return { icon: '', label: text };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const theme = getTheme('matchgame');

// ─── Game picker ───────────────────────────────────────────────
function GamePicker({ games, onSelect, onBack }: {
  games: MatchGame[];
  onSelect: (g: MatchGame) => void;
  onBack: () => void;
}) {
  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)' }}>
      <ScreenHeader
        emoji={theme.icon}
        title={theme.label}
        onBack={onBack}
        gradient={theme.gradient}
        subtitle="Escolha um jogo"
      />

      <div className="flex flex-col gap-3 p-4">
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onSelect(g)}
            className="ds-card animate-pop-up"
            aria-label={`Jogo ${g.title}: ${g.description}`}
            style={{
              animationDelay: `${i * 40}ms`,
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left',
              padding: 'var(--spacing-md)',
            }}
          >
            <span className="text-4xl leading-none">{g.emoji}</span>
            <div className="flex-1">
              <div className="font-extrabold text-sm" style={{ color: 'var(--color-text)' }}>{g.title}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-2)' }}>{g.description}</div>
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold mt-1.5"
                style={{
                  background: g.mode === 'connect' ? `${theme.color}22` : '#00B89422',
                  color: g.mode === 'connect' ? theme.color : '#00B894',
                }}
              >
                {g.mode === 'connect' ? '🔗 Ligar' : '⌨️ Digitar'}
              </div>
            </div>
            <span className="text-xl" style={{ color: 'var(--color-text-3)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared card style ────────────────────────────────────────
const cardBase: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 96,
  borderRadius: 'var(--radius-lg)',
  outline: 'none',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 6,
  transition: 'var(--transition-fast)',
  padding: '10px 8px',
  boxSizing: 'border-box',
};

// ─── Connect mode ──────────────────────────────────────────────
function ConnectMode({ game, onBack, onComplete }: { game: MatchGame; onBack: () => void; onComplete?: (errors: number) => void }) {
  const shuffledRight = useMemo(() => shuffle(game.pairs), [game.id]);

  const [selectedLeft, setSelectedLeft]   = useState<string | null>(null);
  const [mousePos,     setMousePos]        = useState({ x: 0, y: 0 });
  const [matched,      setMatched]         = useState<Map<string, string>>(new Map());
  const [wrongAnim,    setWrongAnim]       = useState<{ key: number; leftId: string; rightId: string } | null>(null);
  const [errors,       setErrors]          = useState(0);
  const [done,         setDone]            = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs     = useRef(new Map<string, HTMLElement>());
  const rightRefs    = useRef(new Map<string, HTMLElement>());

  function getRightEdge(id: string) {
    const el = leftRefs.current.get(id);
    const c  = containerRef.current;
    if (!el || !c) return null;
    const er = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { x: er.right - cr.left, y: er.top - cr.top + er.height / 2 };
  }
  function getLeftEdge(id: string) {
    const el = rightRefs.current.get(id);
    const c  = containerRef.current;
    if (!el || !c) return null;
    const er = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { x: er.left - cr.left, y: er.top - cr.top + er.height / 2 };
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const cr = containerRef.current?.getBoundingClientRect();
    if (!cr) return;
    setMousePos({ x: e.clientX - cr.left, y: e.clientY - cr.top });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const cr = containerRef.current?.getBoundingClientRect();
    if (!cr) return;
    const t = e.touches[0];
    setMousePos({ x: t.clientX - cr.left, y: t.clientY - cr.top });
  }, []);

  function handleLeftClick(pairId: string) {
    if (matched.has(pairId)) return;
    setSelectedLeft(prev => prev === pairId ? null : pairId);
  }

  function handleRightClick(pair: MatchPair) {
    if (!selectedLeft) return;
    if (matched.get(selectedLeft) === pair.id || [...matched.values()].includes(pair.id)) return;

    if (selectedLeft === pair.id) {
      const next = new Map(matched);
      next.set(selectedLeft, pair.id);
      setMatched(next);
      setSelectedLeft(null);
      beep('ok');
      if (next.size === game.pairs.length) {
        setTimeout(() => setDone(true), 400);
      }
    } else {
      setErrors(e => e + 1);
      setWrongAnim({ key: Date.now(), leftId: selectedLeft, rightId: pair.id });
      beep('no');
      setTimeout(() => setWrongAnim(null), 600);
    }
  }

  const [svgH, setSvgH] = useState(400);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      setSvgH(entries[0].contentRect.height);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const pairs = game.pairs;

  return (
    <GameLayout
      gameId="matchgame"
      onBack={onBack}
      currentRound={matched.size}
      totalRounds={pairs.length}
      done={done}
      score={{ correct: pairs.length - errors, total: pairs.length }}
      onNext={onComplete ? () => onComplete(errors) : undefined}
    >
      {/* Game area — three zones: left | middle (lines) | right */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          flex: 1, position: 'relative',
          display: 'flex', alignItems: 'flex-start',
          padding: 'var(--spacing-lg) var(--spacing-sm)', gap: 0,
          userSelect: 'none', touchAction: 'none',
          overflowY: 'auto',
        }}
      >
        {/* SVG overlay */}
        <svg
          width="100%" height={svgH}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          aria-hidden="true"
        >
          {Array.from(matched.entries()).map(([leftId, rightId]) => {
            const s = getRightEdge(leftId), e = getLeftEdge(rightId);
            if (!s || !e) return null;
            return (
              <line key={`m-${leftId}`}
                x1={s.x} y1={s.y} x2={e.x} y2={e.y}
                stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round"
              />
            );
          })}
          {wrongAnim && (() => {
            const s = getRightEdge(wrongAnim.leftId), e = getLeftEdge(wrongAnim.rightId);
            if (!s || !e) return null;
            return (
              <line key={wrongAnim.key}
                className="anim-wrong-line"
                x1={s.x} y1={s.y} x2={e.x} y2={e.y}
                stroke="var(--color-danger)" strokeWidth="3.5" strokeLinecap="round"
              />
            );
          })()}
          {selectedLeft && (() => {
            const s = getRightEdge(selectedLeft);
            if (!s) return null;
            return (
              <line
                x1={s.x} y1={s.y} x2={mousePos.x} y2={mousePos.y}
                stroke="var(--color-primary-light)" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray="6 4"
              />
            );
          })()}
        </svg>

        {/* Left column */}
        <div className="flex flex-col gap-3" style={{ width: '40%' }}>
          {pairs.map(pair => {
            const { icon, label } = splitContent(pair.left);
            const isMatched  = matched.has(pair.id);
            const isSelected = selectedLeft === pair.id;
            return (
              <button
                key={pair.id}
                ref={el => { if (el) leftRefs.current.set(pair.id, el); }}
                onClick={() => handleLeftClick(pair.id)}
                aria-label={`${label || icon} ${isMatched ? '(ligado)' : ''}`}
                style={{
                  ...cardBase,
                  border: `2.5px solid ${isMatched ? 'var(--color-success)' : isSelected ? theme.color : 'var(--color-border)'}`,
                  background: isMatched ? '#00B89415' : isSelected ? `${theme.color}18` : 'var(--color-surface)',
                  cursor: isMatched ? 'default' : 'pointer',
                  boxShadow: isSelected ? `0 0 0 4px ${theme.color}2E, var(--shadow-md)` : 'var(--shadow-card)',
                  opacity: isMatched ? 0.55 : 1,
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <span className="text-3xl leading-none h-9 flex items-center justify-center">
                  {icon || <span className="text-xl font-black" style={{ color: theme.color }}>{label.slice(0, 3)}</span>}
                </span>
                <span className="text-xs font-bold text-center leading-tight max-w-full"
                  style={{ color: isMatched ? 'var(--color-success)' : isSelected ? theme.color : 'var(--color-text)' }}>
                  {icon ? label : ''}
                </span>
                {isMatched && <span className="text-xs absolute top-1.5 right-2">✅</span>}
              </button>
            );
          })}
        </div>

        {/* Middle zone */}
        <div className="flex items-start justify-center pointer-events-none pt-8" style={{ width: '20%' }}>
          <span className="text-lg" style={{ opacity: selectedLeft ? 0.7 : 0.15 }}>🔗</span>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3" style={{ width: '40%' }}>
          {shuffledRight.map(pair => {
            const { icon, label } = splitContent(pair.right);
            const isMatched   = [...matched.values()].includes(pair.id);
            const isHighlight = !!selectedLeft && !isMatched;
            return (
              <button
                key={pair.id}
                ref={el => { if (el) rightRefs.current.set(pair.id, el); }}
                onClick={() => handleRightClick(pair)}
                aria-label={`${label || icon} ${isMatched ? '(ligado)' : ''}`}
                style={{
                  ...cardBase,
                  border: `2.5px solid ${isMatched ? 'var(--color-success)' : isHighlight ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
                  background: isMatched ? '#00B89415' : isHighlight ? '#A29BFE12' : 'var(--color-surface)',
                  cursor: isMatched ? 'default' : isHighlight ? 'pointer' : 'default',
                  boxShadow: 'var(--shadow-card)',
                  opacity: isMatched ? 0.55 : 1,
                  transform: isHighlight ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <span className="text-3xl leading-none h-9 flex items-center justify-center">
                  {icon || <span className="text-xl font-black" style={{ color: theme.color }}>{label.slice(0, 3)}</span>}
                </span>
                <span className="text-xs font-bold text-center leading-tight max-w-full"
                  style={{ color: isMatched ? 'var(--color-success)' : 'var(--color-text)' }}>
                  {icon ? label : ''}
                </span>
                {isMatched && <span className="text-xs absolute top-1.5 right-2">✅</span>}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}

// ─── Type mode ────────────────────────────────────────────────
function TypeMode({ game, onBack, onComplete }: { game: MatchGame; onBack: () => void; onComplete?: (errors: number) => void }) {
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [states,  setStates]  = useState<Map<string, 'idle' | 'correct' | 'wrong'>>(new Map());
  const [errors,  setErrors]  = useState(0);
  const [done,    setDone]    = useState(false);

  function handleCheck(pair: MatchPair) {
    const ans = normalizeAnswer(answers.get(pair.id) ?? '');
    if (!ans) return;
    const ok  = normalizeAnswer(pair.right) === ans;
    setStates(prev => new Map(prev).set(pair.id, ok ? 'correct' : 'wrong'));
    if (ok) {
      beep('ok');
      const allCorrect = game.pairs.every(p =>
        p.id === pair.id ? true : states.get(p.id) === 'correct'
      );
      if (allCorrect) setTimeout(() => setDone(true), 500);
    } else {
      setErrors(e => e + 1);
      beep('no');
      setTimeout(() => {
        setStates(prev => new Map(prev).set(pair.id, 'idle'));
        setAnswers(prev => new Map(prev).set(pair.id, ''));
      }, 700);
    }
  }

  function handleInputChange(pair: MatchPair, value: string) {
    setAnswers(prev => new Map(prev).set(pair.id, value));
    const expectedLen = pair.right.trim().length;
    if (value.trim().length >= expectedLen) {
      setTimeout(() => handleCheck({ ...pair }), 150);
    }
  }

  const correctCount = [...states.values()].filter(s => s === 'correct').length;

  return (
    <GameLayout
      gameId="matchgame"
      onBack={onBack}
      currentRound={correctCount}
      totalRounds={game.pairs.length}
      done={done}
      score={{ correct: game.pairs.length - errors, total: game.pairs.length }}
      onNext={onComplete ? () => onComplete(errors) : undefined}
    >
      <div className="flex flex-col gap-3 p-4">
        {game.pairs.map(pair => {
          const st  = states.get(pair.id) ?? 'idle';
          const val = answers.get(pair.id) ?? '';
          const { icon, label } = splitContent(pair.left);
          return (
            <div
              key={pair.id}
              className={st === 'wrong' ? 'animate-shake' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 0 }}
              role="status"
              aria-live="polite"
            >
              {/* Left card — prompt */}
              <div style={{
                ...cardBase,
                width: '40%',
                border: `2px solid ${st === 'correct' ? 'var(--color-success)' : 'var(--color-border)'}`,
                background: st === 'correct' ? '#00B89415' : 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
                opacity: st === 'correct' ? 0.6 : 1,
                cursor: 'default',
              }}>
                <span className="text-3xl leading-none h-9 flex items-center justify-center">
                  {icon || <span className="text-xl font-black" style={{ color: theme.color }}>{label.slice(0, 3)}</span>}
                </span>
                <span className="text-xs font-bold text-center leading-tight max-w-full" style={{ color: 'var(--color-text)' }}>
                  {icon ? label : ''}
                </span>
              </div>

              {/* Middle arrow */}
              <div className="flex items-center justify-center pointer-events-none" style={{ width: '20%' }}>
                <span className="text-base opacity-30">→</span>
              </div>

              {/* Right card — input or answer */}
              <div className={st === 'correct' ? 'ds-feedback-correct' : st === 'wrong' ? 'ds-feedback-wrong' : ''} style={{
                ...cardBase,
                width: '40%',
                border: `2px solid ${st === 'correct' ? 'var(--color-success)' : st === 'wrong' ? 'var(--color-danger)' : 'var(--color-border)'}`,
                background: st === 'correct' ? '#00B89415' : st === 'wrong' ? '#FFEBEE' : 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
                gap: 6,
                padding: '8px 6px',
                transition: 'var(--transition-fast)',
              }}>
                {st === 'correct' ? (
                  <>
                    <span className="text-2xl">✅</span>
                    <span className="text-sm font-extrabold text-center" style={{ color: 'var(--color-success)' }}>
                      {pair.right}
                    </span>
                  </>
                ) : (
                  <input
                    value={val}
                    onChange={e => handleInputChange(pair, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && val.trim() && handleCheck(pair)}
                    placeholder="?"
                    autoComplete="off"
                    aria-label={`Resposta para ${label || icon}`}
                    maxLength={pair.right.trim().length}
                    className="w-full text-center font-extrabold text-lg lowercase"
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${st === 'wrong' ? 'var(--color-danger)' : 'var(--color-border)'}`,
                      color: 'var(--color-text)',
                      outline: 'none',
                      background: 'transparent',
                      boxSizing: 'border-box',
                      transition: 'var(--transition-fast)',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GameLayout>
  );
}

// ─── Alphabet mode ────────────────────────────────────────────
function AlphabetMode({ game, onBack, onComplete }: { game: MatchGame; onBack: () => void; onComplete?: (errors: number) => void }) {
  const letter = game.targetLetter || '?';
  const [, setSelected] = useState<Set<string>>(new Set());
  const [states, setStates] = useState<Map<string, 'correct' | 'wrong'>>(new Map());
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const correctIds = game.pairs.filter(p => p.right === 'yes').map(p => p.id);
  const correctCount = [...states.values()].filter(s => s === 'correct').length;

  function handleTap(pair: MatchPair) {
    if (states.has(pair.id)) return;
    const isCorrect = pair.right === 'yes';
    if (isCorrect) {
      setStates(prev => new Map(prev).set(pair.id, 'correct'));
      setSelected(prev => new Set(prev).add(pair.id));
      beep('ok');
      const newCorrectCount = correctCount + 1;
      if (newCorrectCount === correctIds.length) {
        setTimeout(() => setDone(true), 500);
      }
    } else {
      setErrors(e => e + 1);
      setStates(prev => new Map(prev).set(pair.id, 'wrong'));
      beep('no');
      setTimeout(() => {
        setStates(prev => {
          const next = new Map(prev);
          next.delete(pair.id);
          return next;
        });
      }, 800);
    }
  }

  return (
    <GameLayout
      gameId="matchgame"
      onBack={onBack}
      currentRound={correctCount}
      totalRounds={correctIds.length}
      done={done}
      score={{ correct: correctIds.length - errors, total: correctIds.length }}
      onNext={onComplete ? () => onComplete(errors) : undefined}
    >
      {/* Letra destaque no círculo */}
      <div className="flex justify-center" style={{ padding: 'var(--spacing-xl) 0 var(--spacing-lg)' }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 100, height: 100,
            background: theme.gradient,
            boxShadow: `0 6px 24px ${theme.color}66`,
            border: '4px solid rgba(255,255,255,.3)',
          }}
        >
          <span className="text-5xl font-black text-white">{letter}</span>
        </div>
      </div>

      <p className="text-center text-sm font-semibold mb-4" style={{ color: 'var(--color-text-2)' }}>
        Toque nas palavras que começam com <span className="font-extrabold" style={{ color: theme.color }}>{letter}</span>
      </p>

      {/* Grid de palavras */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-8">
        {game.pairs.map((pair, i) => {
          const st = states.get(pair.id);
          const { icon, label } = splitContent(pair.left);
          return (
            <button
              key={pair.id}
              onClick={() => handleTap(pair)}
              aria-label={`Palavra ${label || icon}`}
              className={`animate-pop-up ${st === 'wrong' ? 'animate-shake' : ''}`}
              style={{
                animationDelay: `${i * 50}ms`,
                padding: 'var(--spacing-md) var(--spacing-sm)',
                borderRadius: 18,
                border: `3px solid ${
                  st === 'correct' ? 'var(--color-success)'
                  : st === 'wrong' ? 'var(--color-danger)'
                  : 'var(--color-border)'
                }`,
                background: st === 'correct' ? '#00B89418' : st === 'wrong' ? '#FFEBEE' : 'var(--color-surface)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: st === 'correct' ? 'default' : 'pointer',
                outline: 'none',
                boxShadow: st === 'correct' ? '0 4px 14px rgba(0,184,148,.25)' : 'var(--shadow-card)',
                opacity: st === 'correct' ? 0.7 : 1,
                transition: 'var(--transition-fast)',
              }}
            >
              <span className="text-4xl">{icon}</span>
              <span className="text-sm font-extrabold"
                style={{
                  color: st === 'correct' ? 'var(--color-success)' : st === 'wrong' ? 'var(--color-danger)' : 'var(--color-text)',
                }}>
                {label}
              </span>
              {st === 'correct' && <span className="text-base">✅</span>}
            </button>
          );
        })}
      </div>
    </GameLayout>
  );
}

// ─── Root component ───────────────────────────────────────────
export default function MatchGame({ onBack, gameId, onComplete }: Props) {
  const games = getMatchGames();
  const [current, setCurrent] = useState<MatchGame | null>(() =>
    gameId ? games.find(g => g.id === gameId) ?? null : null,
  );

  if (!current) {
    return <GamePicker games={games} onSelect={setCurrent} onBack={onBack} />;
  }

  if (current.mode === 'connect') {
    return <ConnectMode key={current.id} game={current} onBack={gameId ? onBack : () => setCurrent(null)} onComplete={onComplete} />;
  }
  if (current.mode === 'alphabet') {
    return <AlphabetMode key={current.id} game={current} onBack={gameId ? onBack : () => setCurrent(null)} onComplete={onComplete} />;
  }
  // 'type' and 'count' both use the card-input layout
  return <TypeMode key={current.id} game={current} onBack={gameId ? onBack : () => setCurrent(null)} onComplete={onComplete} />;
}
