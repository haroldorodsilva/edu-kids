import { useState } from 'react';
import { Link, Pencil, Trash2, Copy, Save, ArrowLeft } from 'lucide-react';
import {
  getMatchGames, saveMatchGame, deleteMatchGame, isBuiltinGame,
  type MatchGame, type MatchPair, type MatchMode,
} from '../../shared/data/matchGames';

function newId()     { return `mg_${Date.now()}`; }
function newPairId() { return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

function emptyGame(): MatchGame {
  return {
    id: newId(), title: '', emoji: '🔗',
    description: '', instructions: '',
    mode: 'connect',
    difficulty: 1,
    pairs: [
      { id: newPairId(), left: '', right: '' },
      { id: newPairId(), left: '', right: '' },
    ],
  };
}

// ─── List view ────────────────────────────────────────────────
export default function MatchGameEditor() {
  const [games,    setGames]    = useState(() => getMatchGames());
  const [editing,  setEditing]  = useState<MatchGame | null>(null);

  function refresh() { setGames(getMatchGames()); }

  function handleDelete(id: string) {
    if (!confirm('Excluir este jogo?')) return;
    deleteMatchGame(id);
    refresh();
  }

  function handleSave(game: MatchGame) {
    saveMatchGame(game);
    refresh();
    setEditing(null);
  }

  if (editing) {
    return <GameForm game={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link size={20} /> Jogos de Ligar / Digitar
        </h2>
        <button
          onClick={() => setEditing(emptyGame())}
          style={{
            padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          + Novo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {games.map(game => (
          <div key={game.id} style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-border)', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: 'var(--shadow-card)',
          }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>{game.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text)' }}>{game.title || 'Sem nome'}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {game.description}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                <span style={{
                  background: game.mode === 'connect' ? '#6C5CE722' : game.mode === 'count' ? '#0984E322' : '#00B89422',
                  color:      game.mode === 'connect' ? '#6C5CE7'   : game.mode === 'count' ? '#0984E3'   : '#00B894',
                  borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                }}>
                  {game.mode === 'connect' ? 'Ligar' : game.mode === 'count' ? 'Contar' : 'Digitar'}
                </span>
                <span style={{
                  background: 'var(--color-bg)', color: 'var(--color-text-2)',
                  borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 600,
                }}>
                  {game.pairs.length} par{game.pairs.length !== 1 ? 'es' : ''}
                </span>
                {isBuiltinGame(game.id) && (
                  <span style={{
                    background: '#FFF3E0', color: '#E65100',
                    borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                  }}>
                    padrão
                  </span>
                )}
              </div>
            </div>

            {!isBuiltinGame(game.id) && (
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setEditing(game)}
                  style={actionBtn('#EDE7F6', '#6C5CE7')}
                ><Pencil size={16} /></button>
                <button
                  onClick={() => handleDelete(game.id)}
                  style={actionBtn('#FFEBEE', '#E53935')}
                ><Trash2 size={16} /></button>
              </div>
            )}
            {isBuiltinGame(game.id) && (
              <button
                onClick={() => setEditing({ ...game, id: newId() })}
                style={actionBtn('#E8F5E9', '#00B894')}
                title="Duplicar e editar"
              ><Copy size={16} /></button>
            )}
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-3)' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}><Link size={48} color="var(--color-text-3)" /></div>
          <p>Nenhum jogo ainda. Crie o primeiro!</p>
        </div>
      )}
    </div>
  );
}

function actionBtn(bg: string, color: string): React.CSSProperties {
  return {
    width: 34, height: 34, borderRadius: 10, background: bg, color,
    border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', outline: 'none',
    fontWeight: 700,
  };
}

// ─── Game form ────────────────────────────────────────────────
function GameForm({ game, onSave, onCancel }: {
  game: MatchGame;
  onSave: (g: MatchGame) => void;
  onCancel: () => void;
}) {
  const [title,        setTitle]        = useState(game.title);
  const [emoji,        setEmoji]        = useState(game.emoji);
  const [description,  setDescription]  = useState(game.description);
  const [instructions, setInstructions] = useState(game.instructions);
  const [mode,         setMode]         = useState<MatchMode>(game.mode);
  const [pairs,        setPairs]        = useState<MatchPair[]>(game.pairs);
  const [error,        setError]        = useState('');

  function addPair() {
    setPairs(prev => [...prev, { id: newPairId(), left: '', right: '' }]);
  }

  function updatePair(id: string, field: 'left' | 'right', value: string) {
    setPairs(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function removePair(id: string) {
    if (pairs.length <= 2) { setError('Mínimo de 2 pares'); return; }
    setPairs(prev => prev.filter(p => p.id !== id));
  }

  function handleSave() {
    if (!title.trim()) { setError('Informe o nome do jogo'); return; }
    if (pairs.some(p => !p.left.trim() || !p.right.trim())) {
      setError('Preencha todos os pares (esquerda e direita)'); return;
    }
    if (pairs.length < 2) { setError('Adicione pelo menos 2 pares'); return; }
    onSave({ id: game.id, title: title.trim(), emoji, description: description.trim(), instructions: instructions.trim(), mode, difficulty: game.difficulty, pairs });
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, display: 'block',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    fontSize: 14, color: 'var(--color-text)', outline: 'none',
    background: 'var(--color-surface)', fontFamily: 'var(--font-family)',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 0, maxHeight: '100vh', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-primary)' }}><ArrowLeft size={22} /></button>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
          {game.title ? 'Editar Jogo' : 'Novo Jogo'}
        </h2>
      </div>

      {/* Identity */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Emoji</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)}
            style={{ ...inputStyle, width: 60, textAlign: 'center', fontSize: 22, padding: '8px' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nome do jogo</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Animais e Sons"
            style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Descrição (admin)</label>
        <input value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Explicação curta do jogo"
          style={inputStyle} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Instruções (mostrado para a criança)</label>
        <input value={instructions} onChange={e => setInstructions(e.target.value)}
          placeholder="Ex: Clique no animal e depois no som correto"
          style={inputStyle} />
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Tipo de jogo</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {([
              { id: 'connect', label: 'Ligar colunas' },
              { id: 'type',    label: 'Digitar resposta' },
              { id: 'count',   label: 'Contar' },
            // as { id: MatchMode; ... }[] — literal array needs assertion so `id` is typed as MatchMode union, not string
            ] as { id: MatchMode; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              flex: 1, padding: '10px 4px',
              borderRadius: 'var(--radius-md)',
              border: `2.5px solid ${mode === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: mode === t.id ? '#6C5CE715' : 'var(--color-surface)',
              color: mode === t.id ? 'var(--color-primary)' : 'var(--color-text-2)',
              fontWeight: 700, fontSize: 12, cursor: 'pointer', outline: 'none',
              transition: 'all .15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 6 }}>
          {mode === 'connect'
            ? 'A criança clica na coluna esquerda e liga à resposta certa na coluna direita.'
            : mode === 'type'
            ? 'A criança digita a resposta correta para cada item da coluna esquerda.'
            : 'A criança conta os objetos mostrados e digita o número.'}
        </p>
      </div>

      {/* Pairs */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label style={{ ...labelStyle, margin: 0 }}>Pares ({pairs.length})</label>
          <button onClick={addPair} style={{
            padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            + Par
          </button>
        </div>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: 8, marginBottom: 6 }}>
          <span style={{ ...labelStyle, margin: 0 }}>⬅ Esquerda</span>
          <span style={{ ...labelStyle, margin: 0 }}>➡ Direita (resposta)</span>
          <span />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pairs.map((pair, i) => (
            <div key={pair.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: 8, alignItems: 'center' }}>
              <input
                value={pair.left}
                onChange={e => updatePair(pair.id, 'left', e.target.value)}
                placeholder={`Item ${i + 1}`}
                style={{ ...inputStyle, padding: '8px 10px' }}
              />
              <input
                value={pair.right}
                onChange={e => updatePair(pair.id, 'right', e.target.value)}
                placeholder="Resposta"
                style={{ ...inputStyle, padding: '8px 10px' }}
              />
              <button onClick={() => removePair(pair.id)} style={{
                width: 32, height: 32, borderRadius: 8, background: '#FFEBEE',
                color: '#E53935', border: 'none', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none',
              }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: '#E53935', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: '#FFEBEE', borderRadius: 10 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '13px', borderRadius: 999, fontWeight: 700, fontSize: 14,
          background: 'var(--color-bg)', color: 'var(--color-text-2)', border: '2px solid var(--color-border)', cursor: 'pointer',
        }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{
          flex: 1, padding: '13px', borderRadius: 999, fontWeight: 700, fontSize: 14,
          background: 'var(--gradient-primary)', color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          <Save size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Salvar
        </button>
      </div>
    </div>
  );
}
