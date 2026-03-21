/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo } from 'react';
import { Route, Check, Copy, Pencil, Trash2, Settings, Save, ArrowLeft, Gamepad2, Eye } from 'lucide-react';
import LucideIcon from '../../shared/components/ui/LucideIcon';
import { getTrackProgress } from '../../shared/tracks/trackStore';
import { useAllTracks, useSaveTrack, useDeleteTrack } from '../../shared/queries/tracks.queries';
import { TrackSchema } from '../../shared/schemas/track.schema';
import type { Track, TrackUnit, TrackLesson, TrackActivity, TrackGameType, AgeGroup } from '../../shared/tracks/types';
import { getMatchGames } from '../../shared/data/matchGames';
import { getAllStories } from '../../shared/data/customStories';
import WordPickerField from '../../shared/components/form/WordPickerField';
import PreviewModal from '../../shared/components/admin/PreviewModal';
import TrackPreviewPanel from '../../shared/components/admin/TrackPreviewPanel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newId(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const AGE_GROUPS: { id: AgeGroup; label: string; emoji: string; color: string }[] = [
  { id: '3-4',  label: '3–4 anos',  emoji: '🧒', color: '#00B894' },
  { id: '5-6',  label: '5–6 anos',  emoji: '👦', color: '#0984E3' },
  { id: '7-8',  label: '7–8 anos',  emoji: '👧', color: '#6C5CE7' },
  { id: '9-10', label: '9–10 anos', emoji: '🎓', color: '#7c3aed' },
];

const GAME_TYPES: { id: TrackGameType; label: string; icon: string }[] = [
  { id: 'quiz',          label: 'Quiz',           icon: 'CircleHelp' },
  { id: 'memory',        label: 'Memória',        icon: 'Brain' },
  { id: 'syllable',      label: 'Sílabas',        icon: 'Type' },
  { id: 'fill',          label: 'Completar',       icon: 'Pencil' },
  { id: 'write',         label: 'Escrever',        icon: 'PenLine' },
  { id: 'firstletter',   label: 'Letra Inicial',   icon: 'CaseSensitive' },
  { id: 'buildsentence', label: 'Montar Frase',    icon: 'BookOpen' },
  { id: 'story',         label: 'História',        icon: 'BookText' },
  { id: 'matchgame',     label: 'Ligar/Contar',    icon: 'Link' },
];


function emptyTrack(ageGroup: AgeGroup = '3-4'): Track {
  const now = new Date().toISOString();
  return {
    id: newId('track'), name: '', ageGroup, emoji: '📘', color: '#6C5CE7',
    units: [], builtin: false, version: 1, createdAt: now, updatedAt: now,
  };
}

function emptyUnit(): TrackUnit {
  return {
    id: newId('unit'), title: '', subtitle: '', emoji: '📦',
    color: '#6C5CE7', bg: '#EDE7F6', lessons: [],
  };
}

function emptyLesson(): TrackLesson {
  return { id: newId('lesson'), title: '', emoji: '⭐', activities: [] };
}

function emptyActivity(): TrackActivity {
  return { id: newId('act'), gameType: 'quiz', wordIds: [], rounds: 5 };
}

/** Validate track before saving using Zod schema + business rules */
export function validateTrack(track: Track): string | null {
  const result = TrackSchema.safeParse(track);
  if (!result.success) {
    const issues = result.error.issues ?? (result.error as unknown as { errors: Array<{ message: string }> }).errors;
    const first = issues?.[0];
    return first?.message ?? 'Dados inválidos na trilha';
  }
  if (!track.name.trim()) return 'Informe o nome da trilha';
  if (track.units.length === 0) return 'Adicione pelo menos 1 unidade';
  for (const unit of track.units) {
    if (!unit.title.trim()) return `Unidade "${unit.emoji}" precisa de um título`;
    if (unit.lessons.length === 0) return `Unidade "${unit.title}" precisa de pelo menos 1 lição`;
    for (const lesson of unit.lessons) {
      if (lesson.activities.length < 1) {
        return `Lição "${lesson.title || lesson.emoji}" na unidade "${unit.title}" precisa de pelo menos 1 atividade`;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'block',
};

// actionBtn removed — using ds-btn ds-btn-icon classes instead

function pillBtn(active: boolean, activeColor: string): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
    border: `2px solid ${active ? activeColor : 'var(--color-border)'}`,
    background: active ? `${activeColor}15` : 'var(--color-surface)',
    color: active ? activeColor : 'var(--color-text-2)',
    cursor: 'pointer', outline: 'none', transition: 'all .15s',
  };
}

// ---------------------------------------------------------------------------
// Main component — List / Detail pattern
// ---------------------------------------------------------------------------

export default function TrackEditor() {
  const { data: tracks = [] } = useAllTracks();
  const saveTrackMutation = useSaveTrack();
  const deleteTrackMutation = useDeleteTrack();
  const [editing, setEditing] = useState<Track | null>(null);
  const [previewing, setPreviewing] = useState<Track | null>(null);

  function handleSave(track: Track) {
    const updated = { ...track, updatedAt: new Date().toISOString() };
    saveTrackMutation.mutate(updated, { onSuccess: () => setEditing(null) });
  }

  function handleDelete(id: string) {
    const track = tracks.find(t => t.id === id);
    if (!track) return;
    const progress = getTrackProgress(track.ageGroup);
    const hasProgress = progress.some(p => p.trackId === id && Object.keys(p.completedLessons).length > 0);
    const msg = hasProgress
      ? '⚠️ Esta trilha tem progresso de alunos associado. O progresso será mantido mas a trilha ficará inacessível. Deseja excluir?'
      : 'Excluir esta trilha?';
    if (!confirm(msg)) return;
    deleteTrackMutation.mutate({ id, ageGroup: track.ageGroup });
  }

  function handleDuplicate(track: Track) {
    const now = new Date().toISOString();
    const dup: Track = {
      ...JSON.parse(JSON.stringify(track)),
      id: newId('track'),
      name: `${track.name} (cópia)`,
      builtin: false,
      createdAt: now,
      updatedAt: now,
    };
    setEditing(dup);
  }

  if (editing) {
    return <VisualTrackForm track={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  // Group tracks by age
  const grouped = AGE_GROUPS.map(ag => ({
    ...ag,
    tracks: tracks.filter(t => t.ageGroup === ag.id),
  }));

  return (
    <div style={{ padding: 16 }}>
      {previewing && (
        <PreviewModal title={previewing.name || 'Trilha'} onClose={() => setPreviewing(null)}>
          <TrackPreviewPanel track={previewing} />
        </PreviewModal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Route size={20} /> Trilhas de Aprendizado
        </h2>
        <button
          onClick={() => setEditing(emptyTrack())}
          className="ds-btn ds-btn-primary"
          style={{ fontSize: 13 }}
        >
          + Nova Trilha
        </button>
      </div>

      {grouped.map(group => (
        <div key={group.id} style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            background: `${group.color}12`,
          }}>
            <span style={{ fontSize: 20 }}>{group.emoji}</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: group.color }}>{group.label}</span>
            <span style={{
              background: `${group.color}22`, color: group.color,
              borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginLeft: 'auto',
            }}>
              {group.tracks.length} trilha{group.tracks.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {group.tracks.map(track => (
              <div key={track.id} className="ds-card" style={{
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 32, lineHeight: 1 }}>{track.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>
                    {track.name || 'Sem nome'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 2 }}>
                    {track.units.length} unidade{track.units.length !== 1 ? 's' : ''} •{' '}
                    {track.units.reduce((s, u) => s + u.lessons.length, 0)} lições
                  </div>
                  {track.builtin && (
                    <span style={{
                      background: '#FFF3E0', color: '#E65100',
                      borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                      display: 'inline-block', marginTop: 5,
                    }}>padrão</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setPreviewing(track)}
                    className="ds-btn ds-btn-icon" style={{ background: '#E3F2FD', color: '#0984E3', width: 34, height: 34, fontSize: 14 }} title="Pré-visualizar" aria-label="Pré-visualizar trilha"><Eye size={16} /></button>
                  <button onClick={() => handleDuplicate(track)}
                    className="ds-btn ds-btn-icon" style={{ background: '#E8F5E9', color: '#00B894', width: 34, height: 34, fontSize: 14 }} title="Duplicar" aria-label="Duplicar trilha"><Copy size={16} /></button>
                  {!track.builtin && (
                    <>
                      <button onClick={() => setEditing(track)}
                        className="ds-btn ds-btn-icon" style={{ background: '#EDE7F6', color: '#6C5CE7', width: 34, height: 34, fontSize: 14 }} title="Editar" aria-label="Editar trilha"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(track.id)}
                        className="ds-btn ds-btn-icon" style={{ background: '#FFEBEE', color: '#E53935', width: 34, height: 34, fontSize: 14 }} title="Excluir" aria-label="Excluir trilha"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {group.tracks.length === 0 && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-3)', fontSize: 13 }}>
                Nenhuma trilha para esta faixa.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual Graph Layout Constants (matching TrackPathScreen)
// ---------------------------------------------------------------------------

const PATH_W    = 340;
const NODE_R    = 32;
const ROW_H     = 120;
const BANNER_H  = 72;
const BANNER_MB = 12;
const PAD_TOP   = 20;
const PAD_BOT   = 100;
const TRACK_W   = 4;
const PAD_X     = 28;
const ADD_BTN_H = 44;

const USABLE_W  = PATH_W - PAD_X * 2;
const X_FRAC    = [0.15, 0.50, 0.85, 0.50];
const X_PX      = X_FRAC.map(f => Math.round(PAD_X + f * USABLE_W));

interface VNode {
  kind: 'node';
  lesson: TrackLesson;
  unitIdx: number;
  lessonIdx: number;
  gi: number;
  cx: number;
  cy: number;
}
interface VBanner {
  kind: 'banner';
  unit: TrackUnit;
  unitIdx: number;
  top: number;
}
interface VAddLesson {
  kind: 'add-lesson';
  unitIdx: number;
  afterLessonIdx: number; // -1 = before first
  cx: number;
  cy: number;
}
interface VAddUnit {
  kind: 'add-unit';
  afterUnitIdx: number;
  top: number;
}
type VItem = VNode | VBanner | VAddLesson | VAddUnit;

function buildEditorLayout(units: TrackUnit[]): { items: VItem[]; nodes: VNode[]; totalH: number } {
  const items: VItem[] = [];
  let y = PAD_TOP;
  let gi = 0;

  for (let ui = 0; ui < units.length; ui++) {
    const unit = units[ui];
    // Unit banner
    items.push({ kind: 'banner', unit, unitIdx: ui, top: y });
    y += BANNER_H + BANNER_MB;

    if (unit.lessons.length === 0) {
      // Add first lesson button
      const cx = X_PX[gi % 4];
      items.push({ kind: 'add-lesson', unitIdx: ui, afterLessonIdx: -1, cx, cy: y + 20 });
      y += ADD_BTN_H + 10;
    }

    for (let li = 0; li < unit.lessons.length; li++) {
      const lesson = unit.lessons[li];
      const cx = X_PX[gi % 4];
      items.push({ kind: 'node', lesson, unitIdx: ui, lessonIdx: li, gi, cx, cy: y + NODE_R });
      y += ROW_H;
      gi++;

      // Add-lesson button between nodes or after last
      if (li === unit.lessons.length - 1) {
        const nextCx = X_PX[gi % 4];
        items.push({ kind: 'add-lesson', unitIdx: ui, afterLessonIdx: li, cx: nextCx, cy: y - 20 });
        y += 10;
      }
    }
  }

  // Add-unit button at the end
  items.push({ kind: 'add-unit', afterUnitIdx: units.length - 1, top: y });
  y += 60;

  const nodes = items.filter((i): i is VNode => i.kind === 'node');
  return { items, nodes, totalH: y + PAD_BOT };
}

function editorPathD(nodes: VNode[]): string {
  if (nodes.length < 2) return '';
  let d = `M ${nodes[0].cx},${nodes[0].cy}`;
  for (let i = 1; i < nodes.length; i++) {
    const p = nodes[i - 1], c = nodes[i];
    const t = (c.cy - p.cy) * 0.44;
    d += ` C ${p.cx},${p.cy + t} ${c.cx},${c.cy - t} ${c.cx},${c.cy}`;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Visual Track Form — graph-based editor
// ---------------------------------------------------------------------------

type OverlayState =
  | { kind: 'none' }
  | { kind: 'unit'; unitIdx: number }
  | { kind: 'lesson'; unitIdx: number; lessonIdx: number }
  | { kind: 'activity'; unitIdx: number; lessonIdx: number; actIdx: number };

function VisualTrackForm({ track, onSave, onCancel }: {
  track: Track;
  onSave: (t: Track) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(track.name);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(track.ageGroup);
  const [emoji, setEmoji] = useState(track.emoji);
  const [color, setColor] = useState(track.color);
  const [units, setUnits] = useState<TrackUnit[]>(() => JSON.parse(JSON.stringify(track.units)));
  const [error, setError] = useState('');
  const [overlay, setOverlay] = useState<OverlayState>({ kind: 'none' });
  const [headerOpen, setHeaderOpen] = useState(!track.name); // open for new tracks
  const [selectedNode, setSelectedNode] = useState<{ ui: number; li: number } | null>(null);

  const { items, nodes, totalH } = useMemo(() => buildEditorLayout(units), [units]);

  function handleSave() {
    const built: Track = {
      ...track, name: name.trim(), ageGroup, emoji, color, units,
      updatedAt: new Date().toISOString(),
    };
    const err = validateTrack(built);
    if (err) { setError(err); return; }
    onSave(built);
  }

  // Unit operations
  function addUnit(afterIdx: number) {
    const u = emptyUnit();
    setUnits(prev => {
      const arr = [...prev];
      arr.splice(afterIdx + 1, 0, u);
      return arr;
    });
    setOverlay({ kind: 'unit', unitIdx: afterIdx + 1 });
  }

  function removeUnit(idx: number) {
    if (!confirm('Remover esta unidade e todas as lições?')) return;
    setUnits(prev => prev.filter((_, i) => i !== idx));
    setSelectedNode(null);
  }

  function updateUnit(idx: number, unit: TrackUnit) {
    setUnits(prev => prev.map((u, i) => i === idx ? unit : u));
  }

  // Lesson operations
  function addLesson(unitIdx: number, afterLessonIdx: number) {
    const l = emptyLesson();
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons.splice(afterLessonIdx + 1, 0, l);
      return arr;
    });
    setOverlay({ kind: 'lesson', unitIdx, lessonIdx: afterLessonIdx + 1 });
  }

  function removeLesson(unitIdx: number, lessonIdx: number) {
    if (!confirm('Remover esta lição?')) return;
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons.splice(lessonIdx, 1);
      return arr;
    });
    setSelectedNode(null);
  }

  function updateLesson(unitIdx: number, lessonIdx: number, lesson: TrackLesson) {
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons[lessonIdx] = lesson;
      return arr;
    });
  }

  // Activity operations
  function updateActivity(unitIdx: number, lessonIdx: number, actIdx: number, act: TrackActivity) {
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons[lessonIdx].activities[actIdx] = act;
      return arr;
    });
  }

  function addActivity(unitIdx: number, lessonIdx: number) {
    const a = emptyActivity();
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons[lessonIdx].activities.push(a);
      return arr;
    });
    const actIdx = units[unitIdx]?.lessons[lessonIdx]?.activities.length ?? 0;
    setOverlay({ kind: 'activity', unitIdx, lessonIdx, actIdx });
  }

  function removeActivity(unitIdx: number, lessonIdx: number, actIdx: number) {
    setUnits(prev => {
      const arr = JSON.parse(JSON.stringify(prev)) as TrackUnit[];
      arr[unitIdx].lessons[lessonIdx].activities.splice(actIdx, 1);
      return arr;
    });
  }

  // Overlay rendering
  if (overlay.kind === 'unit' && units[overlay.unitIdx]) {
    return (
      <UnitFieldsEditor
        unit={units[overlay.unitIdx]}
        onSave={(u) => { updateUnit(overlay.unitIdx, u); setOverlay({ kind: 'none' }); }}
        onCancel={() => setOverlay({ kind: 'none' })}
      />
    );
  }
  if (overlay.kind === 'lesson' && units[overlay.unitIdx]?.lessons[overlay.lessonIdx]) {
    return (
      <LessonFieldsEditor
        lesson={units[overlay.unitIdx].lessons[overlay.lessonIdx]}
        onSave={(l) => { updateLesson(overlay.unitIdx, overlay.lessonIdx, l); setOverlay({ kind: 'none' }); }}
        onCancel={() => setOverlay({ kind: 'none' })}
      />
    );
  }
  if (overlay.kind === 'activity' && units[overlay.unitIdx]?.lessons[overlay.lessonIdx]?.activities[overlay.actIdx]) {
    return (
      <ActivityEditor
        activity={units[overlay.unitIdx].lessons[overlay.lessonIdx].activities[overlay.actIdx]}
        onSave={(a) => { updateActivity(overlay.unitIdx, overlay.lessonIdx, overlay.actIdx, a); setOverlay({ kind: 'none' }); }}
        onCancel={() => setOverlay({ kind: 'none' })}
      />
    );
  }

  const themeColor = color || '#6C5CE7';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f0eef8' }}>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, padding: '10px 16px',
        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onCancel} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10, width: 34, height: 34, color: '#fff', fontSize: 18,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><ArrowLeft size={18} /></button>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
            {name || 'Nova Trilha'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            {units.length} unidade{units.length !== 1 ? 's' : ''} · {units.reduce((s, u) => s + u.lessons.length, 0)} lições
          </div>
        </div>
        <button onClick={() => setHeaderOpen(!headerOpen)} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10, padding: '6px 12px', color: '#fff', fontSize: 11, fontWeight: 700,
          cursor: 'pointer',
        }}>
          <Settings size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {headerOpen ? 'Fechar' : 'Config'}
        </button>
        <button onClick={handleSave} className="ds-btn" style={{
          background: 'rgba(255,255,255,0.95)', border: 'none',
          borderRadius: 10, padding: '6px 14px', color: themeColor, fontSize: 12, fontWeight: 800,
        }}>
          <Save size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Salvar
        </button>
      </div>

      {/* ── Collapsible config panel ────────────────────────── */}
      {headerOpen && (
        <div style={{
          flexShrink: 0, padding: '12px 16px', background: '#fff',
          borderBottom: '1.5px solid var(--color-border)',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
        }}>
          <div>
            <label style={labelStyle}>Emoji</label>
            <input value={emoji} onChange={e => setEmoji(e.target.value)}
              className="ds-input" style={{ width: 54, textAlign: 'center', fontSize: 20, padding: '6px' }} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={labelStyle}>Nome</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Primeiras Letras" className="ds-input" />
          </div>
          <div>
            <label style={labelStyle}>Cor</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 36, height: 32, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
          </div>
          <div>
            <label style={labelStyle}>Faixa etária</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {AGE_GROUPS.map(ag => (
                <button key={ag.id} onClick={() => setAgeGroup(ag.id)}
                  style={{ ...pillBtn(ageGroup === ag.id, ag.color), fontSize: 11, padding: '4px 10px' }}>
                  {ag.emoji} {ag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '8px 16px', background: '#FFEBEE', color: '#E53935', fontSize: 12, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* ── Visual graph area ───────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ position: 'relative', margin: '0 auto', width: PATH_W, minHeight: totalH }}>

          {/* SVG track lines */}
          <svg width={PATH_W} height={totalH} style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
            <path d={editorPathD(nodes)} fill="none" stroke="rgba(108,92,231,0.18)" strokeWidth={TRACK_W}
              strokeLinecap="round" strokeDasharray="10 8" />
            {/* Solid segments between consecutive nodes in same unit */}
            {nodes.slice(0, -1).map((node, i) => {
              const next = nodes[i + 1];
              if (node.unitIdx !== next.unitIdx) return null;
              const unitColor = units[node.unitIdx]?.color || themeColor;
              const t = (next.cy - node.cy) * 0.44;
              const d = `M ${node.cx},${node.cy} C ${node.cx},${node.cy + t} ${next.cx},${next.cy - t} ${next.cx},${next.cy}`;
              return <path key={`seg-${i}`} d={d} fill="none" stroke={`${unitColor}88`} strokeWidth={TRACK_W} strokeLinecap="round" />;
            })}
          </svg>

          {/* Banners */}
          {items.filter((i): i is VBanner => i.kind === 'banner').map((b) => {
            const unitColor = b.unit.color || themeColor;
            return (
              <div key={`banner-${b.unitIdx}`} style={{
                position: 'absolute', top: b.top, left: 8, right: 8, height: BANNER_H,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${unitColor}dd 0%, ${unitColor}88 100%)`,
                border: `1.5px solid ${unitColor}55`,
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
                cursor: 'pointer', overflow: 'hidden',
              }}
                onClick={() => setOverlay({ kind: 'unit', unitIdx: b.unitIdx })}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>{b.unit.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Unidade {b.unitIdx + 1}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                    {b.unit.title || 'Sem título'}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                    {b.unit.lessons.length} lição{b.unit.lessons.length !== 1 ? 'ões' : ''} · toque para editar
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeUnit(b.unitIdx); }} style={{
                  width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
                  border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} title="Remover unidade">×</button>
              </div>
            );
          })}

          {/* Lesson nodes */}
          {nodes.map((node) => {
            const unitColor = units[node.unitIdx]?.color || themeColor;
            const isSelected = selectedNode?.ui === node.unitIdx && selectedNode?.li === node.lessonIdx;
            const activities = node.lesson.activities;

            return (
              <div key={`node-${node.unitIdx}-${node.lessonIdx}`}>
                {/* Node circle */}
                <div style={{
                  position: 'absolute',
                  left: node.cx - NODE_R, top: node.cy - NODE_R,
                  width: NODE_R * 2, height: NODE_R * 2,
                }}>
                  <button
                    onClick={() => setSelectedNode(isSelected ? null : { ui: node.unitIdx, li: node.lessonIdx })}
                    style={{
                      width: '100%', height: '100%', borderRadius: '50%',
                      border: `3px solid ${isSelected ? '#FDCB6E' : unitColor}`,
                      background: isSelected
                        ? 'rgba(253,203,110,0.15)'
                        : `linear-gradient(145deg, ${unitColor}22, ${unitColor}55)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, cursor: 'pointer', outline: 'none',
                      boxShadow: isSelected
                        ? '0 0 0 5px rgba(253,203,110,0.25), 0 4px 14px rgba(253,203,110,0.4)'
                        : `0 3px 10px ${unitColor}40`,
                      transition: 'all .15s',
                    }}
                  >
                    {node.lesson.emoji}
                  </button>

                  {/* Delete button on node */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeLesson(node.unitIdx, node.lessonIdx); }}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#E53935', color: '#fff', border: '2px solid #fff',
                      fontSize: 10, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Remover lição"
                  >×</button>
                </div>

                {/* Label */}
                {(() => {
                  const labelRight = node.cx < PATH_W / 2;
                  return (
                    <div style={{
                      position: 'absolute',
                      top: node.cy - 14,
                      ...(labelRight ? { left: node.cx + NODE_R + 8 } : { right: PATH_W - node.cx + NODE_R + 8 }),
                      width: 90, pointerEvents: 'none',
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color: 'var(--color-text)',
                        display: 'block', textAlign: labelRight ? 'left' : 'right',
                      }}>
                        {node.lesson.title || 'Sem título'}
                      </span>
                      <span style={{
                        fontSize: 9, color: 'var(--color-text-2)',
                        display: 'block', textAlign: labelRight ? 'left' : 'right',
                      }}>
                        {activities.length} atividade{activities.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })()}

                {/* Expanded activity cards when selected */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: node.cy + NODE_R + 8,
                    left: Math.max(8, Math.min(node.cx - 100, PATH_W - 208)),
                    width: 200,
                    background: '#fff', borderRadius: 14,
                    border: '1.5px solid var(--color-border)',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    padding: 10, zIndex: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text)' }}>
                        {node.lesson.emoji} {node.lesson.title || 'Lição'}
                      </span>
                      <button onClick={() => setOverlay({ kind: 'lesson', unitIdx: node.unitIdx, lessonIdx: node.lessonIdx })}
                        style={{ background: 'none', border: 'none', fontSize: 12, cursor: 'pointer', color: unitColor, fontWeight: 700 }}>
                        <Pencil size={12} />
                      </button>
                    </div>

                    {activities.map((act, ai) => {
                      const gt = GAME_TYPES.find(g => g.id === act.gameType);
                      return (
                        <div key={act.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '5px 8px', borderRadius: 8,
                          background: 'var(--color-bg)', marginBottom: 4,
                          cursor: 'pointer',
                        }}
                          onClick={() => setOverlay({ kind: 'activity', unitIdx: node.unitIdx, lessonIdx: node.lessonIdx, actIdx: ai })}
                        >
                          <span style={{ fontSize: 14 }}>{gt ? <LucideIcon name={gt.icon} size={14} /> : <Gamepad2 size={14} />}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)' }}>{gt?.label ?? act.gameType}</div>
                            <div style={{ fontSize: 9, color: 'var(--color-text-2)' }}>
                              {act.gameType === 'matchgame'
                                ? act.matchGameId
                                  ? `${getMatchGames().find(g => g.id === act.matchGameId)?.title ?? act.matchGameId}`
                                  : 'Nenhum jogo selecionado'
                                : act.gameType === 'story'
                                  ? act.storyId
                                    ? `${getAllStories().find(s => s.id === act.storyId)?.title ?? act.storyId}`
                                    : 'Nenhuma história selecionada'
                                  : `${act.wordIds.length} palavras${act.rounds ? ` · ${act.rounds}r` : ''}`}
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeActivity(node.unitIdx, node.lessonIdx, ai); }}
                            style={{ background: 'none', border: 'none', color: '#E53935', fontSize: 12, cursor: 'pointer', fontWeight: 800 }}>×</button>
                        </div>
                      );
                    })}

                    <button onClick={() => addActivity(node.unitIdx, node.lessonIdx)} style={{
                      width: '100%', padding: '6px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: `${unitColor}12`, color: unitColor, border: `1.5px dashed ${unitColor}44`,
                      cursor: 'pointer', marginTop: 2,
                    }}>
                      + Atividade
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add-lesson buttons */}
          {items.filter((i): i is VAddLesson => i.kind === 'add-lesson').map((a, idx) => (
            <button key={`add-l-${idx}`}
              onClick={() => addLesson(a.unitIdx, a.afterLessonIdx)}
              style={{
                position: 'absolute',
                left: a.cx - 16, top: a.cy - 12,
                width: 32, height: 24, borderRadius: 12,
                background: 'rgba(108,92,231,0.12)', border: '1.5px dashed rgba(108,92,231,0.35)',
                color: '#6C5CE7', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Adicionar lição"
            >+</button>
          ))}

          {/* Add-unit button */}
          {items.filter((i): i is VAddUnit => i.kind === 'add-unit').map((a, idx) => (
            <div key={`add-u-${idx}`} style={{
              position: 'absolute', top: a.top, left: 8, right: 8,
              display: 'flex', justifyContent: 'center',
            }}>
              <button onClick={() => addUnit(a.afterUnitIdx)} className="ds-btn ds-btn-primary" style={{
                fontSize: 13,
              }}>
                + Nova Unidade
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unit Fields Editor — edit unit metadata (title, emoji, colors)
// ---------------------------------------------------------------------------

function UnitFieldsEditor({ unit, onSave, onCancel }: {
  unit: TrackUnit;
  onSave: (u: TrackUnit) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(unit.title);
  const [subtitle, setSubtitle] = useState(unit.subtitle);
  const [emojiVal, setEmojiVal] = useState(unit.emoji);
  const [color, setColor] = useState(unit.color);
  const [bg, setBg] = useState(unit.bg);

  function handleSave() {
    onSave({ ...unit, title: title.trim(), subtitle: subtitle.trim(), emoji: emojiVal, color, bg });
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}><ArrowLeft size={22} /></button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          {unit.title ? `Editar: ${unit.emoji} ${unit.title}` : 'Nova Unidade'}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Emoji</label>
          <input value={emojiVal} onChange={e => setEmojiVal(e.target.value)}
            className="ds-input" style={{ width: 60, textAlign: 'center', fontSize: 22, padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Primeiras Letras" className="ds-input" />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Subtítulo</label>
        <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
          placeholder="Ex: Reconhecimento de A a E" className="ds-input" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Cor</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            style={{ width: 40, height: 34, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
        </div>
        <div>
          <label style={labelStyle}>Fundo</label>
          <input type="color" value={bg} onChange={e => setBg(e.target.value)}
            style={{ width: 40, height: 34, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="ds-btn ds-btn-ghost" style={{
          flex: 1, padding: '13px', borderRadius: 999, fontSize: 14,
          border: '2px solid var(--color-border)',
        }}><ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Voltar</button>
        <button onClick={handleSave} className="ds-btn ds-btn-primary" style={{
          flex: 1, padding: '13px', fontSize: 14,
        }}><Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Salvar Unidade</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson Fields Editor — edit lesson title/emoji (lightweight)
// ---------------------------------------------------------------------------

function LessonFieldsEditor({ lesson, onSave, onCancel }: {
  lesson: TrackLesson;
  onSave: (l: TrackLesson) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [emojiVal, setEmojiVal] = useState(lesson.emoji);

  function handleSave() {
    onSave({ ...lesson, title: title.trim(), emoji: emojiVal });
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}><ArrowLeft size={22} /></button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          {lesson.title ? `Editar: ${lesson.emoji} ${lesson.title}` : 'Nova Lição'}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Emoji</label>
          <input value={emojiVal} onChange={e => setEmojiVal(e.target.value)}
            className="ds-input" style={{ width: 60, textAlign: 'center', fontSize: 22, padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Título da lição</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Letras A e B" className="ds-input" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="ds-btn ds-btn-ghost" style={{
          flex: 1, padding: '13px', borderRadius: 999, fontSize: 14,
          border: '2px solid var(--color-border)',
        }}><ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Voltar</button>
        <button onClick={handleSave} className="ds-btn ds-btn-primary" style={{
          flex: 1, padding: '13px', fontSize: 14,
        }}><Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Salvar Lição</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Editor — configure game type, word pool, rounds
// ---------------------------------------------------------------------------

function ActivityEditor({ activity, onSave, onCancel }: {
  activity: TrackActivity;
  onSave: (a: TrackActivity) => void;
  onCancel: () => void;
}) {
  const [gameType, setGameType] = useState<TrackGameType>(activity.gameType);
  const [wordIds, setWordIds] = useState<string[]>(activity.wordIds);
  const [rounds, setRounds] = useState(activity.rounds ?? 5);
  const [storyId, setStoryId] = useState(activity.storyId ?? '');
  const [matchGameId, setMatchGameId] = useState(activity.matchGameId ?? '');

  function handleSave() {
    onSave({
      ...activity, gameType, wordIds, rounds,
      storyId: gameType === 'story' ? storyId : undefined,
      matchGameId: gameType === 'matchgame' ? matchGameId : undefined,
    });
  }

  const needsWords = !['story', 'matchgame'].includes(gameType);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}><ArrowLeft size={22} /></button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          Configurar Atividade
        </h2>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tipo de jogo</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {GAME_TYPES.map(gt => (
            <button key={gt.id} onClick={() => setGameType(gt.id)}
              style={pillBtn(gameType === gt.id, '#6C5CE7')}>
              <LucideIcon name={gt.icon} size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {gt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Número de rodadas</label>
        <input type="number" min={1} max={20} value={rounds}
          onChange={e => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
          className="ds-input" style={{ width: 100 }} />
      </div>

      {gameType === 'story' && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>História</label>
          {(() => {
            const allStories = getAllStories();
            return (
              <div style={{
                maxHeight: 200, overflowY: 'auto',
                border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {allStories.map(s => {
                  const selected = storyId === s.id;
                  return (
                    <button key={s.id} onClick={() => setStoryId(s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 10, textAlign: 'left',
                      border: `2px solid ${selected ? '#6C5CE7' : 'var(--color-border)'}`,
                      background: selected ? '#6C5CE715' : 'var(--color-surface)',
                      cursor: 'pointer', outline: 'none', transition: 'all .1s',
                    }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: selected ? '#6C5CE7' : 'var(--color-text)' }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-2)' }}>
                          Nível {s.difficulty} · {s.sentences.length} frases
                        </div>
                      </div>
                      {selected && <span style={{ color: '#6C5CE7', fontWeight: 800 }}>✓</span>}
                    </button>
                  );
                })}
                {allStories.length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-3)', padding: 8 }}>
                    Nenhuma história disponível.
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {gameType === 'matchgame' && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Jogo de Ligar</label>
          {(() => {
            const allGames = getMatchGames();
            return (
              <>
                <div style={{
                  maxHeight: 200, overflowY: 'auto',
                  border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {allGames.map(g => {
                    const selected = matchGameId === g.id;
                    return (
                      <button key={g.id} onClick={() => setMatchGameId(g.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', borderRadius: 10, textAlign: 'left',
                        border: `2px solid ${selected ? '#6C5CE7' : 'var(--color-border)'}`,
                        background: selected ? '#6C5CE715' : 'var(--color-surface)',
                        cursor: 'pointer', outline: 'none', transition: 'all .1s',
                      }}>
                        <span style={{ fontSize: 20 }}>{g.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: selected ? '#6C5CE7' : 'var(--color-text)' }}>
                            {g.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-2)' }}>
                            {g.mode === 'connect' ? 'Ligar' : g.mode === 'count' ? 'Contar' : g.mode === 'type' ? 'Digitar' : 'Alfabeto'} · {g.pairs.length} pares · Nível {g.difficulty}
                          </div>
                        </div>
                        {selected && <span style={{ color: '#6C5CE7', fontWeight: 800 }}>✓</span>}
                      </button>
                    );
                  })}
                  {allGames.length === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-3)', padding: 8 }}>
                      Nenhum jogo de ligar disponível. Crie um no painel Admin → Ligar.
                    </span>
                  )}
                </div>
                {matchGameId && (
                  <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4 }}>
                    ID: {matchGameId}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {needsWords && (
        <div style={{ marginBottom: 16 }}>
          <WordPickerField value={wordIds} onChange={setWordIds} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="ds-btn ds-btn-ghost" style={{
          flex: 1, padding: '13px', borderRadius: 999, fontSize: 14,
          border: '2px solid var(--color-border)',
        }}><ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Voltar</button>
        <button onClick={handleSave} className="ds-btn ds-btn-primary" style={{
          flex: 1, padding: '13px', fontSize: 14,
        }}><Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Salvar Atividade</button>
      </div>
    </div>
  );
}
