import { useState } from 'react';
import { Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getCustomPuzzles,
  saveCustomPuzzle,
  deleteCustomPuzzle,
} from '../../shared/data/customWordSearchPuzzles';
import { WORD_SEARCH_PUZZLES } from '../games/wordSearchPuzzles';
import type { WordSearchPuzzle, PuzzleWord } from '../games/wordSearchPuzzles';

const EMOJI_OPTIONS = [
  '🐾','🍎','✏️','🎨','🧍','🌍','🏠','🚗','🎵','🌸',
  '⚽','🎭','🍕','🦋','🌟','🐶','🐱','🐸','🦁','🐘',
];

function generateId() {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface WordEntry {
  word: string;
  emoji: string;
}

export default function WordSearchEditor() {
  const [customPuzzles, setCustomPuzzles] = useState<WordSearchPuzzle[]>(() => getCustomPuzzles());
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌟');
  const [wordEntries, setWordEntries] = useState<WordEntry[]>([
    { word: '', emoji: '⭐' },
    { word: '', emoji: '⭐' },
    { word: '', emoji: '⭐' },
    { word: '', emoji: '⭐' },
    { word: '', emoji: '⭐' },
    { word: '', emoji: '⭐' },
  ]);

  function refreshCustom() {
    setCustomPuzzles(getCustomPuzzles());
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setEmoji('🌟');
    setWordEntries(Array(6).fill(null).map(() => ({ word: '', emoji: '⭐' })));
  }

  function handleSave() {
    const validWords = wordEntries.filter(w => w.word.trim().length >= 2);
    if (!title.trim()) { alert('Adicione um título para o caça palavras.'); return; }
    if (validWords.length < 3) { alert('Adicione pelo menos 3 palavras válidas (mínimo 2 letras).'); return; }

    const puzzle: WordSearchPuzzle = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || `Encontre as palavras de ${title.trim()}!`,
      emoji,
      words: validWords.map(w => ({ word: w.word.trim().toLowerCase(), emoji: w.emoji })),
    };

    saveCustomPuzzle(puzzle);
    refreshCustom();
    setCreating(false);
    resetForm();
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir este caça palavras?')) return;
    deleteCustomPuzzle(id);
    refreshCustom();
  }

  function updateWordEntry(idx: number, field: keyof WordEntry, value: string) {
    setWordEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  }

  function addWordEntry() {
    setWordEntries(prev => [...prev, { word: '', emoji: '⭐' }]);
  }

  function removeWordEntry(idx: number) {
    setWordEntries(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Create form ──────────────────────────────────────────────────────────

  if (creating) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <button
            onClick={() => { setCreating(false); resetForm(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#555' }}
          >
            ← Voltar
          </button>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Novo Caça Palavras</h2>
        </div>

        {/* Emoji picker */}
        <div>
          <label style={labelStyle}>Ícone do puzzle</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  fontSize: 24,
                  width: 44, height: 44,
                  borderRadius: 10,
                  border: `2px solid ${emoji === e ? '#C62828' : '#ddd'}`,
                  background: emoji === e ? '#FFEBEE' : '#fff',
                  cursor: 'pointer',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Título *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Animais da Fazenda"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Enunciado (opcional)</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Encontre os animais da fazenda!"
            style={inputStyle}
          />
        </div>

        {/* Words */}
        <div>
          <label style={labelStyle}>Palavras (mínimo 3, máximo 10)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            {wordEntries.map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Emoji input */}
                <input
                  value={entry.emoji}
                  onChange={e => updateWordEntry(idx, 'emoji', e.target.value)}
                  style={{ ...inputStyle, width: 52, textAlign: 'center', fontSize: 20, padding: '6px 4px' }}
                  maxLength={4}
                />
                {/* Word input */}
                <input
                  value={entry.word}
                  onChange={e => updateWordEntry(idx, 'word', e.target.value.toLowerCase().replace(/[^a-záàãâéêíóôõúüç]/gi, ''))}
                  placeholder={`Palavra ${idx + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                  maxLength={15}
                />
                {wordEntries.length > 3 && (
                  <button
                    onClick={() => removeWordEntry(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {wordEntries.length < 10 && (
              <button
                onClick={addWordEntry}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px dashed #C62828', background: '#fff',
                  color: '#C62828', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                <Plus size={15} /> Adicionar palavra
              </button>
            )}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            padding: '14px 0', borderRadius: 12,
            background: 'linear-gradient(135deg, #C62828, #E57373)',
            color: '#fff', fontWeight: 700, fontSize: 16,
            border: 'none', cursor: 'pointer',
          }}
        >
          Salvar Caça Palavras
        </button>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={18} color="#C62828" /> Caça Palavras
        </h2>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: '#C62828', color: '#fff',
            fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={15} /> Novo
        </button>
      </div>

      {/* Built-in puzzles */}
      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Puzzles padrão ({WORD_SEARCH_PUZZLES.length})</p>
      {WORD_SEARCH_PUZZLES.map(p => (
        <PuzzleCard
          key={p.id}
          puzzle={p}
          expanded={expandedId === p.id}
          onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
        />
      ))}

      {/* Custom puzzles */}
      {customPuzzles.length > 0 && (
        <>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#888' }}>Puzzles criados por você ({customPuzzles.length})</p>
          {customPuzzles.map(p => (
            <PuzzleCard
              key={p.id}
              puzzle={p}
              expanded={expandedId === p.id}
              onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </>
      )}

      {customPuzzles.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#bbb', fontSize: 14,
          padding: '24px 0', border: '1.5px dashed #e0e0e0', borderRadius: 12,
        }}>
          Nenhum puzzle personalizado ainda.<br />Clique em <strong>Novo</strong> para criar!
        </div>
      )}
    </div>
  );
}

// ── PuzzleCard ────────────────────────────────────────────────────────────────

interface CardProps {
  puzzle: WordSearchPuzzle;
  expanded: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

function PuzzleCard({ puzzle, expanded, onToggle, onDelete }: CardProps) {
  return (
    <div style={{
      borderRadius: 12, border: '1.5px solid #e0e0e0',
      background: '#fff', overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 26 }}>{puzzle.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{puzzle.title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{puzzle.words.length} palavras</div>
        </div>
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', padding: 4 }}
          >
            <Trash2 size={16} />
          </button>
        )}
        {expanded ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 13, color: '#666', margin: '10px 0 8px' }}>{puzzle.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {puzzle.words.map((w: PuzzleWord) => (
              <span
                key={w.word}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 16,
                  background: '#FFEBEE', color: '#C62828',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {w.emoji} {w.word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1.5px solid #ddd',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#444',
  display: 'block',
  marginBottom: 4,
};
