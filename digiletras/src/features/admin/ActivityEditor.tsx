import { useState } from 'react';
import {
  getCustomActivities, saveCustomActivity, deleteCustomActivity,
  emptyActivity, GAME_TYPE_LABELS,
  type CustomActivity, type CustomGameType,
} from '../../shared/data/customActivities';
import { AGE_GROUPS, type AgeGroup } from '../../shared/config/ageGroups';
import { words } from '../../shared/data/words';
import IconPicker, { RenderIcon, type IconPickerMode } from '../../shared/components/IconPicker';

// ── Category helpers ────────────────────────────────────────

const CATEGORIES: Record<string, string> = {
  animal: '🐾 Animais',
  comida: '🍎 Comida',
  objeto: '🧸 Objetos',
  natureza: '🌿 Natureza',
  lugar: '🏠 Lugares',
  pessoa: '👤 Pessoas',
  corpo: '🖐️ Corpo',
  roupa: '👕 Roupas',
  transporte: '🚗 Transporte',
  cor: '🎨 Cores',
  escola: '📚 Escola',
};

const uniqueCategories = [...new Set(words.map(w => w.category))].sort();

// ── List View ───────────────────────────────────────────────

export default function ActivityEditor() {
  const [activities, setActivities] = useState(() => getCustomActivities());
  const [editing, setEditing] = useState<CustomActivity | null>(null);
  const [filterAge, setFilterAge] = useState<AgeGroup | ''>('');

  function refresh() { setActivities(getCustomActivities()); }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta atividade?')) return;
    deleteCustomActivity(id);
    refresh();
  }

  function handleSave(act: CustomActivity) {
    saveCustomActivity(act);
    refresh();
    setEditing(null);
  }

  if (editing) {
    return <ActivityForm activity={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  const filtered = filterAge ? activities.filter(a => a.ageGroup === filterAge) : activities;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
          📋 Atividades
        </h2>
        <button
          onClick={() => setEditing(emptyActivity())}
          style={{
            padding: '10px 18px', borderRadius: 'var(--radius-full)', fontSize: 14, fontWeight: 700,
            background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          + Nova
        </button>
      </div>

      {/* Age filter pills */}
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

      {/* Activity list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(act => {
          const gameInfo = GAME_TYPE_LABELS[act.gameType];
          const ageInfo = AGE_GROUPS.find(a => a.id === act.ageGroup);
          return (
            <div key={act.id} style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>
                <RenderIcon value={act.emoji} size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>
                  {act.name || 'Sem nome'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                  {gameInfo.emoji} {gameInfo.label} · N{act.difficulty}
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
                  {act.config.rounds > 0 && (
                    <span style={{
                      background: 'var(--neutral-100)', color: 'var(--color-text-2)',
                      borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>
                      {act.config.rounds} rodadas
                    </span>
                  )}
                  {act.config.wordCategories.length > 0 && (
                    <span style={{
                      background: 'var(--neutral-100)', color: 'var(--color-text-2)',
                      borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>
                      {act.config.wordCategories.length} cat.
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setEditing(act)}
                  style={actionBtn('var(--neutral-100)', 'var(--color-primary)')}
                >✏️</button>
                <button
                  onClick={() => handleDelete(act.id)}
                  style={actionBtn('#FFEBEE', '#E53935')}
                >🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-3)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <p style={{ fontSize: 14 }}>Nenhuma atividade ainda.</p>
          <p style={{ fontSize: 12 }}>Crie atividades para montar trilhas de aprendizagem.</p>
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

// ── Activity Form ───────────────────────────────────────────

interface FormProps {
  activity: CustomActivity;
  onSave: (a: CustomActivity) => void;
  onCancel: () => void;
}

function ActivityForm({ activity, onSave, onCancel }: FormProps) {
  const [name, setName]         = useState(activity.name);
  const [emoji, setEmoji]       = useState(activity.emoji);
  const [iconMode, setIconMode] = useState<IconPickerMode>(activity.iconMode);
  const [gameType, setGameType] = useState<CustomGameType>(activity.gameType);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(activity.ageGroup);
  const [difficulty, setDifficulty] = useState(activity.difficulty);
  const [rounds, setRounds]     = useState(activity.config.rounds);
  const [wordCategories, setWordCategories] = useState<string[]>(activity.config.wordCategories);
  const [error, setError]       = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  function toggleCategory(cat: string) {
    setWordCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  function handleSave() {
    if (!name.trim()) { setError('Informe o nome da atividade'); return; }
    onSave({
      ...activity,
      name: name.trim(),
      emoji,
      iconMode,
      gameType,
      ageGroup,
      difficulty,
      config: {
        ...activity.config,
        wordCategories,
        rounds,
      },
      updatedAt: Date.now(),
    });
  }

  const gameTypes = Object.entries(GAME_TYPE_LABELS) as [CustomGameType, { label: string; emoji: string }][];

  return (
    <div style={{ padding: 16, overflowY: 'auto', maxHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          {activity.name ? 'Editar Atividade' : 'Nova Atividade'}
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
          <label style={labelStyle}>Nome da atividade *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Sílabas dos Animais"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Game type */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tipo de jogo</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
          {gameTypes.map(([id, info]) => (
            <button
              key={id}
              onClick={() => setGameType(id)}
              style={{
                padding: '12px 6px', borderRadius: 14,
                border: `2.5px solid ${gameType === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: gameType === id ? 'var(--color-primary)' + '12' : 'var(--color-surface)',
                color: gameType === id ? 'var(--color-primary)' : 'var(--color-text-2)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', outline: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all .12s',
              }}
            >
              <span style={{ fontSize: 22 }}>{info.emoji}</span>
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age group */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Faixa etária</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {AGE_GROUPS.map(ag => (
            <button
              key={ag.id}
              onClick={() => setAgeGroup(ag.id)}
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

      {/* Difficulty */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Nível de dificuldade</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {([1, 2, 3] as const).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                flex: 1, padding: '12px', borderRadius: 14, fontWeight: 700, fontSize: 14,
                border: `2.5px solid ${difficulty === d ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: difficulty === d ? 'var(--color-primary)' : 'var(--color-surface)',
                color: difficulty === d ? '#fff' : 'var(--color-text-2)',
                cursor: 'pointer', outline: 'none',
              }}
            >
              {d === 1 ? '⭐ Fácil' : d === 2 ? '⭐⭐ Médio' : '⭐⭐⭐ Difícil'}
            </button>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Número de rodadas (0 = padrão do jogo)</label>
        <input
          type="number"
          min={0}
          max={50}
          value={rounds}
          onChange={e => setRounds(Math.max(0, parseInt(e.target.value) || 0))}
          style={{ ...inputStyle, width: 120 }}
        />
      </div>

      {/* Word categories filter (for word-based games) */}
      {!['matchgame', 'coloring', 'story'].includes(gameType) && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Categorias de palavras (vazio = todas)</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {uniqueCategories.map(cat => {
              const active = wordCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  style={{
                    padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: active ? '#fff' : 'var(--color-text-2)',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {CATEGORIES[cat] ?? cat}
                </button>
              );
            })}
          </div>
          {wordCategories.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 6 }}>
              {words.filter(w => wordCategories.includes(w.category) && w.difficulty <= difficulty).length} palavras disponíveis
            </p>
          )}
        </div>
      )}

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
