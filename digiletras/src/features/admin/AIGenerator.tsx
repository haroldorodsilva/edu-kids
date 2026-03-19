import { useState } from 'react';
import { saveCustomStory } from '../../shared/data/customStories';
import { CreateStoryForm } from './StoryManager';
import type { Story } from '../../shared/data/stories';

type Step = 'form' | 'preview' | 'edit';

export default function AIGenerator() {
  const [theme, setTheme] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [saved, setSaved] = useState(false);

  async function generate() {
    if (!theme.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: theme.trim(), difficulty }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // as { error?: string } — JSON response shape is unknown at runtime; we assert the expected error format
        throw new Error((data as { error?: string }).error ?? `Erro ${res.status}`);
      }

      // as { title; emoji; sentences } — API response is untyped; we assert the expected shape from our backend contract
      const data = await res.json() as { title: string; emoji: string; sentences: string[] };
      setResult({
        id: `ai_${Date.now()}`,
        title: data.title,
        emoji: data.emoji,
        sentences: data.sentences,
        difficulty,
        theme: theme.trim(),
      });
      setStep('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar história. Verifique a configuração da API.');
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    if (!result) return;
    saveCustomStory(result);
    setSaved(true);
  }

  if (step === 'edit' && result) {
    return (
      <CreateStoryForm
        prefill={result}
        onCancel={() => setStep('preview')}
        onSave={(story) => { saveCustomStory(story); setSaved(true); setStep('preview'); setResult(story); }}
      />
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">🤖 Gerador IA</h2>
      <div className="bg-blue-50 rounded-2xl p-3 mb-4 text-sm text-blue-700">
        Gera histórias infantis em português usando IA. Configure <code className="bg-blue-100 px-1 rounded">AI_PROVIDER</code> e a chave no <code className="bg-blue-100 px-1 rounded">digiletras/.env</code>.<br/>
        <span className="text-xs text-blue-500">Local: rode <code className="bg-blue-100 px-1 rounded">node dev-server.mjs</code> na raiz do projeto.</span>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-gray-500">Tema da história</label>
          <input
            value={theme}
            onChange={e => setTheme(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Ex: animais do mar, festa junina, escola..."
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none mt-1"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Nível de dificuldade</label>
          <div className="flex gap-2 mt-1">
            {([1, 2, 3] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="flex-1 py-2 rounded-xl font-bold text-sm transition-colors"
                style={{ backgroundColor: difficulty === d ? '#7B1FA2' : '#E1BEE7', color: difficulty === d ? 'white' : '#4A148C' }}
              >
                {d === 1 ? 'Fácil' : d === 2 ? 'Médio' : 'Difícil'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !theme.trim()}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⏳</span> Gerando...</>
          ) : (
            '✨ Gerar História'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 rounded-xl p-3 text-red-600 text-sm mb-4">
          <p className="font-bold mb-1">Erro ao gerar</p>
          <p>{error}</p>
          <p className="text-xs mt-2 text-red-400">
            Verifique se o servidor local está rodando: <code>node dev-server.mjs</code> (raiz do projeto).
            Para produção, configure <code>AI_PROVIDER</code> + a chave no Vercel.
          </p>
        </div>
      )}

      {step === 'preview' && result && (
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{result.emoji}</span>
            <div>
              <h3 className="font-bold text-lg">{result.title}</h3>
              <p className="text-sm text-gray-500">Nível {result.difficulty} • {result.sentences.length} frases</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {result.sentences.map((s, i) => (
              <p key={i} className="text-gray-700 text-sm bg-gray-50 rounded-xl p-2">{i + 1}. {s}</p>
            ))}
          </div>

          {saved ? (
            <div className="text-center py-3">
              <p className="text-green-600 font-bold">✅ História adicionada!</p>
              <p className="text-xs text-gray-500 mt-1">Disponível em Histórias → Jogar Livre</p>
              <button
                onClick={() => { setStep('form'); setTheme(''); setResult(null); setSaved(false); }}
                className="mt-3 text-purple-600 font-bold text-sm"
              >
                Gerar outra
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setStep('edit')}
                className="flex-1 py-2 bg-gray-100 rounded-xl font-bold text-gray-700 text-sm"
              >
                ✏️ Editar
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-sm"
              >
                ✅ Aprovar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
