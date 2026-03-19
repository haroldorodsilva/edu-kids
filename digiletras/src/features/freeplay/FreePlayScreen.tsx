import { useState } from 'react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { DIFFICULTY_LEVELS, type DifficultyLevel, getDifficulty } from '../../shared/config/difficultyLevels';
import type { GameType } from '../../shared/progression/types';

interface Props {
  onSelect: (game: string, wordPool?: Word[], rounds?: number) => void;
  onBack: () => void;
  onAdmin: () => void;
}

const CATEGORY_FILTERS = [
  { id: '',           label: 'Todos',      emoji: '🎯' },
  { id: 'animal',     label: 'Animais',    emoji: '🐾' },
  { id: 'comida',     label: 'Comida',     emoji: '🍎' },
  { id: 'objeto',     label: 'Objetos',    emoji: '🧸' },
  { id: 'natureza',   label: 'Natureza',   emoji: '🌿' },
  { id: 'lugar',      label: 'Lugares',    emoji: '🏠' },
  { id: 'pessoa',     label: 'Pessoas',    emoji: '👤' },
  { id: 'corpo',      label: 'Corpo',      emoji: '🦶' },
  { id: 'cor',        label: 'Cores',      emoji: '🎨' },
  { id: 'escola',     label: 'Escola',     emoji: '📚' },
  { id: 'transporte', label: 'Transporte', emoji: '🚗' },
  { id: 'roupa',      label: 'Roupas',     emoji: '👗' },
];

export default function FreePlayScreen({ onSelect, onBack, onAdmin }: Props) {
  const [catFilter, setCatFilter] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');

  const diffConfig = getDifficulty(difficulty);
  const filteredByCategory = catFilter ? words.filter(w => w.category === catFilter) : words;
  const filteredWords = filteredByCategory.filter(w => diffConfig.wordDifficulties.includes(w.difficulty as 1 | 2 | 3));
  const wordPool = filteredWords.length >= 4 ? filteredWords : filteredByCategory;

  function handleSelect(gameId: string) {
    const gameOverride = diffConfig.overrides[gameId as GameType];
    const rounds = gameOverride?.rounds;
    onSelect(gameId, wordPool.length < words.length ? wordPool : undefined, rounds);
  }

  const availableCategories = CATEGORY_FILTERS.filter(cat =>
    !cat.id || words.filter(w => w.category === cat.id).length >= 4
  );

  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '16px 16px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            className="ds-btn ds-btn-icon"
            aria-label="Voltar"
            style={{ fontSize: 20, minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)' }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Jogar Livre
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', margin: 0 }}>
              {catFilter
                ? `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} · ${
                    availableCategories.find(c => c.id === catFilter)?.label ?? catFilter
                  } · ${diffConfig.label}`
                : `${diffConfig.label} · ${filteredWords.length} palavras`}
            </p>
          </div>
        </div>

        <button
          onClick={onAdmin}
          className="ds-btn ds-btn-ghost"
          style={{ fontSize: 14, padding: '10px 14px', minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)' }}
          aria-label="Admin"
        >
          ⚙️
        </button>
      </header>

      {/* ── Category pills ──────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 0', position: 'sticky', top: 70, zIndex: 9, background: 'var(--color-bg)' }}>
        <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
          {availableCategories.map(cat => {
            const active = catFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  minHeight: 'var(--touch-min)',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-2)',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span style={{ fontSize: 17 }}>{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Difficulty pills ───────────────────────────────────── */}
        <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
          {DIFFICULTY_LEVELS.map(diff => {
            const active = difficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  minHeight: 44,
                  border: `2px solid ${active ? diff.color : 'var(--color-border)'}`,
                  background: active ? diff.color : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-2)',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span style={{ fontSize: 15 }}>{diff.emoji}</span>
                {diff.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Game grid ───────────────────────────────────────────── */}
      <div style={{ padding: '8px 16px 32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {GAME_THEMES.map((game, i) => (
            <button
              key={game.id}
              onClick={() => handleSelect(game.id)}
              className="animate-pop-up"
              style={{
                animationDelay: `${i * 35}ms`,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: `2.5px solid ${game.color}28`,
                padding: '24px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                boxShadow: `0 3px 12px ${game.color}14`,
                cursor: 'pointer', outline: 'none',
                transition: 'transform 0.12s, box-shadow 0.12s',
                minHeight: 140,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 22px ${game.color}22`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 3px 12px ${game.color}14`;
              }}
            >
              {/* Icon container — bigger for children */}
              <div style={{
                width: 72, height: 72,
                borderRadius: 20,
                background: `linear-gradient(135deg, ${game.color}18, ${game.color}30)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40,
              }}>
                {game.icon}
              </div>

              <span style={{
                fontSize: 15,
                fontWeight: 800,
                color: game.color,
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {game.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
