import { useMemo, useRef, useEffect, useState } from 'react';
import { Check, Lock, Gamepad2, Star, CaseSensitive } from 'lucide-react';
import { curriculum } from '../../shared/progression/curriculum';
import { useProgress } from '../../shared/progression/useProgress';
import type { Lesson, Unit } from '../../shared/progression/types';
import AgeSelector from '../../shared/components/AgeSelector';
import { getSavedAgeGroup, getAgeGroup, type AgeGroup } from '../../shared/config/ageGroups';

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
function buildLayout(units: Unit[]): { items: LayoutItem[]; nodes: NodeLayout[]; totalH: number } {
  const items: LayoutItem[] = [];
  let y = PAD_TOP;
  let gi = 0;

  for (let ui = 0; ui < units.length; ui++) {
    const unit = units[ui];
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
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(() => getSavedAgeGroup());
  const [showAgePicker, setShowAgePicker] = useState(!ageGroup);

  // Filter curriculum by age group
  const ageConfig = ageGroup ? getAgeGroup(ageGroup) : null;
  const visibleCurriculum = useMemo(() => {
    if (!ageConfig || ageConfig.curriculumUnits.length === 0) return curriculum;
    return curriculum.filter(u => ageConfig.curriculumUnits.includes(u.id));
  }, [ageConfig]);

  const { items, nodes, totalH } = useMemo(() => buildLayout(visibleCurriculum), [visibleCurriculum]);

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

  // Show age picker on first visit or when manually toggled
  if (showAgePicker) {
    return (
      <AgeSelector
        current={ageGroup}
        onSelect={(id) => {
          setAgeGroup(id);
          setShowAgePicker(false);
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: 'linear-gradient(170deg, #EDE9F9 0%, #F5F0E8 40%, #FFF8EF 100%)',
    }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '14px 16px 10px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}><CaseSensitive size={32} color="var(--color-primary)" /></span>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.4px' }}>
                Silabrinca
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
                Nível {level} · {xp} XP total
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {ageConfig && (
              <button
                onClick={() => setShowAgePicker(true)}
                style={{
                  background: `${ageConfig.color}18`,
                  border: `2px solid ${ageConfig.color}33`,
                  borderRadius: 999, padding: '8px 14px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', outline: 'none',
                  minHeight: 'var(--touch-min)',
                }}
                aria-label="Mudar perfil de idade"
              >
                <span style={{ fontSize: 18 }}>{ageConfig.emoji}</span>
                <span style={{ fontWeight: 700, color: ageConfig.color, fontSize: 12 }}>{ageConfig.ageRange}</span>
              </button>
            )}
            <div style={{
              background: '#FFF8E1',
              border: '2px solid #FFE08233',
              borderRadius: 999, padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 'var(--touch-min)',
            }}>
              <Star size={18} fill="#D4A017" color="#D4A017" />
              <span style={{ fontWeight: 800, color: '#D4A017', fontSize: 14 }}>{xp} XP</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 8, background: 'var(--color-border)', borderRadius: 999, height: 6 }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: 'linear-gradient(90deg,#FFD180,#F4845F)',
            width: `${xpInLevel}%`, transition: 'width .6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>Nível {level}</span>
          <span style={{ fontSize: 10, color: 'var(--color-text-3)' }}>
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
              stroke="rgba(126,111,212,0.13)"
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

              const color  = result ? node.unit.color : 'rgba(126,111,212,0.22)';
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
                  fill="rgba(255,209,128,0.22)"
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

                <span style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{banner.unit.emoji}</span>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.70)',
                    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2,
                  }}>
                    Unidade {banner.ui + 1}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
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
                      : isCurrent ? '#FFD180'
                      : 'rgba(126,111,212,0.15)'
                    }`,
                    background: result
                      ? `linear-gradient(145deg, ${node.unit.bg}, ${node.unit.color}44)`
                      : isCurrent
                      ? 'rgba(255,255,255,0.98)'
                      : 'rgba(255,255,255,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                    cursor: unlocked ? 'pointer' : 'default',
                    boxShadow: isCurrent
                      ? '0 0 0 7px rgba(255,209,128,0.28), 0 4px 16px rgba(255,209,128,0.40)'
                      : result
                      ? `0 4px 14px ${node.unit.color}40`
                      : 'none',
                    transition: 'transform .14s, box-shadow .14s',
                    animation: isCurrent ? 'pulse-scale 1.7s ease-in-out infinite' : 'none',
                    outline: 'none',
                  }}
                  onMouseEnter={e => unlocked && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = '')}
                >
                  {result ? <Check size={24} color="#4CAF50" strokeWidth={3} /> : unlocked ? node.lesson.emoji : <Lock size={22} color="#aaa" />}
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
                    fontSize: 12, fontWeight: 800, lineHeight: 1.25,
                    color: result ? 'var(--color-text)' : isCurrent ? 'var(--color-text)' : 'var(--color-text-3)',
                    textAlign: labelRight ? 'left' : 'right',
                  }}>
                    {node.lesson.title}
                  </span>
                  {result && (
                    <div style={{ display: 'flex', gap: 1, marginTop: 3 }}>
                      {[1, 2, 3].map(s => (
                        <Star key={s} size={11} fill={s <= result.stars ? '#FFD700' : 'transparent'} color={s <= result.stars ? '#FFD700' : '#ccc'} />
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
        background: 'linear-gradient(to top, rgba(250,250,247,0.97) 60%, transparent)',
        display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={onFreePlay}
          style={{
            background: 'var(--gradient-accent)',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '16px 44px', fontSize: 18, fontWeight: 800,
            cursor: 'pointer', outline: 'none',
            boxShadow: '0 6px 20px rgba(244,132,95,0.35)',
            display: 'flex', alignItems: 'center', gap: 10,
            minHeight: 'var(--touch-lg)',
            transition: 'transform .14s, box-shadow .14s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(244,132,95,0.50)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(244,132,95,0.35)';
          }}
        >
          <Gamepad2 size={20} /> Jogar Livre
        </button>
      </div>
    </div>
  );
}
