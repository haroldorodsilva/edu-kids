import { useState, useCallback } from 'react';
import {
  getCustomTrails, saveCustomTrail, deleteCustomTrail,
  emptyTrail, type CustomTrail,
} from '../../shared/data/customTrails';
import {
  getCustomActivities, GAME_TYPE_LABELS,
  type CustomActivity,
} from '../../shared/data/customActivities';
import { AGE_GROUPS, type AgeGroup } from '../../shared/config/ageGroups';
import IconPicker, { RenderIcon, type IconPickerMode } from '../../shared/components/IconPicker';

// ── List View ───────────────────────────────────────────────

export default function TrailBuilder() {
  const [trails, setTrails] = useState(() => getCustomTrails());
  const [editing, setEditing] = useState<CustomTrail | null>(null);
  const [filterAge, setFilterAge] = useState<AgeGroup | ''>('');

  function refresh() { setTrails(getCustomTrails()); }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta trilha?')) return;
    deleteCustomTrail(id);
    refresh();
  }

  function handleSave(trail: CustomTrail) {
    saveCustomTrail(trail);
    refresh();
    setEditing(null);
  }

  if (editing) {
    return <TrailForm trail={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  const filtered = filterAge ? trails.filter(t => t.ageGroup === filterAge) : trails;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          🛤️ Trilhas
        </h2>
        <button
          onClick={() => setEditing(emptyTrail())}
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 700,
            background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          + Nova
        </button>
      </div>

      {/* Age filter */}
      <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        <button
          onClick={() => setFilterAge('')}
          style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: !filterAge ? 'var(--color-primary)' : 'var(--neutral-100)',
            color: !filterAge ? '#fff' : 'var(--color-text-2)',
            border: 'none', cursor: 'pointer',
          }}
        >
          Todas
        </button>
        {AGE_GROUPS.map(ag => (
          <button
            key={ag.id}
            onClick={() => setFilterAge(filterAge === ag.id ? '' : ag.id)}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
              background: filterAge === ag.id ? ag.color : 'var(--neutral-100)',
              color: filterAge === ag.id ? '#fff' : 'var(--color-text-2)',
              border: 'none', cursor: 'pointer',
            }}
          >
            {ag.emoji} {ag.label}
          </button>
        ))}
      </div>

      {/* Trail cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(trail => {
          const ageInfo = AGE_GROUPS.find(a => a.id === trail.ageGroup);
          return (
            <div key={trail.id} style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
                <RenderIcon value={trail.emoji} size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>
                  {trail.name || 'Sem nome'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                  {trail.activityIds.length} atividade{trail.activityIds.length !== 1 ? 's' : ''}
                  {trail.description && ` · ${trail.description}`}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                  {ageInfo && (
                    <span style={{
                      background: `${ageInfo.color}18`, color: ageInfo.color,
                      borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                    }}>
                      {ageInfo.emoji} {ageInfo.ageRange}
                    </span>
                  )}
                  <span style={{
                    background: trail.published ? '#E8F5E9' : '#FFF3E0',
                    color: trail.published ? '#388E3C' : '#E65100',
                    borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {trail.published ? '✅ Publicada' : '📝 Rascunho'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setEditing(trail)}
                  style={actionBtn('var(--neutral-100)', 'var(--color-primary)')}
                >✏️</button>
                <button
                  onClick={() => handleDelete(trail.id)}
                  style={actionBtn('#FFEBEE', '#E53935')}
                >🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-3)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛤️</div>
          <p style={{ fontSize: 14 }}>Nenhuma trilha ainda.</p>
          <p style={{ fontSize: 12 }}>Crie atividades primeiro, depois monte uma trilha.</p>
        </div>
      )}
    </div>
  );
}

function actionBtn(bg: string, color: string): React.CSSProperties {
  return {
    width: 38, height: 38, borderRadius: 12, background: bg, color,
    border: 'none', fontSize: 15, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', outline: 'none',
    fontWeight: 700,
  };
}

// ── Trail Form ──────────────────────────────────────────────

interface FormProps {
  trail: CustomTrail;
  onSave: (t: CustomTrail) => void;
  onCancel: () => void;
}

function TrailForm({ trail, onSave, onCancel }: FormProps) {
  const [name, setName]             = useState(trail.name);
  const [emoji, setEmoji]           = useState(trail.emoji);
  const [iconMode, setIconMode]     = useState<IconPickerMode>(trail.iconMode);
  const [description, setDescription] = useState(trail.description);
  const [ageGroup, setAgeGroup]     = useState<AgeGroup>(trail.ageGroup);
  const [activityIds, setActivityIds] = useState<string[]>(trail.activityIds);
  const [published, setPublished]   = useState(trail.published);
  const [error, setError]           = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const allActivities = getCustomActivities();

  // Activities that match the trail's age group
  const availableActivities = allActivities.filter(a => a.ageGroup === ageGroup);

  // Activities already in the trail (in order)
  const trailActivities = activityIds
    .map(id => allActivities.find(a => a.id === id))
    .filter((a): a is CustomActivity => !!a);

  const addActivity = useCallback((id: string) => {
    setActivityIds(prev => [...prev, id]);
  }, []);

  const removeActivity = useCallback((index: number) => {
    setActivityIds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setActivityIds(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setActivityIds(prev => {
      if (index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }, []);

  function handleSave() {
    if (!name.trim()) { setError('Informe o nome da trilha'); return; }
    if (activityIds.length === 0) { setError('Adicione pelo menos uma atividade'); return; }
    onSave({
      ...trail,
      name: name.trim(),
      emoji,
      iconMode,
      description: description.trim(),
      ageGroup,
      activityIds,
      published,
      updatedAt: Date.now(),
    });
  }

  return (
    <div style={{ padding: 16, overflowY: 'auto', maxHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          {trail.name ? 'Editar Trilha' : 'Nova Trilha'}
        </h2>
      </div>

      {/* Icon + Name */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setShowIconPicker(true)}
          style={{
            width: 64, height: 64, borderRadius: 16,
            border: '2px solid var(--color-border)',
            background: 'var(--neutral-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 28, flexShrink: 0,
          }}
          title="Escolher ícone"
        >
          <RenderIcon value={emoji} size={28} />
        </button>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nome da trilha *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Descobrindo Animais"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Descrição (opcional)</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Breve descrição da trilha"
          style={inputStyle}
        />
      </div>

      {/* Age group */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Faixa etária</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {AGE_GROUPS.map(ag => (
            <button
              key={ag.id}
              onClick={() => { setAgeGroup(ag.id); setActivityIds([]); }}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 14,
                border: `2.5px solid ${ageGroup === ag.id ? ag.color : 'var(--color-border)'}`,
                background: ageGroup === ag.id ? `${ag.color}15` : 'var(--color-surface)',
                color: ageGroup === ag.id ? ag.color : 'var(--color-text-2)',
                fontWeight: 700, fontSize: 11, cursor: 'pointer', outline: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 18 }}>{ag.emoji}</span>
              {ag.ageRange}
            </button>
          ))}
        </div>
      </div>

      {/* Published toggle */}
      <div style={{
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 14, background: 'var(--neutral-50)',
        border: '1.5px solid var(--color-border)',
      }}>
        <button
          onClick={() => setPublished(!published)}
          style={{
            width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: published ? 'var(--feedback-ok)' : 'var(--neutral-200)',
            position: 'relative', transition: 'background .2s',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: published ? 23 : 3,
            transition: 'left .2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
            {published ? '✅ Publicada' : '📝 Rascunho'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
            {published ? 'Visível para alunos' : 'Não visível para alunos'}
          </div>
        </div>
      </div>

      {/* ── Trail sequence ─────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Sequência de atividades ({activityIds.length})</label>

        {/* Current trail activities */}
        {trailActivities.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {trailActivities.map((act, idx) => {
              const gameInfo = GAME_TYPE_LABELS[act.gameType];
              return (
                <div key={`${act.id}-${idx}`} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 14,
                  background: 'var(--color-surface)',
                  border: '1.5px solid var(--color-border)',
                }}>
                  {/* Order number */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--color-primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>

                  <RenderIcon value={act.emoji} size={22} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>
                      {act.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>
                      {gameInfo.emoji} {gameInfo.label}
                    </div>
                  </div>

                  {/* Move buttons */}
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    style={{ ...smallBtn, opacity: idx === 0 ? 0.3 : 1 }}
                  >↑</button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === trailActivities.length - 1}
                    style={{ ...smallBtn, opacity: idx === trailActivities.length - 1 ? 0.3 : 1 }}
                  >↓</button>
                  <button
                    onClick={() => removeActivity(idx)}
                    style={{ ...smallBtn, background: '#FFEBEE', color: '#E53935' }}
                  >✕</button>
                </div>
              );
            })}
          </div>
        )}

        {trailActivities.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '20px 16px', marginTop: 8,
            borderRadius: 14, border: '2px dashed var(--color-border)',
            color: 'var(--color-text-3)',
          }}>
            <p style={{ fontSize: 13 }}>Nenhuma atividade na trilha.</p>
            <p style={{ fontSize: 12 }}>Adicione atividades abaixo.</p>
          </div>
        )}
      </div>

      {/* ── Available activities to add ────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Atividades disponíveis ({availableActivities.length})</label>
        {availableActivities.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 8 }}>
            Nenhuma atividade para esta faixa etária. Crie atividades na aba "Atividades" primeiro.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {availableActivities.map(act => {
              const gameInfo = GAME_TYPE_LABELS[act.gameType];
              const count = activityIds.filter(id => id === act.id).length;
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 14,
                  background: 'var(--neutral-50)',
                  border: '1.5px solid var(--color-border)',
                }}>
                  <RenderIcon value={act.emoji} size={22} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>
                      {act.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>
                      {gameInfo.emoji} {gameInfo.label} · N{act.difficulty}
                    </div>
                  </div>
                  {count > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--color-primary)',
                      background: 'var(--color-primary)' + '15',
                      padding: '2px 8px', borderRadius: 999,
                    }}>
                      ×{count}
                    </span>
                  )}
                  <button
                    onClick={() => addActivity(act.id)}
                    style={{
                      padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                      background: 'var(--color-primary)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          color: 'var(--feedback-error-dark)', fontSize: 13, marginBottom: 12,
          padding: '10px 14px', background: 'var(--feedback-error-light)', borderRadius: 12,
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '14px', borderRadius: 999, fontWeight: 700, fontSize: 15,
          background: 'var(--neutral-100)', color: 'var(--color-text-2)', border: 'none', cursor: 'pointer',
        }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{
          flex: 1, padding: '14px', borderRadius: 999, fontWeight: 700, fontSize: 15,
          background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          💾 Salvar
        </button>
      </div>

      {/* Icon picker modal */}
      {showIconPicker && (
        <IconPicker
          value={emoji}
          mode={iconMode}
          onSelect={(val, mode) => {
            setEmoji(val);
            setIconMode(mode);
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
}

// ── Shared styles ───────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)',
  fontSize: 15, color: 'var(--color-text)', outline: 'none',
  background: 'var(--color-surface)', fontFamily: 'var(--font-family)',
  boxSizing: 'border-box' as const,
};

const smallBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8,
  background: 'var(--neutral-100)', color: 'var(--color-text-2)',
  border: 'none', fontSize: 13, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, flexShrink: 0,
};
