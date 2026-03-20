import { useMemo } from 'react';
import { ArrowLeft, Star, FileText, Gamepad2, BookOpen } from 'lucide-react';
import { getInteractiveStoriesByAge, type InteractiveStory } from '../../shared/data/interactiveStories';
import { getSavedAgeGroup } from '../../shared/config/ageGroups';

interface Props {
  onSelect: (storyId: string) => void;
  onBack: () => void;
}

function DiffStars({ d }: { d: number }) {
  return <>{[1, 2, 3].map(i => <Star key={i} size={11} fill={i <= d ? '#FFD700' : 'transparent'} color={i <= d ? '#FFD700' : '#ccc'} />)}</>;
}

const THEME_COLORS: Record<string, string> = {
  animal: '#66BB6A',
  natureza: '#4DB6AC',
  fantasia: '#AB47BC',
  lugar: '#42A5F5',
};

export default function InteractiveStoryPicker({ onSelect, onBack }: Props) {
  const age = getSavedAgeGroup() ?? 'alpha1';
  const stories = useMemo(() => getInteractiveStoriesByAge(age), [age]);

  return (
    <div className="ds-screen" style={{ background: 'linear-gradient(170deg, #FFF8EF 0%, #EDE9F9 50%, #F5F0E8 100%)', overflowY: 'auto' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '16px 16px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--neutral-100)', border: 'none',
            fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)',
            minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
          }}
          aria-label="Voltar"
        ><ArrowLeft size={20} /></button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Histórias Interativas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-2)', margin: 0 }}>
            {stories.length} história{stories.length !== 1 ? 's' : ''} disponíve{stories.length !== 1 ? 'is' : 'l'}
          </p>
        </div>
      </header>

      {/* Story cards */}
      <div style={{ padding: '16px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500, margin: '0 auto' }}>
          {stories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} onSelect={onSelect} />
          ))}
        </div>

        {stories.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}><BookOpen size={48} style={{ margin: '0 auto' }} /></div>
            <p style={{ fontSize: 14 }}>Nenhuma história disponível para sua faixa etária.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({ story, index, onSelect }: { story: InteractiveStory; index: number; onSelect: (id: string) => void }) {
  const themeColor = THEME_COLORS[story.theme] ?? 'var(--color-primary)';
  const activityCount = story.pages.filter(p => p.activity).length;

  return (
    <button
      onClick={() => onSelect(story.id)}
      className="animate-pop-up"
      style={{
        animationDelay: `${index * 60}ms`,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: `2px solid ${themeColor}30`,
        padding: 0, overflow: 'hidden',
        boxShadow: `0 4px 16px ${themeColor}15`,
        cursor: 'pointer', outline: 'none',
        textAlign: 'left',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'block', width: '100%',
      }}
    >
      {/* Top color bar */}
      <div style={{
        height: 6,
        background: `linear-gradient(90deg, ${themeColor}, ${themeColor}88)`,
      }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Emoji */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: `${themeColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, flexShrink: 0,
          }}>
            {story.emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--color-text)', marginBottom: 3 }}>
              {story.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.4 }}>
              {story.description}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: `${themeColor}15`, color: themeColor,
            fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 2,
          }}>
            <DiffStars d={story.difficulty} />
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--neutral-100)', color: 'var(--color-text-2)',
            fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <FileText size={12} /> {story.pages.length} páginas
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--neutral-100)', color: 'var(--color-text-2)',
            fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Gamepad2 size={12} /> {activityCount} atividade{activityCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </button>
  );
}
