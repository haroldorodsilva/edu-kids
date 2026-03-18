import { useMemo, useRef, useEffect } from 'react';
import { curriculum } from '../../shared/progression/curriculum';
import { useProgress } from '../../shared/progression/useProgress';
import type { Lesson, Unit } from '../../shared/progression/types';

interface Props {
  onStartLesson: (unitId: string, lessonId: string) => void;
  onFreePlay: () => void;
}

// ─── Layout constants ──────────────────────────────────────────
const PATH_W    = 320;   // logical canvas width (px)
const NODE_R    = 36;    // node circle radius
const ROW_H     = 136;   // vertical slot per lesson node
const BANNER_H  = 84;    // unit banner height
const BANNER_MB = 14;    // gap below banner before first node
const PAD_TOP   = 20;
const PAD_BOT   = 140;
const TRACK_W   = 5;     // path stroke width
const PAD_X     = 32;    // horizontal padding so nodes don't touch the edges

// 4-step zigzag x positions (fraction of usable width, offset by PAD_X)
const USABLE_W  = PATH_W - PAD_X * 2;
const X_FRAC    = [0.12, 0.50, 0.88, 0.50];
const X_PX      = X_FRAC.map(f => Math.round(PAD_X + f * USABLE_W));

// ─── Layout types ──────────────────────────────────────────────
interface NodeLayout {
  kind: 'node';
  lesson: Lesson;
  unit: Unit;
  ui: number; li: number; gi: number;
  cx: number; cy: number;           // centre of circle
}
interface BannerLayout {
  kind: 'banner';
  unit: Unit;
  ui: number;
  top: number;
}
type LayoutItem = NodeLayout | BannerLayout;

// ─── Pre-compute layout ────────────────────────────────────────
function buildLayout(): { items: LayoutItem[]; nodes: NodeLayout[]; totalH: number } {
  const items: LayoutItem[] = [];
  let y = PAD_TOP;
  let gi = 0;

  for (let ui = 0; ui < curriculum.length; ui++) {
    const unit = curriculum[ui];
    items.push({ kind: 'banner', unit, ui, top: y });
    y += BANNER_H + BANNER_MB;

    for (let li = 0; li < unit.lessons.length; li++) {
      const lesson = unit.lessons[li];
      items.push({ kind: 'node', lesson, unit, ui, li, gi, cx: X_PX[gi % 4], cy: y + NODE_R });
      y += ROW_H;
      gi++;
    }
  }

  const nodes = items.filter((i): i is NodeLayout => i.kind === 'node');
  return { items, nodes, totalH: y + PAD_BOT };
}

// ─── SVG path helpers ──────────────────────────────────────────
// Full track: smooth bezier through every node centre
function fullPathD(nodes: NodeLayout[]): string {
  if (nodes.length < 2) return '';
  let d = `M ${nodes[0].cx},${nodes[0].cy}`;
  for (let i = 1; i < nodes.length; i++) {
    const p = nodes[i - 1], c = nodes[i];
    const t = (c.cy - p.cy) * 0.44;
    d += ` C ${p.cx},${p.cy + t} ${c.cx},${c.cy - t} ${c.cx},${c.cy}`;
  }
  return d;
}

// Single bezier segment between two consecutive nodes
function segD(p: NodeLayout, c: NodeLayout): string {
  const t = (c.cy - p.cy) * 0.44;
  return `M ${p.cx},${p.cy} C ${p.cx},${p.cy + t} ${c.cx},${c.cy - t} ${c.cx},${c.cy}`;
}

// ─── Component ────────────────────────────────────────────────
export default function PathScreen({ onStartLesson, onFreePlay }: Props) {
  const { progress, isLessonUnlocked } = useProgress();
  const scrollRef  = useRef<HTMLDivElement>(null);
  const { items, nodes, totalH } = useMemo(buildLayout, []);

  const allLessonIds = useMemo(() => curriculum.flatMap(u => u.lessons.map(l => l.id)), []);
  const xp        = progress.totalXP;
  const level     = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  // Auto-scroll to the current (first unlocked) lesson
  useEffect(() => {
    const current = nodes.find(n =>
      !progress.completedLessons[n.lesson.id] && isLessonUnlocked(n.lesson.id, allLessonIds)
    );
    if (current && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, current.cy - 240);
    }
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: 'var(--gradient-hero)',
    }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        background: 'rgba(55,38,200,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.09)',
        padding: '12px 16px 10px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🔤</span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                DigiLetras
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                Nível {level} · {xp} XP total
              </div>
            </div>
          </div>
          <div style={{
            background: 'rgba(253,203,110,0.16)',
            border: '1.5px solid rgba(253,203,110,0.40)',
            borderRadius: 999, padding: '6px 13px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 15 }}>⭐</span>
            <span style={{ fontWeight: 800, color: '#FDCB6E', fontSize: 13 }}>{xp} XP</span>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.13)', borderRadius: 999, height: 5 }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg,#FDCB6E,#E17055)',
            width: `${xpInLevel}%`, transition: 'width .6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Nível {level}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
            {xpInLevel}/100 → Nível {level + 1}
          </span>
        </div>
      </header>

      {/* ── Scrollable path ──────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

        {/* Centred canvas */}
        <div style={{ position: 'relative', margin: '0 auto', width: PATH_W, height: totalH }}>

          {/* ── Single SVG track ──────────────────────────────── */}
          <svg
            width={PATH_W}
            height={totalH}
            style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
          >
            {/* Ghost track — full path, dashed */}
            <path
              d={fullPathD(nodes)}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={TRACK_W}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 10"
            />

            {/* Coloured progress segments */}
            {nodes.slice(0, -1).map((node, i) => {
              const next      = nodes[i + 1];
              const result    = progress.completedLessons[node.lesson.id];
              const unlocked  = isLessonUnlocked(node.lesson.id, allLessonIds);
              const nextUnlocked = isLessonUnlocked(next.lesson.id, allLessonIds);

              if (!unlocked) return null;

              const color  = result ? node.unit.color : 'rgba(255,255,255,0.35)';
              const dashed = !result || !nextUnlocked;

              return (
                <path
                  key={node.lesson.id}
                  d={segD(node, next)}
                  fill="none"
                  stroke={color}
                  strokeWidth={TRACK_W}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={dashed ? '8 8' : undefined}
                />
              );
            })}

            {/* Node shadow rings (decorative) */}
            {nodes.map(node => {
              const result   = progress.completedLessons[node.lesson.id];
              const unlocked = isLessonUnlocked(node.lesson.id, allLessonIds);
              const isCurrent = !result && unlocked;
              if (!isCurrent) return null;
              return (
                <circle
                  key={`ring-${node.lesson.id}`}
                  cx={node.cx} cy={node.cy}
                  r={NODE_R + 10}
                  fill="rgba(253,203,110,0.18)"
                  style={{ animation: 'pulse-scale 1.8s ease-in-out infinite' }}
                />
              );
            })}
          </svg>

          {/* ── Banners (absolute) ──────────────────────────── */}
          {items
            .filter((i): i is BannerLayout => i.kind === 'banner')
            .map(banner => (
              <div
                key={`banner-${banner.ui}`}
                style={{
                  position: 'absolute',
                  top: banner.top,
                  left: PAD_X - 8, right: PAD_X - 8,
                  height: BANNER_H,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, ${banner.unit.color}d0 0%, ${banner.unit.color}70 100%)`,
                  border: `1.5px solid ${banner.unit.color}55`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0 16px',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative blurred blob */}
                <div style={{
                  position: 'absolute', right: -20, top: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.10)',
                  filter: 'blur(20px)',
                }} />

                <span style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>{banner.unit.emoji}</span>
                <div>
                  <div style={{
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.60)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2,
                  }}>
                    Unidade {banner.ui + 1}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                    {banner.unit.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>
                    {banner.unit.subtitle}
                  </div>
                </div>
              </div>
            ))
          }

          {/* ── Lesson nodes (absolute) ──────────────────────── */}
          {nodes.map((node, idx) => {
            const result    = progress.completedLessons[node.lesson.id];
            const unlocked  = isLessonUnlocked(node.lesson.id, allLessonIds);
            const isCurrent = !result && unlocked;

            // Which side the label goes (opposite side to avoid going off screen)
            const labelRight = node.cx < PATH_W / 2;

            return (
              <div
                key={node.lesson.id}
                className={idx < 6 ? 'animate-pop' : undefined}
                style={{
                  animationDelay: `${idx * 40}ms`,
                  position: 'absolute',
                  left: node.cx - NODE_R,
                  top: node.cy - NODE_R,
                  width:  NODE_R * 2,
                  height: NODE_R * 2,
                }}
              >
                <button
                  onClick={() => unlocked && onStartLesson(node.unit.id, node.lesson.id)}
                  disabled={!unlocked}
                  aria-label={node.lesson.title}
                  style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    border: `4px solid ${
                      result    ? node.unit.color
                      : isCurrent ? '#FDCB6E'
                      : 'rgba(255,255,255,0.18)'
                    }`,
                    background: result
                      ? `linear-gradient(145deg, ${node.unit.bg}, ${node.unit.color}55)`
                      : isCurrent
                      ? 'rgba(255,255,255,0.96)'
                      : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    cursor: unlocked ? 'pointer' : 'default',
                    boxShadow: isCurrent
                      ? '0 0 0 7px rgba(253,203,110,0.25), 0 4px 16px rgba(253,203,110,0.50)'
                      : result
                      ? `0 4px 14px ${node.unit.color}60`
                      : 'none',
                    transition: 'transform .14s, box-shadow .14s',
                    animation: isCurrent ? 'pulse-scale 1.7s ease-in-out infinite' : 'none',
                    outline: 'none',
                  }}
                  onMouseEnter={e => unlocked && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = '')}
                >
                  {result ? '✅' : unlocked ? node.lesson.emoji : '🔒'}
                </button>

                {/* Floating label + stars — positioned outside the circle */}
                <div style={{
                  position: 'absolute',
                  top: NODE_R - 16,
                  ...(labelRight
                    ? { left: NODE_R * 2 + 8 }
                    : { right: NODE_R * 2 + 8 }),
                  width: 80,
                  display: 'flex', flexDirection: 'column',
                  alignItems: labelRight ? 'flex-start' : 'flex-end',
                  pointerEvents: 'none',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, lineHeight: 1.25,
                    color: result ? '#fff' : isCurrent ? '#fff' : 'rgba(255,255,255,0.40)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.40)',
                    textAlign: labelRight ? 'left' : 'right',
                  }}>
                    {node.lesson.title}
                  </span>
                  {result && (
                    <div style={{ display: 'flex', gap: 1, marginTop: 3 }}>
                      {[1, 2, 3].map(s => (
                        <span key={s} style={{ fontSize: 11, opacity: s <= result.stars ? 1 : 0.22 }}>⭐</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, padding: '12px 20px 24px',
        background: 'linear-gradient(to top, rgba(40,28,180,0.97) 60%, transparent)',
        display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={onFreePlay}
          style={{
            background: 'linear-gradient(135deg,#FDCB6E,#E17055)',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '14px 40px', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', outline: 'none',
            boxShadow: '0 6px 20px rgba(253,203,110,0.50)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform .14s, box-shadow .14s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(253,203,110,0.65)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(253,203,110,0.50)';
          }}
        >
          🎮 Jogar Livre
        </button>
      </div>
    </div>
  );
}
