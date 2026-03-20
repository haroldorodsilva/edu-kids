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

        {/* ── Difficulty selector inside header ─────────────── */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 'var(--spacing-sm)',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {DIFFICULTY_LEVELS.map(d => {
            const active = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: `2px solid ${active ? '#fff' : 'rgba(255,255,255,.3)'}`,
                  background: active ? 'rgba(255,255,255,.25)' : 'transparent',
                  color: '#fff',
                  fontFamily: 'var(--font-family)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                  transition: 'all .15s ease',
                  backdropFilter: active ? 'blur(4px)' : 'none',
                }}
              >
                <LucideIcon name={d.icon} size={13} />
                {d.label}
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
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? '#fff' : 'var(--color-text-2)',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: active ? '0 2px 8px rgba(108,92,231,.3)' : 'var(--shadow-sm)',
                transition: 'all .15s ease',
              }}
            >
              <cat.Icon size={14} />
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
              padding: 'var(--spacing-lg) var(--spacing-md)',
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
              top: '18%',
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
