import { useState, useRef } from 'react';
import { BookOpen, Download, Upload, Volume2 } from 'lucide-react';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { speak } from '../../shared/utils/audio';

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
};

function getCategoryInfo(cat: string) {
  return CATEGORIES[cat] ?? { label: cat, emoji: '📦' };
}

export default function WordBank() {
  const [diffFilter, setDiffFilter] = useState<DiffFilter>(0);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const uniqueCategories = [...new Set(words.map(w => w.category))].sort();

  const filtered = words.filter(w => {
    if (diffFilter !== 0 && w.difficulty !== diffFilter) return false;
    if (catFilter && w.category !== catFilter) return false;
    if (search && !w.word.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Distribution by level
  const dist = [1, 2, 3].map(d => ({ level: d, count: words.filter(w => w.difficulty === d).length }));
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BookOpen size={22} /> Banco de Palavras</h2>
        <div className="flex gap-2">
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
        <p className="text-xs text-gray-400 mt-1 text-right">{words.length} palavras total</p>
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
        {filtered.map(word => (
          <div key={word.id} className="bg-white rounded-xl p-3 shadow flex items-center gap-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}
