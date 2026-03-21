import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, BookOpen, Trash2, Check, Sparkles, Plus, X, Eye } from 'lucide-react';
import { stories } from '../../shared/data/stories';
import { useAllStories, useSaveStory, useDeleteStory } from '../../shared/queries/stories.queries';
import PreviewModal from '../../shared/components/admin/PreviewModal';
import type { Story } from '../../shared/data/stories';

type View = 'list' | 'detail' | 'create';

// ── Zod schema for create form ─────────────────────────────────

const CreateStorySchema = z.object({
  emoji: z.string().min(1),
  title: z.string().min(1, 'Digite o título.'),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  theme: z.string().optional(),
  sentences: z.array(z.object({ value: z.string() }))
    .min(1)
    .refine(
      arr => arr.some(s => s.value.trim().length > 0),
      { message: 'Adicione ao menos uma frase.' },
    ),
});

type CreateStoryForm = z.infer<typeof CreateStorySchema>;

export default function StoryManager() {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<Story | null>(null);

  const { data: allStories = [] } = useAllStories();
  const saveStory = useSaveStory();
  const deleteStory = useDeleteStory();

  const customIds = new Set(allStories.filter(s => !stories.some(b => b.id === s.id)).map(s => s.id));

  // --- Detail view ---
  if (view === 'detail' && selected) {
    const story = allStories.find(s => s.id === selected);
    const isCustom = customIds.has(selected);

    if (!story) { setView('list'); return null; }

    return (
      <div className="p-4">
        <button onClick={() => setView('list')} className="text-blue-600 font-bold mb-4 flex items-center gap-1"><ArrowLeft size={16} /> Voltar</button>
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
                onClick={() => {
                  deleteStory.mutate(story.id, { onSuccess: () => setView('list') });
                }}
                className="text-red-400 font-bold text-sm px-3 py-1 rounded-xl bg-red-50 flex items-center gap-1"
              >
                <Trash2 size={14} /> Excluir
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
            <p className="text-xs text-purple-500 mt-3 text-center"><Sparkles size={12} className="inline" /> História criada nesta sessão</p>
          )}
        </div>
      </div>
    );
  }

  // --- Create form view ---
  if (view === 'create') {
    return (
      <CreateStoryFormView
        onCancel={() => setView('list')}
        onSave={(story) => {
          saveStory.mutate(story, { onSuccess: () => setView('list') });
        }}
      />
    );
  }

  // --- List view ---
  return (
    <div className="p-4">
      {previewing && (
        <PreviewModal title={previewing.title} onClose={() => setPreviewing(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: 48 }}>{previewing.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--color-text)', marginBottom: 4 }}>{previewing.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
                Nível {previewing.difficulty}
                {previewing.theme ? ` · ${previewing.theme}` : ''}
                {` · ${previewing.sentences.length} frase${previewing.sentences.length !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {previewing.sentences.map((sentence, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: 12,
                background: i % 2 === 0 ? '#f8f6ff' : 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}>
                <span style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                  background: '#6C5CE7', color: '#fff',
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 15, color: 'var(--color-text)', lineHeight: 1.5, flex: 1 }}>{sentence}</span>
              </div>
            ))}
          </div>
        </PreviewModal>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><BookOpen size={22} /> Histórias</h2>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm"
        >
          + Nova
        </button>
      </div>
      <div className="space-y-3">
        {allStories.map(s => {
          const isCustom = customIds.has(s.id);
          return (
            <div
              key={s.id}
              className="w-full bg-white rounded-2xl p-4 shadow text-left flex items-center gap-3"
            >
              <span className="text-3xl" style={{ cursor: 'pointer' }} onClick={() => { setSelected(s.id); setView('detail'); }}>{s.emoji}</span>
              <div className="flex-1 min-w-0" style={{ cursor: 'pointer' }} onClick={() => { setSelected(s.id); setView('detail'); }}>
                <p className="font-bold text-gray-800 truncate">{s.title}</p>
                <p className="text-sm text-gray-500">{s.sentences.length} frases • N{s.difficulty}</p>
              </div>
              {isCustom && (
                <span className="text-xs bg-purple-100 text-purple-600 rounded-full px-2 py-0.5 flex items-center gap-1"><Sparkles size={10} /> Nova</span>
              )}
              <button
                onClick={() => setPreviewing(s)}
                style={{
                  background: '#E3F2FD', border: 'none', borderRadius: 8,
                  width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0984E3', flexShrink: 0,
                }}
                title="Pré-visualizar"
                aria-label="Pré-visualizar história"
              >
                <Eye size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Create Story Form (RHF + Zod) ─────────────────────────────

interface CreateProps {
  onCancel: () => void;
  onSave: (story: Story) => void;
  prefill?: Partial<Story>;
}

export function CreateStoryForm({ onCancel, onSave, prefill }: CreateProps) {
  return <CreateStoryFormView onCancel={onCancel} onSave={onSave} prefill={prefill} />;
}

function CreateStoryFormView({ onCancel, onSave, prefill }: CreateProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateStoryForm>({
    resolver: zodResolver(CreateStorySchema),
    defaultValues: {
      emoji: prefill?.emoji ?? '📖',
      title: prefill?.title ?? '',
      difficulty: prefill?.difficulty ?? 1,
      theme: prefill?.theme ?? '',
      sentences: prefill?.sentences?.map(s => ({ value: s })) ?? [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'sentences' });
  const difficulty = watch('difficulty');

  function onSubmit(data: CreateStoryForm) {
    const story: Story = {
      id: `custom_${Date.now()}`,
      title: data.title.trim(),
      emoji: data.emoji.trim() || '📖',
      difficulty: data.difficulty,
      theme: data.theme?.trim() || '',
      sentences: data.sentences.map(s => s.value.trim()).filter(Boolean),
    };
    onSave(story);
  }

  return (
    <div className="p-4">
      <button onClick={onCancel} className="text-blue-600 font-bold mb-4 flex items-center gap-1"><ArrowLeft size={16} /> Cancelar</button>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Nova História</h2>

      {/* Top-level errors */}
      {(errors.title || errors.sentences) && (
        <p className="text-red-500 text-sm mb-3">
          {errors.title?.message ?? errors.sentences?.message ?? errors.sentences?.root?.message}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <div className="w-16">
            <label className="text-xs text-gray-500">Emoji</label>
            <input
              {...register('emoji')}
              className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 text-center text-2xl"
              maxLength={4}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Título *</label>
            <input
              {...register('title')}
              placeholder="Ex: O coelho e a cenoura"
              className={`w-full px-3 py-2 rounded-xl border-2 outline-none text-sm ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'}`}
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
                  type="button"
                  onClick={() => setValue('difficulty', d)}
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
              {...register('theme')}
              placeholder="Ex: animal"
              className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Frases *</label>
          <div className="space-y-2 mt-1">
            {fields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-center">
                <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                <input
                  {...register(`sentences.${i}.value`)}
                  placeholder="Digite a frase..."
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm"
                />
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)} className="text-red-400 p-1">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => append({ value: '' })}
            className="mt-2 text-purple-600 font-bold text-sm flex items-center gap-1"
          >
            <Plus size={14} /> Adicionar frase
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-purple-600 text-white rounded-2xl font-bold"
        >
          <Check size={16} className="inline mr-1" /> Salvar História
        </button>
      </form>
    </div>
  );
}
