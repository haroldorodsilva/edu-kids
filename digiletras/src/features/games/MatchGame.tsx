import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { getMatchGames, type MatchGame, type MatchPair } from '../../shared/data/matchGames';
import { beep } from '../../shared/utils/audio';

interface Props {
  onBack: () => void;
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

// ─── Game picker ───────────────────────────────────────────────
function GamePicker({ games, onSelect, onBack }: {
  games: MatchGame[];
  onSelect: (g: MatchGame) => void;
  onBack: () => void;
}) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'var(--gradient-primary)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 12px rgba(108,92,231,.35)',
      }}>
        <button onClick={onBack} style={btnIconStyle}>←</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>🔗 Ligar / Digitar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>Escolha um jogo</div>
        </div>
      </header>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onSelect(g)}
            className="animate-pop-up"
            style={{
              animationDelay: `${i * 40}ms`,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              padding: '16px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', outline: 'none', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 40, lineHeight: 1 }}>{g.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>{g.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>{g.description}</div>
              <div style={{
                marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                background: g.type === 'connect' ? '#6C5CE722' : '#00B89422',
                color: g.type === 'connect' ? '#6C5CE7' : '#00B894',
                borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              }}>
                {g.type === 'connect' ? '🔗 Ligar' : '⌨️ Digitar'}
              </div>
            </div>
            <span style={{ fontSize: 20, color: 'var(--color-text-3)' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Connect mode ──────────────────────────────────────────────
function ConnectMode({ game, onBack }: { game: MatchGame; onBack: () => void }) {
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
      // Correct!
      const next = new Map(matched);
      next.set(selectedLeft, pair.id);
      setMatched(next);
      setSelectedLeft(null);
      beep('ok');
      if (next.size === game.pairs.length) {
        setTimeout(() => setDone(true), 400);
      }
    } else {
      // Wrong — flash red line
      setErrors(e => e + 1);
      setWrongAnim({ key: Date.now(), leftId: selectedLeft, rightId: pair.id });
      beep('error');
      setTimeout(() => setWrongAnim(null), 600);
    }
  }

  // SVG height = container height
  const [svgH, setSvgH] = useState(400);
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      setSvgH(entries[0].contentRect.height);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (done) {
    return <DoneScreen game={game} errors={errors} onBack={onBack} onReplay={() => {
      setMatched(new Map()); setErrors(0); setDone(false); setSelectedLeft(null);
    }} />;
  }

  const pairs = game.pairs;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--gradient-primary)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        boxShadow: '0 2px 12px rgba(108,92,231,.35)',
      }}>
        <button onClick={onBack} style={btnIconStyle}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{game.emoji} {game.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{game.instructions}</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,.15)', borderRadius: 999,
          padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {matched.size}/{pairs.length}
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 5, background: 'var(--color-border)', flexShrink: 0 }}>
        <div style={{
          height: '100%', background: 'var(--gradient-success)',
          width: `${(matched.size / pairs.length) * 100}%`,
          transition: 'width .4s ease', borderRadius: '0 4px 4px 0',
        }} />
      </div>

      {/* Game area — three zones: left | middle (lines) | right */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          flex: 1, position: 'relative',
          display: 'flex', alignItems: 'flex-start',
          padding: '20px 10px', gap: 0,
          userSelect: 'none', touchAction: 'none',
          overflowY: 'auto',
        }}
      >
        {/* SVG overlay — covers entire container, lines drawn here */}
        <svg
          width="100%" height={svgH}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          {/* Matched lines */}
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

          {/* Wrong flash line */}
          {wrongAnim && (() => {
            const s = getRightEdge(wrongAnim.leftId), e = getLeftEdge(wrongAnim.rightId);
            if (!s || !e) return null;
            return (
              <line key={wrongAnim.key}
                className="anim-wrong-line"
                x1={s.x} y1={s.y} x2={e.x} y2={e.y}
                stroke="#E53935" strokeWidth="3.5" strokeLinecap="round"
              />
            );
          })()}

          {/* Rubber-band line */}
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

        {/* ── Left column ───────────────────────────── */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pairs.map(pair => {
            const { icon, label } = splitContent(pair.left);
            const isMatched  = matched.has(pair.id);
            const isSelected = selectedLeft === pair.id;
            return (
              <button
                key={pair.id}
                ref={el => { if (el) leftRefs.current.set(pair.id, el); }}
                onClick={() => handleLeftClick(pair.id)}
                style={{
                  ...cardBase,
                  border: `2.5px solid ${isMatched ? 'var(--color-success)' : isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: isMatched ? '#00B89415' : isSelected ? '#6C5CE718' : 'var(--color-surface)',
                  cursor: isMatched ? 'default' : 'pointer',
                  boxShadow: isSelected ? '0 0 0 4px rgba(108,92,231,.18), var(--shadow-md)' : 'var(--shadow-card)',
                  opacity: isMatched ? 0.55 : 1,
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
              >
                <span style={{ fontSize: 32, lineHeight: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon || <span style={{ fontSize: 22, color: 'var(--color-primary)', fontWeight: 900 }}>{label.slice(0, 3)}</span>}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
                  color: isMatched ? 'var(--color-success)' : isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  maxWidth: '100%',
                }}>
                  {icon ? label : ''}
                </span>
                {isMatched && <span style={{ fontSize: 13, position: 'absolute', top: 6, right: 8 }}>✅</span>}
              </button>
            );
          })}
        </div>

        {/* ── Middle zone ───────────────────────────── */}
        <div style={{
          width: '20%', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', paddingTop: 32, pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 18, opacity: selectedLeft ? 0.7 : 0.15 }}>🔗</span>
        </div>

        {/* ── Right column ──────────────────────────── */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shuffledRight.map(pair => {
            const { icon, label } = splitContent(pair.right);
            const isMatched   = [...matched.values()].includes(pair.id);
            const isHighlight = !!selectedLeft && !isMatched;
            return (
              <button
                key={pair.id}
                ref={el => { if (el) rightRefs.current.set(pair.id, el); }}
                onClick={() => handleRightClick(pair)}
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
                <span style={{ fontSize: 32, lineHeight: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon || <span style={{ fontSize: 22, color: 'var(--color-primary)', fontWeight: 900 }}>{label.slice(0, 3)}</span>}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
                  color: isMatched ? 'var(--color-success)' : 'var(--color-text)',
                  maxWidth: '100%',
                }}>
                  {icon ? label : ''}
                </span>
                {isMatched && <span style={{ fontSize: 13, position: 'absolute', top: 6, right: 8 }}>✅</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Type mode ────────────────────────────────────────────────
function TypeMode({ game, onBack }: { game: MatchGame; onBack: () => void }) {
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [states,  setStates]  = useState<Map<string, 'idle' | 'correct' | 'wrong'>>(new Map());
  const [errors,  setErrors]  = useState(0);
  const [done,    setDone]    = useState(false);

  function handleCheck(pair: MatchPair) {
    const ans = normalizeAnswer(answers.get(pair.id) ?? '');
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
      beep('error');
      setTimeout(() => {
        setStates(prev => new Map(prev).set(pair.id, 'idle'));
        setAnswers(prev => new Map(prev).set(pair.id, ''));
      }, 700);
    }
  }

  const correctCount = [...states.values()].filter(s => s === 'correct').length;

  if (done) {
    return <DoneScreen game={game} errors={errors} onBack={onBack} onReplay={() => {
      setAnswers(new Map()); setStates(new Map()); setErrors(0); setDone(false);
    }} />;
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <header style={{
        background: 'var(--gradient-primary)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        boxShadow: '0 2px 12px rgba(108,92,231,.35)',
      }}>
        <button onClick={onBack} style={btnIconStyle}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{game.emoji} {game.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{game.instructions}</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,.15)', borderRadius: 999,
          padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {correctCount}/{game.pairs.length}
        </div>
      </header>

      <div style={{ height: 5, background: 'var(--color-border)' }}>
        <div style={{
          height: '100%', background: 'var(--gradient-success)',
          width: `${(correctCount / game.pairs.length) * 100}%`,
          transition: 'width .4s ease', borderRadius: '0 4px 4px 0',
        }} />
      </div>

      {/* Two-column card layout: left card | arrow | right input card */}
      <div style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {game.pairs.map(pair => {
          const st  = states.get(pair.id) ?? 'idle';
          const val = answers.get(pair.id) ?? '';
          const { icon, label } = splitContent(pair.left);
          return (
            <div
              key={pair.id}
              className={st === 'wrong' ? 'animate-shake' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 0 }}
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
                <span style={{ fontSize: 32, lineHeight: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon || <span style={{ fontSize: 22, color: 'var(--color-primary)', fontWeight: 900 }}>{label.slice(0, 3)}</span>}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, color: 'var(--color-text)', maxWidth: '100%' }}>
                  {icon ? label : ''}
                </span>
              </div>

              {/* Middle arrow */}
              <div style={{ width: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 16, opacity: 0.3 }}>→</span>
              </div>

              {/* Right card — input or answer */}
              <div style={{
                ...cardBase,
                width: '40%',
                border: `2px solid ${st === 'correct' ? 'var(--color-success)' : st === 'wrong' ? '#E53935' : 'var(--color-border)'}`,
                background: st === 'correct' ? '#00B89415' : st === 'wrong' ? '#FFEBEE' : 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
                gap: 6,
                padding: '8px 6px',
                transition: 'border-color .2s, background .2s',
              }}>
                {st === 'correct' ? (
                  <>
                    <span style={{ fontSize: 24 }}>✅</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-success)', textAlign: 'center' }}>
                      {pair.right}
                    </span>
                  </>
                ) : (
                  <>
                    <input
                      value={val}
                      onChange={e => setAnswers(prev => new Map(prev).set(pair.id, e.target.value))}
                      onKeyDown={e => e.key === 'Enter' && val.trim() && handleCheck(pair)}
                      placeholder="?"
                      autoComplete="off"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${st === 'wrong' ? '#E53935' : 'var(--color-border)'}`,
                        fontSize: 18, fontWeight: 800,
                        color: 'var(--color-text)',
                        outline: 'none',
                        background: 'transparent',
                        textAlign: 'center',
                        textTransform: 'lowercase',
                        boxSizing: 'border-box',
                        transition: 'border-color .2s',
                      }}
                    />
                    <button
                      onClick={() => val.trim() && handleCheck(pair)}
                      disabled={!val.trim()}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: val.trim() ? 'var(--gradient-primary)' : 'var(--color-border)',
                        color: '#fff', border: 'none',
                        fontSize: 14, cursor: val.trim() ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, outline: 'none',
                        transition: 'background .2s',
                      }}
                    >
                      ✓
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Done screen ───────────────────────────────────────────────
function DoneScreen({ game, errors, onBack, onReplay }: {
  game: MatchGame; errors: number; onBack: () => void; onReplay: () => void;
}) {
  const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-primary)', padding: 24, textAlign: 'center',
    }}>
      <div className="animate-pop" style={{ fontSize: 72 }}>🏆</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '12px 0 6px' }}>
        Muito bem!
      </h2>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', marginBottom: 20 }}>
        {game.name} concluído
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <span key={s} style={{ fontSize: 36, opacity: s <= stars ? 1 : 0.25 }}>⭐</span>
        ))}
      </div>
      {errors > 0 && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.60)', marginBottom: 20 }}>
          {errors} erro{errors > 1 ? 's' : ''}
        </p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onReplay} style={{
          padding: '12px 24px', borderRadius: 999, fontSize: 15, fontWeight: 700,
          background: 'rgba(255,255,255,.20)', color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          🔁 Repetir
        </button>
        <button onClick={onBack} style={{
          padding: '12px 24px', borderRadius: 999, fontSize: 15, fontWeight: 700,
          background: '#fff', color: 'var(--color-primary)', border: 'none', cursor: 'pointer',
        }}>
          ← Voltar
        </button>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────
const cardBase: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: 96,
  borderRadius: 'var(--radius-lg)',
  outline: 'none',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 6,
  transition: 'all .15s',
  padding: '10px 8px',
  boxSizing: 'border-box',
};

const btnIconStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 12,
  background: 'rgba(255,255,255,.15)',
  border: '1.5px solid rgba(255,255,255,.25)',
  color: '#fff', fontSize: 18, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  outline: 'none', flexShrink: 0,
};

// ─── Root component ───────────────────────────────────────────
export default function MatchGame({ onBack }: Props) {
  const games = getMatchGames();
  const [current, setCurrent] = useState<MatchGame | null>(null);

  if (!current) {
    return <GamePicker games={games} onSelect={setCurrent} onBack={onBack} />;
  }

  if (current.type === 'connect') {
    return <ConnectMode key={current.id} game={current} onBack={() => setCurrent(null)} />;
  }
  // 'type' and 'count' both use the card-input layout
  return <TypeMode key={current.id} game={current} onBack={() => setCurrent(null)} />;
}
