import { useState, useMemo } from 'react';
import { Check, Trash2, Search } from 'lucide-react';
import { getAllWords } from '../../data/customWords';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WordPickerFieldProps {
  /** Currently selected word IDs */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Accent color for selected state. Defaults to #6C5CE7 */
  accentColor?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTIES = [
  { value: 1, label: 'N1' },
  { value: 2, label: 'N2' },
  { value: 3, label: 'N3' },
];

function pillStyle(active: boolean, color: string): React.CSSProperties {
  return {
    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
    border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
    background: active ? `${color}18` : 'var(--color-surface)',
    color: active ? color : 'var(--color-text-2)',
    cursor: 'pointer', outline: 'none', transition: 'all .12s',
    whiteSpace: 'nowrap' as const,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WordPickerField({ value, onChange, accentColor = '#6C5CE7' }: WordPickerFieldProps) {
  const allWords = useMemo(() => getAllWords(), []);
  const categories = useMemo(() => [...new Set(allWords.map(w => w.category))].sort(), [allWords]);

  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allWords.filter(w => {
      if (diffFilter !== null && w.difficulty !== diffFilter) return false;
      if (catFilter !== null && w.category !== catFilter) return false;
      if (q && !w.word.toLowerCase().includes(q) && !w.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allWords, diffFilter, catFilter, search]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  }
  function selectAllFiltered() {
    const ids = filteredWords.map(w => w.id);
    onChange([...new Set([...value, ...ids])]);
  }
  function clearAll() { onChange([]); }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pool de palavras
        </span>
        <span style={{
          fontSize: 11, fontWeight: 800,
          background: `${accentColor}18`, color: accentColor,
          borderRadius: 999, padding: '2px 8px',
        }}>
          {value.length} selecionada{value.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={13} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-text-2)',
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar palavras..."
          style={{
            width: '100%', padding: '7px 10px 7px 30px',
            borderRadius: 10, border: '1.5px solid var(--color-border)',
            background: 'var(--color-bg)', color: 'var(--color-text)',
            fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Difficulty */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setDiffFilter(null)} style={pillStyle(diffFilter === null, accentColor)}>Todas</button>
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setDiffFilter(d.value)} style={pillStyle(diffFilter === d.value, accentColor)}>
              {d.label}
            </button>
          ))}
        </div>
        {/* Divider */}
        <div style={{ width: 1, background: 'var(--color-border)', height: 20, alignSelf: 'center' }} />
        {/* Category */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={() => setCatFilter(null)} style={pillStyle(catFilter === null, '#0984E3')}>Todas</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={pillStyle(catFilter === c, '#0984E3')}>{c}</button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={selectAllFiltered} style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: '#E8F5E9', color: '#00B894', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          <Check size={11} /> Sel. filtradas ({filteredWords.length})
        </button>
        <button onClick={clearAll} style={{
          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
          background: '#FFEBEE', color: '#E53935', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          <Trash2 size={11} /> Limpar
        </button>
      </div>

      {/* Word grid */}
      <div style={{
        maxHeight: 220, overflowY: 'auto',
        border: '1.5px solid var(--color-border)',
        borderRadius: 10, padding: 8,
        display: 'flex', flexWrap: 'wrap', gap: 6,
        background: 'var(--color-bg)',
      }}>
        {filteredWords.map(w => {
          const selected = value.includes(w.id);
          return (
            <button
              key={w.id}
              onClick={() => toggle(w.id)}
              style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                border: `2px solid ${selected ? accentColor : 'var(--color-border)'}`,
                background: selected ? `${accentColor}15` : 'var(--color-surface)',
                color: selected ? accentColor : 'var(--color-text-2)',
                cursor: 'pointer', outline: 'none', transition: 'all .1s',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
              title={`${w.category} · Nível ${w.difficulty}`}
            >
              {w.emoji} {w.word}
              {selected && <Check size={10} strokeWidth={3} />}
            </button>
          );
        })}
        {filteredWords.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--color-text-2)', padding: 8 }}>
            Nenhuma palavra encontrada.
          </span>
        )}
      </div>
    </div>
  );
}
