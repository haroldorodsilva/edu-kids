import { useState } from 'react';
import { stories } from '../../shared/data/stories';
import { getCustomStories, saveCustomStory, deleteCustomStory } from '../../shared/data/customStories';
import type { Story } from '../../shared/data/stories';

type View = 'list' | 'detail' | 'create';

export default function StoryManager() {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<string | null>(null);
  const [customStories, setCustomStories] = useState<Story[]>(() => getCustomStories());

  function refreshCustom() {
    setCustomStories(getCustomStories());
  }

  // --- Detail view ---
  if (view === 'detail' && selected) {
    const allStories = [...stories, ...customStories];
    const story = allStories.find(s => s.id === selected);
    const isCustom = customStories.some(s => s.id === selected);

    if (!story) { setView('list'); return null; }

    return (
      <div className="p-4">
        <button onClick={() => setView('list')} className="text-blue-600 font-bold mb-4">← Voltar</button>
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{story.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">{story.title}</h2>
                <p className="text-sm text-gray-500">Nível {story.difficulty} • {story.theme ?? '—'}</p>
              </div>
            </div>
            {isCustom && (
              <button
                onClick={() => { deleteCustomStory(story.id); refreshCustom(); setView('list'); }}
                className="text-red-400 font-bold text-sm px-3 py-1 rounded-xl bg-red-50"
              >
                🗑️ Excluir
              </button>
            )}
          </div>
          <div className="space-y-2 mt-3">
            {story.sentences.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">
                {i + 1}. {s}
              </div>
            ))}
          </div>
          {isCustom && (
            <p className="text-xs text-purple-500 mt-3 text-center">✨ História criada nesta sessão</p>
          )}
        </div>
      </div>
    );
  }

  // --- Create form view ---
  if (view === 'create') {
    return (
      <CreateStoryForm
        onCancel={() => setView('list')}
        onSave={(story) => { saveCustomStory(story); refreshCustom(); setView('list'); }}
      />
    );
  }

  // --- List view ---
  const allStories = [...stories, ...customStories];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">📖 Histórias</h2>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm"
        >
          + Nova
        </button>
      </div>
      <div className="space-y-3">
        {allStories.map(s => {
          const isCustom = customStories.some(c => c.id === s.id);
          return (
            <button
              key={s.id}
              onClick={() => { setSelected(s.id); setView('detail'); }}
              className="w-full bg-white rounded-2xl p-4 shadow text-left flex items-center gap-3 hover:bg-gray-50"
            >
              <span className="text-3xl">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{s.title}</p>
                <p className="text-sm text-gray-500">{s.sentences.length} frases • N{s.difficulty}</p>
              </div>
              {isCustom && (
                <span className="text-xs bg-purple-100 text-purple-600 rounded-full px-2 py-0.5">✨ Nova</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Create Story Form ----
interface CreateProps {
  onCancel: () => void;
  onSave: (story: Story) => void;
  prefill?: Partial<Story>;
}

export function CreateStoryForm({ onCancel, onSave, prefill }: CreateProps) {
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [emoji, setEmoji] = useState(prefill?.emoji ?? '📖');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(prefill?.difficulty ?? 1);
  const [theme, setTheme] = useState(prefill?.theme ?? '');
  const [sentences, setSentences] = useState<string[]>(prefill?.sentences ?? ['']);
  const [error, setError] = useState('');

  function addSentence() {
    setSentences(s => [...s, '']);
  }

  function removeSentence(i: number) {
    setSentences(s => s.filter((_, idx) => idx !== i));
  }

  function updateSentence(i: number, val: string) {
    setSentences(s => s.map((item, idx) => idx === i ? val : item));
  }

  function handleSave() {
    if (!title.trim()) { setError('Digite o título.'); return; }
    const valid = sentences.map(s => s.trim()).filter(Boolean);
    if (valid.length === 0) { setError('Adicione ao menos uma frase.'); return; }
    const story: Story = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      emoji: emoji.trim() || '📖',
      difficulty,
      theme: theme.trim() || undefined,
      sentences: valid,
    };
    onSave(story);
  }

  return (
    <div className="p-4">
      <button onClick={onCancel} className="text-blue-600 font-bold mb-4">← Cancelar</button>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Nova História</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <div className="w-16">
            <label className="text-xs text-gray-500">Emoji</label>
            <input
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 text-center text-2xl"
              maxLength={4}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Título *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: O coelho e a cenoura"
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Nível</label>
            <div className="flex gap-1 mt-1">
              {([1, 2, 3] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-2 rounded-xl font-bold text-sm transition-colors"
                  style={{ backgroundColor: difficulty === d ? '#7B1FA2' : '#E1BEE7', color: difficulty === d ? 'white' : '#4A148C' }}
                >
                  N{d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Tema (opcional)</label>
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Ex: animal"
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Frases *</label>
          <div className="space-y-2 mt-1">
            {sentences.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                <input
                  value={s}
                  onChange={e => updateSentence(i, e.target.value)}
                  placeholder="Digite a frase..."
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm"
                />
                {sentences.length > 1 && (
                  <button onClick={() => removeSentence(i)} className="text-red-400 font-bold text-lg w-8">×</button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addSentence}
            className="mt-2 text-purple-600 font-bold text-sm"
          >
            + Adicionar frase
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-purple-600 text-white rounded-2xl font-bold"
      >
        ✅ Salvar História
      </button>
    </div>
  );
}
