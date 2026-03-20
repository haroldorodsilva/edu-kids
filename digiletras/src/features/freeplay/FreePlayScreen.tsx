import { useState } from 'react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
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
  const filteredByCategory = catFilter ? words.filter(w => w.category === catFilter) : [...words];
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

  const subtitle = catFilter
    ? `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} · ${
        availableCategories.find(c => c.id === catFilter)?.label ?? catFilter
      } · ${diffConfig.label}`
    : `${diffConfig.label} · ${filteredWords.length} palavras`;

  return (
    <div className="ds-screen" style={{ overflowY: 'auto' }}>
      <ScreenHeader
        title="Jogar Livre"
        emoji="🎮"
        onBack={onBack}
        subtitle={subtitle}
        actions={
          <button
            className="ds-btn-icon"
            onClick={onAdmin}
            aria-label="Painel Admin"
            style={{
              minWidth: 44,
              minHeight: 44,
              background: 'rgba(255,255,255,.2)',
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--font-size-lg)',
            }}
          >
            ⚙️
          </button>
        }
      />

      {/* Category pills */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          overflowX: 'auto',
          flexWrap: 'nowrap',
        }}
      >
        {availableCategories.map(cat => (
          <button
            key={cat.id || '__all'}
            onClick={() => setCatFilter(cat.id)}
            className={catFilter === cat.id ? 'ds-btn ds-btn--sm' : 'ds-btn ds-btn--sm ds-btn--outline'}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Difficulty pills */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          padding: '0 var(--spacing-lg) var(--spacing-md)',
          justifyContent: 'center',
        }}
      >
        {DIFFICULTY_LEVELS.map(d => (
          <button
            key={d.id}
            onClick={() => setDifficulty(d.id)}
            className={difficulty === d.id ? 'ds-btn ds-btn--sm' : 'ds-btn ds-btn--sm ds-btn--outline'}
            style={{
              borderColor: d.color,
              ...(difficulty === d.id ? { background: d.color, color: '#fff' } : { color: d.color }),
            }}
          >
            {d.emoji} {d.label}
          </button>
        ))}
      </div>

      {/* Game grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 'var(--spacing-md)',
          padding: '0 var(--spacing-lg) var(--spacing-xl)',
        }}
      >
        {GAME_THEMES.map(game => (
          <button
            key={game.id}
            onClick={() => handleSelect(game.id)}
            className="ds-card"
            style={{
              background: game.gradient,
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-lg)',
              transition: 'transform .15s',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{game.icon}</span>
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 700,
                color: game.textColor,
                fontFamily: 'var(--font-family)',
              }}
            >
              {game.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
