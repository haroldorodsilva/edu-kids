import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Curated set of kid-friendly icons from lucide-react,
 * organized by category for easy browsing in the admin panel.
 */

interface IconEntry {
  name: string;
  category: string;
  Component: React.ComponentType<{ size?: number; color?: string }>;
}

// Curated kid-friendly subset (avoid complex/scary icons)
const CURATED_ICONS: Record<string, string[]> = {
  'Animais': [
    'Bug', 'Bird', 'Cat', 'Dog', 'Fish', 'Rabbit', 'Snail', 'Squirrel',
    'Turtle', 'Egg',
  ],
  'Natureza': [
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSun', 'Flower', 'Flower2',
    'Leaf', 'TreePine', 'Trees', 'Mountain', 'MountainSnow',
    'Snowflake', 'Waves', 'Wind', 'Rainbow', 'Sprout', 'Droplets',
  ],
  'Comida': [
    'Apple', 'Banana', 'Cherry', 'Grape', 'IceCreamCone', 'Candy',
    'Cookie', 'Cake', 'CakeSlice', 'Pizza', 'Sandwich', 'Soup',
    'CupSoda', 'Coffee', 'Milk', 'Carrot', 'Citrus', 'Salad',
  ],
  'Escola': [
    'BookOpen', 'Book', 'GraduationCap', 'Pencil', 'PenTool', 'Eraser',
    'Ruler', 'Calculator', 'Notebook', 'Library',
    'FileText', 'ClipboardList', 'Lightbulb', 'Brain',
  ],
  'Jogos': [
    'Gamepad2', 'Puzzle', 'Dices', 'Target', 'Trophy', 'Medal', 'Crown',
    'Star', 'Heart', 'Sparkles', 'Zap', 'Flame',
    'Music', 'PartyPopper', 'Gift',
  ],
  'Transporte': [
    'Car', 'Bus', 'Bike', 'Plane', 'Rocket', 'Ship', 'TrainFront',
    'Truck',
  ],
  'Casa': [
    'Home', 'Bed', 'Bath', 'Lamp', 'Sofa', 'Tv', 'Refrigerator',
    'WashingMachine', 'Fan', 'Lock', 'Key', 'DoorOpen',
  ],
  'Pessoas': [
    'Baby', 'User', 'Users', 'UserRound', 'Smile', 'SmilePlus',
    'Laugh', 'ThumbsUp', 'HandMetal', 'Hand', 'Footprints',
  ],
  'Ações': [
    'Play', 'Pause', 'RotateCcw', 'Check', 'X', 'Plus', 'Minus',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
    'RefreshCw', 'Search', 'Eye', 'EyeOff', 'Volume2', 'VolumeX',
  ],
  'Formas': [
    'Circle', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'Octagon',
    'Diamond', 'RectangleHorizontal',
  ],
};

function buildIconList(): IconEntry[] {
  const entries: IconEntry[] = [];
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>;

  for (const [category, names] of Object.entries(CURATED_ICONS)) {
    for (const name of names) {
      const Component = icons[name];
      if (Component && typeof Component === 'function') {
        entries.push({ name, category, Component });
      }
    }
  }
  return entries;
}

// ── Emoji picker subset (kid-friendly) ──────────────────────

const EMOJI_CATEGORIES: Record<string, string[]> = {
  'Animais': ['🐱', '🐶', '🐰', '🐸', '🦁', '🐻', '🐼', '🐨', '🐷', '🐮', '🐔', '🐧', '🦆', '🦉', '🦋', '🐛', '🐌', '🐢', '🐠', '🐬', '🦭', '🐺', '🦊'],
  'Comida':  ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍕', '🍔', '🍪', '🎂', '🍬', '🍦', '🥕', '🥚', '🍞', '☕', '🥛', '🍰'],
  'Natureza': ['🌸', '🌻', '🌿', '🌳', '🍀', '☀️', '🌙', '⭐', '🌈', '☁️', '🌊', '🔥', '❄️', '🪶', '💎'],
  'Objetos': ['⚽', '🎨', '🎵', '📚', '✏️', '🎲', '🧩', '🪁', '🔔', '🎁', '🏆', '👑', '🔑', '💡', '🧸', '🎭', '🎪'],
  'Transporte': ['🚗', '🚌', '🚂', '✈️', '🚀', '🚢', '🚲', '🛸'],
  'Rostos':  ['😊', '😄', '🥰', '😎', '🤩', '😇', '🤗', '👋', '👏', '✋', '🖐️', '👍'],
};

// ── Component ───────────────────────────────────────────────

export type IconPickerMode = 'lucide' | 'emoji';

interface Props {
  /** Currently selected icon name (lucide) or emoji string */
  value: string;
  mode?: IconPickerMode;
  onSelect: (value: string, mode: IconPickerMode) => void;
  onClose: () => void;
}

export default function IconPicker({ value, mode = 'emoji', onSelect, onClose }: Props) {
  const [tab, setTab] = useState<IconPickerMode>(mode);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  const allLucideIcons = useMemo(() => buildIconList(), []);

  const filteredLucide = useMemo(() => {
    let list = allLucideIcons;
    if (category) list = list.filter(i => i.category === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    return list;
  }, [allLucideIcons, category, search]);

  const filteredEmoji = useMemo(() => {
    if (!category && !search) return Object.entries(EMOJI_CATEGORIES);
    const entries = Object.entries(EMOJI_CATEGORIES);
    if (category) return entries.filter(([cat]) => cat === category);
    return entries; // search not very useful for emojis
  }, [category, search]);

  const lucideCategories = Object.keys(CURATED_ICONS);
  const emojiCategories = Object.keys(EMOJI_CATEGORIES);
  const currentCategories = tab === 'lucide' ? lucideCategories : emojiCategories;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '85vh',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--color-text)' }}>
              Escolher Ícone
            </h3>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--neutral-100)', border: 'none',
                fontSize: 16, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => { setTab('emoji'); setCategory(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: `2px solid ${tab === 'emoji' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: tab === 'emoji' ? 'var(--color-primary)' : 'transparent',
                color: tab === 'emoji' ? '#fff' : 'var(--color-text-2)',
                cursor: 'pointer',
              }}
            >
              😊 Emojis
            </button>
            <button
              onClick={() => { setTab('lucide'); setCategory(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: `2px solid ${tab === 'lucide' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: tab === 'lucide' ? 'var(--color-primary)' : 'transparent',
                color: tab === 'lucide' ? '#fff' : 'var(--color-text-2)',
                cursor: 'pointer',
              }}
            >
              🖼️ Ícones
            </button>
          </div>

          {/* Search (lucide only) */}
          {tab === 'lucide' && (
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ícone..."
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: 12, border: '2px solid var(--color-border)',
                fontSize: 14, outline: 'none',
                background: 'var(--neutral-50)',
                marginBottom: 8,
              }}
            />
          )}

          {/* Category pills */}
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setCategory('')}
              style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                background: !category ? 'var(--color-primary)' : 'var(--neutral-100)',
                color: !category ? '#fff' : 'var(--color-text-2)',
                border: 'none', cursor: 'pointer',
              }}
            >
              Todos
            </button>
            {currentCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat === category ? '' : cat)}
                style={{
                  flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: category === cat ? 'var(--color-primary)' : 'var(--neutral-100)',
                  color: category === cat ? '#fff' : 'var(--color-text-2)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {tab === 'emoji' ? (
            <div>
              {filteredEmoji.map(([cat, emojis]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 8 }}>{cat}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => onSelect(emoji, 'emoji')}
                        style={{
                          width: '100%', aspectRatio: '1',
                          borderRadius: 12, border: `2px solid ${value === emoji ? 'var(--color-primary)' : 'transparent'}`,
                          background: value === emoji ? 'var(--color-primary-light)' + '30' : 'var(--neutral-50)',
                          fontSize: 24, cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {filteredLucide.map(icon => (
                <button
                  key={icon.name}
                  onClick={() => onSelect(icon.name, 'lucide')}
                  title={icon.name}
                  style={{
                    width: '100%', aspectRatio: '1',
                    borderRadius: 12,
                    border: `2px solid ${value === icon.name ? 'var(--color-primary)' : 'transparent'}`,
                    background: value === icon.name ? 'var(--color-primary-light)' + '30' : 'var(--neutral-50)',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 2,
                  }}
                >
                  <icon.Component size={24} color="var(--color-text)" />
                  <span style={{ fontSize: 8, color: 'var(--color-text-3)', lineHeight: 1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {icon.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Renders either an emoji string or a lucide icon by name.
 * Use this anywhere you need to display a saved icon.
 */
export function RenderIcon({ value, size = 24, color }: { value: string; size?: number; color?: string }) {
  // If it looks like an emoji (starts with non-ASCII), render as text
  if (!value || /^[\p{Emoji_Presentation}\p{Emoji}\u200d]/u.test(value)) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>{value || '📦'}</span>;
  }

  // Otherwise, try to find a lucide icon
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>;
  const Component = icons[value];
  if (Component && typeof Component === 'function') {
    return <Component size={size} color={color ?? 'currentColor'} />;
  }

  // Fallback
  return <span style={{ fontSize: size, lineHeight: 1 }}>📦</span>;
}
