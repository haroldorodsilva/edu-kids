import { useNavigate } from 'react-router-dom';
import { CaseSensitive } from 'lucide-react';
import { getSelectedAge, setSelectedAge } from '../../shared/tracks/trackStore';
import type { AgeGroup } from '../../shared/tracks/types';

const AGE_CARDS: { age: AgeGroup; emoji: string; color: string; bg: string }[] = [
  { age: '3-4', emoji: '🧒', color: '#27ae60', bg: 'linear-gradient(145deg, #27ae60, #2ecc71)' },
  { age: '5-6', emoji: '👦', color: '#2980b9', bg: 'linear-gradient(145deg, #2980b9, #3498db)' },
  { age: '7-8', emoji: '👧', color: '#8e44ad', bg: 'linear-gradient(145deg, #8e44ad, #9b59b6)' },
];

export default function AgeSelectorScreen() {
  const navigate = useNavigate();

  // No auto-redirect — always show age selector on root.
  // User picks age each session (or navigates directly via /tracks/:age).

  function handleSelect(age: AgeGroup) {
    setSelectedAge(age);
    navigate(`/tracks/${age}`);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      background: 'var(--gradient-hero)',
    }}>
      {/* Header */}
      <header style={{
        flexShrink: 0,
        background: 'rgba(55,38,200,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.09)',
        padding: '12px 16px 10px',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}><CaseSensitive size={28} color="#fff" /></span>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
            Silabrinca
          </div>
        </div>
      </header>

      {/* Cards area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '32px 20px',
      }}>
        {AGE_CARDS.map(({ age, emoji, color, bg }) => {
          const isCurrent = getSelectedAge() === age;
          return (
            <button
              key={age}
              onClick={() => handleSelect(age)}
              aria-label={`${age} anos`}
              style={{
                width: '100%',
                maxWidth: 280,
                padding: '28px 20px',
                borderRadius: 24,
                border: `3px solid ${isCurrent ? '#FDCB6E' : `${color}88`}`,
                background: bg,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                boxShadow: isCurrent
                  ? `0 0 0 4px rgba(253,203,110,0.35), 0 8px 28px ${color}40`
                  : `0 8px 28px ${color}40`,
                transition: 'transform .14s, box-shadow .14s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${color}60`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = isCurrent
                  ? `0 0 0 4px rgba(253,203,110,0.35), 0 8px 28px ${color}40`
                  : `0 8px 28px ${color}40`;
              }}
            >
              <span style={{ fontSize: 56, lineHeight: 1 }}>{emoji}</span>
              <span style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}>
                {age}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
