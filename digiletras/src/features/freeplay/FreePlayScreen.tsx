import { useState } from 'react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';

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
  const wordPool = catFilter ? ([...filteredWords] as Word[]) : undefined;

  const availableCategories = CATEGORY_FILTERS.filter(cat =>
    !cat.id || words.filter(w => w.category === cat.id).length >= 4
  );

  const subtitle = catFilter
    ? `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} · ${
        availableCategories.find(c => c.id === catFilter)?.label ?? catFilter
      }`
    : 'Escolha um jogo e divirta-se!';

  return (
    <div className="ds-screen" style={{ overflowY: 'auto' }}>

      {/* ── Header via ScreenHeader ────────────────────────────── */}
      <ScreenHeader
        title="Jogar Livre"
        emoji="🎮"
        onBack={onBack}
        subtitle={subtitle}
        actions={
          <button
            onClick={onAdmin}
            className="ds-btn-icon"
            style={{
              background: 'rgba(255,255,255,.2)',
              color: 'var(--color-text-inverse)',
            }}
            aria-label="Admin"
          >
            ⚙️
          </button>
        }
      />

      {/* ── Category pills ──────────────────────────────────────── */}
      <div style={{
        padding: 'var(--spacing-md) var(--spacing-lg) 0',
        position: 'sticky', top: 76, zIndex: 9,
        background: 'var(--color-bg)',
      }}>
        <div className="scrollbar-hide" style={{
          display: 'flex', gap: 'var(--spacing-sm)', overflowX: 'auto',
          paddingBottom: 'var(--spacing-sm)',
        }}>
          {availableCategories.map(cat => {
            const active = catFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                className={`ds-btn ${active ? '' : 'ds-btn-ghost'}`}
                style={{
                  flexShrink: 0,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  borderRadius: 'var(--radius-full)',
                  background: active
                    ? 'var(--gradient-primary)'
                    : 'var(--color-surface)',
                  color: active ? 'var(--color-text-inverse)' : 'var(--color-text-2)',
                  boxShadow: active
                    ? '0 3px 12px rgba(108,92,231,.35)'
                    : 'var(--shadow-sm)',
                  transition: `all var(--transition-fast)`,
                }}
              >
                <span style={{ fontSize: 'var(--font-size-md)' }}>{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Game grid ───────────────────────────────────────────── */}
      <div style={{ padding: 'var(--spacing-sm) var(--spacing-md) 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--spacing-md)',
        }}>
          {GAME_THEMES.map((game, i) => (
            <button
              key={game.id}
              onClick={() => onSelect(game.id, wordPool)}
              className="ds-card animate-pop-up"
              style={{
                animationDelay: `${i * 40}ms`,
                background: game.gradient,
                borderColor: `${game.color}40`,
                padding: 'var(--spacing-lg) var(--spacing-md) var(--spacing-lg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 'var(--spacing-sm)',
                cursor: 'pointer',
                transition: `transform var(--transition-fast), box-shadow var(--transition-fast)`,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px) scale(1.02)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px ${game.color}35`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }}
              aria-label={game.label}
            >
              {/* Decorative circle behind icon */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: 'var(--radius-full)',
                background: `${game.color}12`,
              }} />

              {/* Icon */}
              <div style={{
                width: 72, height: 72,
                borderRadius: 'var(--radius-lg)',
                background: `linear-gradient(135deg, ${game.color}20, ${game.color}40)`,
                border: `2.5px solid ${game.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 38,
                position: 'relative',
              }}>
                {game.icon}
              </div>

              {/* Label */}
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 800,
                color: game.textColor,
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
