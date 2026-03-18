import { useState } from 'react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';

interface Props {
  onSelect: (game: string, wordPool?: Word[]) => void;
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

  const filteredWords = catFilter ? words.filter(w => w.category === catFilter) : words;
  const wordPool = catFilter ? filteredWords : undefined;

  const availableCategories = CATEGORY_FILTERS.filter(cat =>
    !cat.id || words.filter(w => w.category === cat.id).length >= 4
  );

  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--color-surface)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '14px 16px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            className="ds-btn ds-btn-icon"
            aria-label="Voltar"
            style={{ fontSize: 18 }}
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Jogar Livre
            </h1>
            <p style={{ fontSize: 12, color: 'var(--color-text-2)', margin: 0 }}>
              {catFilter
                ? `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} · ${
                    availableCategories.find(c => c.id === catFilter)?.label ?? catFilter
                  }`
                : 'Escolha qualquer jogo'}
            </p>
          </div>
        </div>

        <button
          onClick={onAdmin}
          className="ds-btn ds-btn-ghost"
          style={{ fontSize: 12, padding: '8px 12px' }}
          aria-label="Admin"
        >
          ⚙️
        </button>
      </header>

      {/* ── Category pills ──────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 0', position: 'sticky', top: 65, zIndex: 9, background: 'var(--color-bg)' }}>
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
                  padding: '7px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text-2)',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                {cat.label}
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
          gap: 12,
        }}>
          {GAME_THEMES.map((game, i) => (
            <button
              key={game.id}
              onClick={() => onSelect(game.id, wordPool)}
              className="animate-pop-up"
              style={{
                animationDelay: `${i * 35}ms`,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: `2.5px solid ${game.color}33`,
                padding: '20px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                boxShadow: `0 2px 10px ${game.color}1A`,
                cursor: 'pointer', outline: 'none',
                transition: 'transform 0.12s, box-shadow 0.12s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 18px ${game.color}30`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 10px ${game.color}1A`;
              }}
            >
              {/* Icon container */}
              <div style={{
                width: 64, height: 64,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${game.color}22, ${game.color}44)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                {game.icon}
              </div>

              <span style={{
                fontSize: 13,
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
