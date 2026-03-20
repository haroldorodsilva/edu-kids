import { useState } from 'react';
import {
  Gamepad2, Settings, Target, PawPrint, Apple, Package, Leaf, Home,
  User, Footprints, Palette, BookOpen, Car, Shirt,
} from 'lucide-react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import LucideIcon from '../../shared/components/ui/LucideIcon';
import { DIFFICULTY_LEVELS, type DifficultyLevel, getDifficulty } from '../../shared/config/difficultyLevels';
import type { GameType } from '../../shared/progression/types';

interface Props {
  onSelect: (game: string, wordPool?: Word[], rounds?: number) => void;
  onBack: () => void;
  onAdmin: () => void;
}

const CATEGORY_FILTERS = [
  { id: '',           label: 'Todos',      Icon: Target },
  { id: 'animal',     label: 'Animais',    Icon: PawPrint },
  { id: 'comida',     label: 'Comida',     Icon: Apple },
  { id: 'objeto',     label: 'Objetos',    Icon: Package },
  { id: 'natureza',   label: 'Natureza',   Icon: Leaf },
  { id: 'lugar',      label: 'Lugares',    Icon: Home },
  { id: 'pessoa',     label: 'Pessoas',    Icon: User },
  { id: 'corpo',      label: 'Corpo',      Icon: Footprints },
  { id: 'cor',        label: 'Cores',      Icon: Palette },
  { id: 'escola',     label: 'Escola',     Icon: BookOpen },
  { id: 'transporte', label: 'Transporte', Icon: Car },
  { id: 'roupa',      label: 'Roupas',     Icon: Shirt },
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
        icon={<Gamepad2 size={22} />}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} />
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
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <cat.Icon size={14} /> {cat.label}
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              ...(difficulty === d.id ? { background: d.color, color: '#fff' } : { color: d.color }),
            }}
          >
            <LucideIcon name={d.icon} size={14} /> {d.label}
          </button>
        ))}
      </div>

      {/* Game grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
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
              padding: 'var(--spacing-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-lg)',
              transition: 'transform .15s',
            }}
          >
            <LucideIcon name={game.icon} size={32} color={game.textColor} />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: game.textColor,
                fontFamily: 'var(--font-family)',
                textAlign: 'center',
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
