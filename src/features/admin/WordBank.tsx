import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Download, Upload, Volume2, Plus, X, Check } from 'lucide-react';
import { words as builtinWords } from '../../shared/data/words';
import { getCustomWords } from '../../shared/data/customWords';
import { useWords, useSaveWord, useDeleteWord } from '../../shared/queries/words.queries';
import { WordCreateSchema, type WordCreate } from '../../shared/schemas/word.schema';
import { speak } from '../../shared/utils/audio';
import type { Word } from '../../shared/data/words';

const CSV_HEADERS = 'word,syllables,difficulty,category,emoji';

function exportCSV(list: Word[]) {
  const rows = list.map(w =>
    [w.word, w.syllables.join('-'), w.difficulty, w.category, w.emoji]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [CSV_HEADERS, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'silabrinca-palavras.csv'; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): Omit<Word, 'id'>[] {
  const lines = text.trim().split('\n').slice(1); // skip header
  return lines.map(line => {
    const cols = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g)
      ?.map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
    const [word = '', syllables = '', difficulty = '1', category = 'objeto', emoji = '📦'] = cols;
    return {
      word: word.trim(),
      syllables: syllables.split('-').map(s => s.trim()).filter(Boolean),
      difficulty: ([1, 2, 3].includes(Number(difficulty)) ? Number(difficulty) : 1) as 1 | 2 | 3,
      category: category.trim() || 'objeto',
      emoji: emoji.trim() || '📦',
    };
  }).filter(w => w.word.length > 0);
}

type DiffFilter = 0 | 1 | 2 | 3;

const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  animal: { label: 'Animais', emoji: '🐾' },
  comida: { label: 'Comida', emoji: '🍎' },
  objeto: { label: 'Objeto', emoji: '🧸' },
  natureza: { label: 'Natureza', emoji: '🌿' },
  lugar: { label: 'Lugar', emoji: '🏠' },
  pessoa: { label: 'Pessoa', emoji: '👤' },
  corpo: { label: 'Corpo', emoji: '🖐️' },
  roupa: { label: 'Roupa', emoji: '👕' },
  transporte: { label: 'Transporte', emoji: '🚗' },
  escola: { label: 'Escola', emoji: '📖' },
  cor: { label: 'Cor', emoji: '🎨' },
};

function getCategoryInfo(cat: string) {
  return CATEGORIES[cat] ?? { label: cat, emoji: '📦' };
}

// ── New Word Form (modal) ──────────────────────────────────────

interface NewWordFormProps {
  onClose: () => void;
}

function NewWordForm({ onClose }: NewWordFormProps) {
  const saveWord = useSaveWord();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WordCreate>({
    resolver: zodResolver(WordCreateSchema),
    defaultValues: { word: '', syllables: [], difficulty: 1, category: 'objeto', emoji: '📦' },
  });

  const difficulty = watch('difficulty');
  const [syllablesStr, setSyllablesStr] = useState('');

  function onSubmit(data: WordCreate) {
    const syllables = syllablesStr.split('-').map(s => s.trim()).filter(Boolean);
    const word: Word = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      ...data,
      syllables: syllables.length > 0 ? syllables : [data.word],
    };
    saveWord.mutate(word, { onSuccess: onClose });
  }

  const categoryOptions = Object.entries(CATEGORIES);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Nova Palavra</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#888" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Emoji + Word */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 68 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Emoji</label>
              <input
                {...register('emoji')}
                maxLength={4}
                style={{
                  width: '100%', padding: '8px 4px', borderRadius: 12, textAlign: 'center',
                  fontSize: 22, border: '2px solid #e5e7eb', outline: 'none',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Palavra *</label>
              <input
                {...register('word')}
                placeholder="Ex: borboleta"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 12,
                  border: `2px solid ${errors.word ? '#f44336' : '#e5e7eb'}`,
                  fontSize: 14, outline: 'none',
                }}
              />
              {errors.word && <span style={{ fontSize: 11, color: '#f44336' }}>{errors.word.message}</span>}
            </div>
          </div>

          {/* Syllables */}
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
              Sílabas (separadas por -)
            </label>
            <input
              value={syllablesStr}
              onChange={e => setSyllablesStr(e.target.value)}
              placeholder="Ex: bor-bo-le-ta"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 12,
                border: '2px solid #e5e7eb', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Nível</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([1, 2, 3] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue('difficulty', d)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontWeight: 700, fontSize: 13, border: 'none',
                    background: difficulty === d ? '#7B1FA2' : '#E1BEE7',
                    color: difficulty === d ? 'white' : '#4A148C',
                    cursor: 'pointer',
                  }}
                >
                  N{d}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6 }}>Categoria</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categoryOptions.map(([id, info]) => {
                const cat = watch('category');
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setValue('category', id)}
                    style={{
                      padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      border: `2px solid ${cat === id ? '#1565C0' : '#BBDEFB'}`,
                      background: cat === id ? '#1565C0' : '#EEF2FF',
                      color: cat === id ? 'white' : '#0D47A1',
                      cursor: 'pointer',
                    }}
                  >
                    {info.emoji} {info.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || saveWord.isPending}
            style={{
              width: '100%', padding: '12px', borderRadius: 14, border: 'none',
              background: '#7B1FA2', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer',
            }}
          >
            <Check size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Salvar Palavra
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────

export default function WordBank() {
  const [diffFilter, setDiffFilter] = useState<DiffFilter>(0);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: allWords = builtinWords as unknown as Word[] } = useWords();
  const deleteWord = useDeleteWord();
  const customWordIds = new Set(getCustomWords().map(w => w.id));

  const uniqueCategories = [...new Set(allWords.map(w => w.category))].sort();

  const filtered = allWords.filter(w => {
    if (diffFilter !== 0 && w.difficulty !== diffFilter) return false;
    if (catFilter && w.category !== catFilter) return false;
    if (search && !w.word.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Distribution by level
  const dist = [1, 2, 3].map(d => ({ level: d, count: allWords.filter(w => w.difficulty === d).length }));
  const maxDist = Math.max(...dist.map(d => d.count));

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        setImportMsg(`${parsed.length} palavras lidas do CSV.`);
      } catch {
        setImportMsg('Erro ao ler CSV. Verifique o formato.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  }

  return (
    <div className="p-4">
      {showNewForm && <NewWordForm onClose={() => setShowNewForm(false)} />}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BookOpen size={22} /> Banco de Palavras</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewForm(true)}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-xl font-bold text-xs flex items-center gap-1"
          >
            <Plus size={13} /> Nova
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            className="px-3 py-1.5 bg-green-100 text-green-800 rounded-xl font-bold text-xs flex items-center gap-1"
            title="Exportar palavras filtradas como CSV"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-xl font-bold text-xs flex items-center gap-1"
            title="Importar palavras de CSV"
          >
            <Upload size={14} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {importMsg && (
        <div className={`rounded-xl p-2 text-xs mb-3 ${importMsg.includes('lidas') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {importMsg}
        </div>
      )}

      {/* Distribution bar chart */}
      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Distribuição por nível</p>
        <div className="flex items-end gap-3 h-16">
          {dist.map(({ level, count }) => (
            <div key={level} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-600">{count}</span>
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${Math.round((count / maxDist) * 48)}px`,
                  backgroundColor: level === 1 ? '#4CAF50' : level === 2 ? '#FF9800' : '#F44336',
                }}
              />
              <span className="text-xs text-gray-500">N{level}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">{allWords.length} palavras total</p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar palavra..."
        className="w-full px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm mb-3"
      />

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {([0, 1, 2, 3] as const).map(d => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className="px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
            style={{ backgroundColor: diffFilter === d ? '#7B1FA2' : '#E1BEE7', color: diffFilter === d ? 'white' : '#4A148C' }}
          >
            {d === 0 ? 'Todos' : `Nível ${d}`}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setCatFilter('')}
          className="px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
          style={{ backgroundColor: catFilter === '' ? '#1565C0' : '#BBDEFB', color: catFilter === '' ? 'white' : '#0D47A1' }}
        >
          Todas
        </button>
        {uniqueCategories.map(cat => {
          const info = getCategoryInfo(cat);
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(catFilter === cat ? '' : cat)}
              className="px-3 py-1.5 rounded-xl font-bold text-xs transition-colors"
              style={{ backgroundColor: catFilter === cat ? '#1565C0' : '#BBDEFB', color: catFilter === cat ? 'white' : '#0D47A1' }}
            >
              {info.emoji} {info.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mb-3">{filtered.length} palavra{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map(word => {
          const isCustom = customWordIds.has(word.id);
          return (
            <div key={word.id} className="bg-white rounded-xl p-3 shadow flex items-center gap-2 relative">
              <button
                onClick={() => speak(word.word)}
                className="text-2xl flex-shrink-0 active:scale-90 transition-transform"
                title={`Ouvir: ${word.word}`}
                aria-label={`Ouvir ${word.word}`}
              >
                {word.emoji}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-gray-800 truncate">{word.word}</p>
                  <button onClick={() => speak(word.word)} className="text-gray-400 hover:text-purple-500 text-xs flex-shrink-0" aria-label="Ouvir"><Volume2 size={12} /></button>
                </div>
                <p className="text-xs text-gray-500">{word.syllables.join('-')} • N{word.difficulty}</p>
                <p className="text-xs text-gray-400">{getCategoryInfo(word.category).emoji} {getCategoryInfo(word.category).label}</p>
              </div>
              {isCustom && (
                <button
                  onClick={() => deleteWord.mutate(word.id)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: '#FFEBEE', border: 'none', borderRadius: 6, padding: 2, cursor: 'pointer',
                  }}
                  title="Excluir palavra"
                  aria-label="Excluir palavra"
                >
                  <X size={10} color="#E53935" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
