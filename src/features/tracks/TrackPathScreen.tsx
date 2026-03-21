import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, Lock, Gamepad2, Star, Pencil, Undo2 } from 'lucide-react';
import { useTracksByAge, useTrackProgress } from '../../shared/queries/tracks.queries';
import type { AgeGroup } from '../../shared/tracks/types';
import type { Track, TrackUnit, TrackLesson, TrackLessonResult } from '../../shared/tracks/types';

// ─── Age-group theming ─────────────────────────────────────────
const AGE_THEME: Record<AgeGroup, { emoji: string; color: string; label: string }> = {
  '3-4':  { emoji: '🧒', color: '#27ae60', label: '3–4 anos' },
  '5-6':  { emoji: '👦', color: '#2980b9', label: '5–6 anos' },
  '7-8':  { emoji: '👧', color: '#8e44ad', label: '7–8 anos' },
  '9-10': { emoji: '🧑', color: '#e67e22', label: '9–10 anos' },
};

// ─── Layout constants (same as PathScreen) ─────────────────────
const PATH_W    = 320;
const NODE_R    = 36;
const ROW_H     = 136;
const BANNER_H  = 84;
const BANNER_MB = 14;
const PAD_TOP   = 20;
const PAD_BOT   = 140;
const TRACK_W   = 5;
const PAD_X     = 32;

const USABLE_W  = PATH_W - PAD_X * 2;
const X_FRAC    = [0.12, 0.50, 0.88, 0.50];
const X_PX      = X_FRAC.map(f => Math.round(PAD_X + f * USABLE_W));

// ─── Layout types ──────────────────────────────────────────────
interface NodeLayout {
  kind: 'node';
  lesson: TrackLesson;
  unit: TrackUnit;
  trackId: string;
  ui: number; li: number; gi: number;
  cx: number; cy: number;
}
interface BannerLayout {
  kind: 'banner';
  unit: TrackUnit;
  ui: number;
  top: number;
}
type LayoutItem = NodeLayout | BannerLayout;

// ─── Build layout from tracks ──────────────────────────────────
function buildLayout(tracks: Track[]): { items: LayoutItem[]; nodes: NodeLayout[]; totalH: number } {
  const items: LayoutItem[] = [];
  let y = PAD_TOP;
  let gi = 0;

  for (const track of tracks) {
    for (let ui = 0; ui < track.units.length; ui++) {
      const unit = track.units[ui];
      items.push({ kind: 'banner', unit, ui, top: y });
      y += BANNER_H + BANNER_MB;

      for (let li = 0; li < unit.lessons.length; li++) {
        const lesson = unit.lessons[li];
        items.push({
          kind: 'node', lesson, unit, trackId: track.id,
          ui, li, gi, cx: X_PX[gi % 4], cy: y + NODE_R,
        });
        y += ROW_H;
        gi++;
      }
    }
  }

  const nodes = items.filter((i): i is NodeLayout => i.kind === 'node');
  return { items, nodes, totalH: y + PAD_BOT };
}

// ─── Lesson unlock logic ───────────────────────────────────────
function isLessonUnlocked(
  nodeIndex: number,
  nodes: NodeLayout[],
  completedLessons: Record<string, TrackLessonResult>,
): boolean {
  // First lesson is always unlocked
  if (nodeIndex === 0) return true;
  // Unlock if previous lesson is completed
  const prev = nodes[nodeIndex - 1];
  return prev.lesson.id in completedLessons;
}

// ─── SVG path helpers (same as PathScreen) ─────────────────────
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

function segD(p: NodeLayout, c: NodeLayout): string {
  const t = (c.cy - p.cy) * 0.44;
  return `M ${p.cx},${p.cy} C ${p.cx},${p.cy + t} ${c.cx},${c.cy - t} ${c.cx},${c.cy}`;
}

// ─── Decorative terrain layer ─────────────────────────────────
function TerrainLayer({ totalH, color }: { totalH: number; color: string }) {
  const decorations = useMemo(() => {
    const items: Array<{ type: 'cloud' | 'star' | 'tree'; x: number; y: number; size: number; opacity: number }> = [];
    const positions = [
      { x: 12, y: 0.08 }, { x: 78, y: 0.12 }, { x: 20, y: 0.22 },
      { x: 82, y: 0.30 }, { x: 8,  y: 0.40 }, { x: 88, y: 0.45 },
      { x: 15, y: 0.55 }, { x: 75, y: 0.62 }, { x: 5,  y: 0.70 },
      { x: 85, y: 0.78 }, { x: 18, y: 0.87 }, { x: 80, y: 0.93 },
    ];
    positions.forEach(({ x, y }, i) => {
      items.push({
        type: (['cloud', 'star', 'tree'] as const)[i % 3],
        x: (x / 100) * PATH_W,
        y: y * totalH,
        size: 14 + (i % 3) * 4,
        opacity: 0.10 + (i % 4) * 0.03,
      });
    });
    return items;
  }, [totalH]);

  return (
    <svg
      width={PATH_W} height={totalH}
      style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      {decorations.map((d, i) => {
        if (d.type === 'cloud') {
          return (
            <g key={i} transform={`translate(${d.x},${d.y})`} opacity={d.opacity}>
              <ellipse cx={0} cy={0} rx={d.size} ry={d.size * 0.55} fill="white" />
              <ellipse cx={-d.size * 0.5} cy={d.size * 0.1} rx={d.size * 0.6} ry={d.size * 0.4} fill="white" />
              <ellipse cx={d.size * 0.5} cy={d.size * 0.1} rx={d.size * 0.55} ry={d.size * 0.38} fill="white" />
            </g>
          );
        }
        if (d.type === 'tree') {
          return (
            <g key={i} transform={`translate(${d.x},${d.y})`} opacity={d.opacity}>
              <polygon points={`0,${-d.size} ${-d.size * 0.7},${d.size * 0.4} ${d.size * 0.7},${d.size * 0.4}`} fill={color} />
              <rect x={-d.size * 0.15} y={d.size * 0.4} width={d.size * 0.3} height={d.size * 0.5} fill={color} />
            </g>
          );
        }
        return (
          <text key={i} x={d.x} y={d.y} fontSize={d.size} opacity={d.opacity} textAnchor="middle" fill="white">★</text>
        );
      })}
    </svg>
  );
}

// ─── Celebration particle overlay ──────────────────────────────
function CelebrationOverlay({ cx, cy }: { cx: number; cy: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      dist: 44 + (i % 3) * 18,
      emoji: (['⭐', '✨', '🌟', '💫'][i % 4]),
      size: 14 + (i % 3) * 6,
    })),
  []);

  return (
    <div style={{ position: 'absolute', left: cx - 80, top: cy - 80, width: 160, height: 160, pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-pop"
          style={{
            position: 'absolute',
            left: 80 + Math.cos(p.angle) * p.dist - p.size / 2,
            top:  80 + Math.sin(p.angle) * p.dist - p.size / 2,
            fontSize: p.size,
            animationDelay: `${i * 40}ms`,
            animationDuration: '0.6s',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function TrackPathScreen() {
  const navigate = useNavigate();
  const { ageGroup } = useParams<{ ageGroup: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const age = (ageGroup as AgeGroup) || '3-4';
  const theme = AGE_THEME[age] ?? AGE_THEME['3-4'];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Celebration: shows star burst over a just-completed lesson node
  const completedLessonId = searchParams.get('completed');
  const [celebratingId, setCelebratingId] = useState<string | null>(completedLessonId);

  useEffect(() => {
    if (!completedLessonId) return;
    setSearchParams({}, { replace: true });
    const t = setTimeout(() => setCelebratingId(null), 2000);
    return () => clearTimeout(t);
  }, [completedLessonId]);

  const { data: tracks = [] } = useTracksByAge(age);
  const { data: progressList = [] } = useTrackProgress(age);

  // Merge all completed lessons across all tracks for this age group
  const completedLessons = useMemo(() => {
    const map: Record<string, TrackLessonResult> = {};
    for (const p of progressList) {
      Object.assign(map, p.completedLessons);
    }
    return map;
  }, [progressList]);

  const totalXP = useMemo(
    () => progressList.reduce((sum, p) => sum + p.totalXP, 0),
    [progressList],
  );
  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;

  const { items, nodes, totalH } = useMemo(() => buildLayout(tracks), [tracks]);

  // Auto-scroll to current (first unlocked incomplete) lesson
  useEffect(() => {
    const current = nodes.findIndex((_, i) =>
      isLessonUnlocked(i, nodes, completedLessons) && !(nodes[i].lesson.id in completedLessons),
    );
    if (current >= 0 && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, nodes[current].cy - 240);
    }
  }, []);

  function handleLessonClick(node: NodeLayout, nodeIdx: number) {
    if (!isLessonUnlocked(nodeIdx, nodes, completedLessons)) return;
    navigate(`/tracks/${age}/lesson/${node.trackId}/${node.ui}/${node.li}`);
  }

  // Empty state
  if (tracks.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh',
        background: 'var(--gradient-hero)', color: '#fff', textAlign: 'center',
        padding: 32,
      }}>
        <span style={{ fontSize: 64, marginBottom: 16 }}>{theme.emoji}</span>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Nenhuma trilha disponível
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
          Trilhas para {theme.label} serão adicionadas em breve!
        </div>
        <button
          onClick={() => navigate('/', { state: { changeAge: true } })}
          style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '10px 24px', color: '#fff', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <Undo2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Trocar faixa etária
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
      background: 'var(--gradient-hero)',
    }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        flexShrink: 0,
        background: `${theme.color}cc`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.09)',
        padding: '12px 16px 10px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{theme.emoji}</span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                {tracks[0]?.name ?? 'Trilha'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                {theme.label} · Nível {level} · {totalXP} XP
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate(`/tracks/${age}/edit`)}
              aria-label="Editar trilhas"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 999, padding: '6px 12px',
                color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', outline: 'none',
                transition: 'background .14s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.20)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            >
              <Pencil size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Editar
            </button>
            <button
              onClick={() => navigate('/', { state: { changeAge: true } })}
              aria-label="Trocar faixa etária"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 999, padding: '6px 12px',
                color: 'rgba(255,255,255,0.70)', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', outline: 'none',
                transition: 'background .14s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.20)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            >
              <Undo2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Trocar
            </button>
            <div style={{
              background: 'rgba(253,203,110,0.16)',
              border: '1.5px solid rgba(253,203,110,0.40)',
              borderRadius: 999, padding: '6px 13px',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Star size={15} fill="#FDCB6E" color="#FDCB6E" />
              <span style={{ fontWeight: 800, color: '#FDCB6E', fontSize: 13 }}>{totalXP} XP</span>
            </div>
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
        <div style={{ position: 'relative', margin: '0 auto', width: PATH_W, height: totalH }}>

          {/* ── Decorative terrain layer ───────────────────────── */}
          <TerrainLayer totalH={totalH} color={theme.color} />

          {/* ── SVG track ─────────────────────────────────────── */}
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
              const next = nodes[i + 1];
              const result = completedLessons[node.lesson.id];
              const unlocked = isLessonUnlocked(i, nodes, completedLessons);
              const nextUnlocked = isLessonUnlocked(i + 1, nodes, completedLessons);

              if (!unlocked) return null;

              const color = result ? (node.unit.color || theme.color) : 'rgba(255,255,255,0.35)';
              const dashed = !result || !nextUnlocked;

              return (
                <path
                  key={`seg-${node.lesson.id}`}
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

            {/* Pulse ring on current lesson */}
            {nodes.map((node, i) => {
              const result = completedLessons[node.lesson.id];
              const unlocked = isLessonUnlocked(i, nodes, completedLessons);
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

          {/* ── Banners ───────────────────────────────────────── */}
          {items
            .filter((i): i is BannerLayout => i.kind === 'banner')
            .map((banner, idx) => (
              <div
                key={`banner-${banner.ui}-${idx}`}
                style={{
                  position: 'absolute',
                  top: banner.top,
                  left: PAD_X - 8, right: PAD_X - 8,
                  height: BANNER_H,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, ${banner.unit.color || theme.color}d0 0%, ${banner.unit.color || theme.color}70 100%)`,
                  border: `1.5px solid ${(banner.unit.color || theme.color)}55`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0 16px',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', right: -20, top: -20,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.10)',
                  filter: 'blur(20px)',
                }} />
                <span style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>{banner.unit.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
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
                  {(() => {
                    const total = banner.unit.lessons.length;
                    const done = banner.unit.lessons.filter(l => l.id in completedLessons).length;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.20)' }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            background: '#FDCB6E',
                            width: `${total > 0 ? (done / total) * 100 : 0}%`,
                            transition: 'width .6s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {done}/{total}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))
          }

          {/* ── Lesson nodes ──────────────────────────────────── */}
          {/* ── Celebration overlay ───────────────────────────── */}
          {celebratingId && nodes.filter(n => n.lesson.id === celebratingId).map(n => (
            <CelebrationOverlay key={`cel-${n.lesson.id}`} cx={n.cx} cy={n.cy} />
          ))}

          {nodes.map((node, idx) => {
            const result = completedLessons[node.lesson.id];
            const unlocked = isLessonUnlocked(idx, nodes, completedLessons);
            const isCurrent = !result && unlocked;
            const unitColor = node.unit.color || theme.color;
            const unitBg = node.unit.bg || `${unitColor}22`;

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
                  width: NODE_R * 2,
                  height: NODE_R * 2,
                }}
              >
                <button
                  onClick={() => handleLessonClick(node, idx)}
                  disabled={!unlocked}
                  aria-label={node.lesson.title}
                  style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    border: `4px solid ${
                      result    ? unitColor
                      : isCurrent ? '#FDCB6E'
                      : 'rgba(255,255,255,0.18)'
                    }`,
                    background: result
                      ? `linear-gradient(145deg, ${unitBg}, ${unitColor}55)`
                      : isCurrent
                      ? 'rgba(255,255,255,0.96)'
                      : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    cursor: unlocked ? 'pointer' : 'default',
                    boxShadow: isCurrent
                      ? '0 0 0 7px rgba(253,203,110,0.25), 0 4px 16px rgba(253,203,110,0.50)'
                      : result
                      ? `0 4px 14px ${unitColor}60`
                      : 'none',
                    transition: 'transform .14s, box-shadow .14s',
                    animation: isCurrent ? 'pulse-scale 1.7s ease-in-out infinite' : 'none',
                    outline: 'none',
                  }}
                  onMouseEnter={e => unlocked && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.06)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = '')}
                >
                  {result ? <Check size={22} color="#4CAF50" strokeWidth={3} /> : unlocked ? node.lesson.emoji : <Lock size={20} color="rgba(255,255,255,0.5)" />}
                </button>

                {/* Floating label + stars */}
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
                    <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                      {[1, 2, 3].map(s => (
                        <Star key={s} size={14} fill={s <= result.stars ? '#FFD700' : 'transparent'} color={s <= result.stars ? '#FFD700' : 'rgba(255,255,255,0.4)'} />
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
        background: `linear-gradient(to top, ${theme.color}f7 60%, transparent)`,
        display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={() => navigate('/freeplay')}
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
          <Gamepad2 size={18} /> Jogar Livre
        </button>
      </div>
    </div>
  );
}
