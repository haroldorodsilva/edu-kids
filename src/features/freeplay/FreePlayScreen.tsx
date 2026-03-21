import { useState } from 'react';
import {
  Gamepad2, Settings, Target, PawPrint, Apple, Package, Leaf, Home,
  User, Footprints, Palette, BookOpen, Car, Shirt, Sparkles,
} from 'lucide-react';
import { GAME_THEMES } from '../../shared/data/gameThemes';
import { words } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import LucideIcon from '../../shared/components/ui/LucideIcon';
import { DIFFICULTY_LEVELS, type DifficultyLevel, getDifficulty } from '../../shared/config/difficultyLevels';
import type { GameType } from '../../shared/progression/types';
import { useSessionStore } from '../../shared/stores/sessionStore';

interface Props {
  onSelect: (game: string, wordPool?: Word[], rounds?: number) => void;
  onBack: () => void;
  onAdmin: () => void;
}

const CATEGORY_FILTERS = [
  { id: '',           label: 'Todos',      emoji: '🎯', Icon: Target },
  { id: 'animal',     label: 'Animais',    emoji: '🐾', Icon: PawPrint },
  { id: 'comida',     label: 'Comida',     emoji: '🍎', Icon: Apple },
  { id: 'objeto',     label: 'Objetos',    emoji: '📦', Icon: Package },
  { id: 'natureza',   label: 'Natureza',   emoji: '🍃', Icon: Leaf },
  { id: 'lugar',      label: 'Lugares',    emoji: '🏠', Icon: Home },
  { id: 'pessoa',     label: 'Pessoas',    emoji: '👤', Icon: User },
  { id: 'corpo',      label: 'Corpo',      emoji: '👣', Icon: Footprints },
  { id: 'cor',        label: 'Cores',      emoji: '🎨', Icon: Palette },
  { id: 'escola',     label: 'Escola',     emoji: '📖', Icon: BookOpen },
  { id: 'transporte', label: 'Transporte', emoji: '🚗', Icon: Car },
  { id: 'roupa',      label: 'Roupas',     emoji: '👕', Icon: Shirt },
];

// Maps the difficulty level to stars count for display
const DIFFICULTY_STARS: Record<DifficultyLevel, number> = {
  easy: 1, medium: 2, hard: 3, endless: 0,
};

// Age-aware default difficulty
function defaultDifficultyForAge(age: string | null): DifficultyLevel {
  if (age === '3-4') return 'easy';
  if (age === '9-10') return 'hard';
  return 'medium';
}

export default function FreePlayScreen({ onSelect, onBack, onAdmin }: Props) {
  const { selectedAge } = useSessionStore();
  const [catFilter, setCatFilter] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    defaultDifficultyForAge(selectedAge),
  );

  const diffConfig = getDifficulty(difficulty);
  const allWords = words as unknown as Word[];
  const filteredByCategory = catFilter ? allWords.filter(w => w.category === catFilter) : [...allWords];
  const filteredWords = filteredByCategory.filter(w => diffConfig.wordDifficulties.includes(w.difficulty as 1 | 2 | 3));
  const wordPool = filteredWords.length >= 4 ? filteredWords : filteredByCategory;

  function handleSelect(gameId: string) {
    const gameOverride = diffConfig.overrides[gameId as GameType];
    const rounds = gameOverride?.rounds;
    onSelect(gameId, wordPool.length < allWords.length ? wordPool : undefined, rounds);
  }

  const availableCategories = CATEGORY_FILTERS.filter(cat =>
    !cat.id || allWords.filter(w => w.category === cat.id).length >= 4
  );

  // Word count per game card (based on current filter/difficulty)
  const gameWordCount = wordPool.length;

  const subtitle = catFilter
    ? `${filteredWords.length} palavra${filteredWords.length !== 1 ? 's' : ''} · ${
        availableCategories.find(c => c.id === catFilter)?.label ?? catFilter
      }`
    : `${filteredWords.length} palavras disponíveis`;

  return (
    <div className="ds-screen" style={{ overflowY: 'auto' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--gradient-hero)',
          padding: 'var(--spacing-lg) var(--spacing-lg) var(--spacing-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={onBack}
              className="ds-btn-icon"
              aria-label="Voltar"
              style={{
                minWidth: 44, minHeight: 44,
                background: 'rgba(255,255,255,.15)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <LucideIcon name="ArrowLeft" size={20} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Gamepad2 size={22} color="#fff" />
                <h1 style={{
                  fontSize: 'var(--font-size-xl)', fontWeight: 800,
                  color: '#fff', margin: 0, fontFamily: 'var(--font-family)',
                }}>
                  Jogar Livre
                </h1>
              </div>
              <p style={{
                fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,.75)',
                margin: '2px 0 0', fontFamily: 'var(--font-family)',
              }}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            className="ds-btn-icon"
            onClick={onAdmin}
            aria-label="Painel Admin"
            style={{
              minWidth: 44, minHeight: 44,
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* ── Difficulty cards ─────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 'var(--spacing-md)',
          justifyContent: 'center',
        }}>
          {DIFFICULTY_LEVELS.map(d => {
            const active = difficulty === d.id;
            const stars = DIFFICULTY_STARS[d.id];
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4,
                  minWidth: 68, minHeight: 80,
                  flex: 1,
                  borderRadius: 16,
                  border: `3px solid ${active ? '#fff' : 'rgba(255,255,255,.25)'}`,
                  background: active ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '10px 4px 8px',
                  backdropFilter: active ? 'blur(6px)' : 'none',
                  boxShadow: active ? '0 0 0 2px rgba(255,255,255,.15), 0 4px 16px rgba(0,0,0,.18)' : 'none',
                  transition: 'all .15s ease',
                  position: 'relative',
                  outline: 'none',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#FDCB6E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, lineHeight: 1,
                  }}>✓</span>
                )}
                <LucideIcon name={d.icon} size={22} color="#fff" />
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-family)' }}>
                  {d.label}
                </span>
                {stars > 0 ? (
                  <div style={{ display: 'flex', gap: 2 }}>
                    {Array.from({ length: 3 }, (_, i) => (
                      <span key={i} style={{ fontSize: 9, opacity: i < stars ? 1 : 0.3 }}>★</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, opacity: 0.9 }}>∞</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Category filter pills ───────────────────────────── */}
      <div
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          overflowX: 'auto',
          flexWrap: 'nowrap',
        }}
      >
        {availableCategories.map(cat => {
          const active = catFilter === cat.id;
          return (
            <button
              key={cat.id || '__all'}
              onClick={() => setCatFilter(cat.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-text-2)',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: active ? '0 2px 8px rgba(108,92,231,.3)' : 'var(--shadow-sm)',
                transition: 'all .15s ease',
              }}
            >
              <span style={{ fontSize: 15 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Game grid ───────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--spacing-md)',
        padding: '0 var(--spacing-lg) var(--spacing-2xl)',
        flex: 1,
      }}>
        {GAME_THEMES.map((game, i) => (
          <button
            key={game.id}
            onClick={() => handleSelect(game.id)}
            className="animate-pop-up"
            style={{
              animationDelay: `${i * 40}ms`,
              background: game.gradient,
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--spacing-lg) var(--spacing-md) var(--spacing-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: `0 4px 16px ${game.color}33`,
              transition: 'transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease',
              aspectRatio: '1',
              position: 'relative',
              overflow: 'hidden',
            }}
            onPointerDown={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.93)';
            }}
            onPointerUp={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
              setTimeout(() => { (e.currentTarget as HTMLElement).style.transform = ''; }, 150);
            }}
            onPointerLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
            }}
          >
            {/* Decorative circle behind icon */}
            <div style={{
              position: 'absolute',
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.18)',
              top: '14%',
              filter: 'blur(1px)',
            }} />
            <LucideIcon
              name={game.icon}
              size={38}
              color={game.textColor}
              strokeWidth={2.2}
              style={{ position: 'relative', zIndex: 1 }}
            />
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 700,
              color: game.textColor,
              fontFamily: 'var(--font-family)',
              textAlign: 'center',
              lineHeight: 1.2,
              position: 'relative',
              zIndex: 1,
            }}>
              {game.label}
            </span>
            {/* Word count badge */}
            <span style={{
              position: 'absolute', bottom: 6, left: 0, right: 0,
              textAlign: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: game.textColor,
              opacity: 0.65,
              fontFamily: 'var(--font-family)',
              zIndex: 1,
            }}>
              {gameWordCount} palavras
            </span>
          </button>
        ))}
      </div>

      {/* ── Floating sparkle decoration ─────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 16, right: 16,
        opacity: 0.15, pointerEvents: 'none',
      }}>
        <Sparkles size={48} color="var(--color-primary)" className="animate-float" />
      </div>
    </div>
  );
}
