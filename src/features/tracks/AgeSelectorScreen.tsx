import { useNavigate } from 'react-router-dom';
import { CaseSensitive } from 'lucide-react';
import { useSessionStore } from '../../shared/stores/sessionStore';
import type { AgeGroup } from '../../shared/tracks/types';

const AGE_CARDS: { age: AgeGroup; emoji: string; color: string; bg: string; label: string; description: string }[] = [
  { age: '3-4', emoji: '🧒', color: '#27ae60', bg: 'linear-gradient(145deg, #27ae60, #2ecc71)', label: '3–4 anos', description: 'Vogais e reconhecimento' },
  { age: '5-6', emoji: '👦', color: '#2980b9', bg: 'linear-gradient(145deg, #2980b9, #3498db)', label: '5–6 anos', description: 'Família silábica e leitura' },
  { age: '7-8', emoji: '👧', color: '#8e44ad', bg: 'linear-gradient(145deg, #8e44ad, #9b59b6)', label: '7–8 anos', description: 'Sílabas, frases e histórias' },
  { age: '9-10', emoji: '🎓', color: '#7c3aed', bg: 'linear-gradient(145deg, #7c3aed, #6d28d9)', label: '9–10 anos', description: 'Ditado e leitura fluente' },
];

export default function AgeSelectorScreen() {
  const navigate = useNavigate();
  const { selectedAge, setSelectedAge } = useSessionStore();

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
        {AGE_CARDS.map(({ age, emoji, color, bg, label, description }) => {
          const isCurrent = selectedAge === age;
          return (
            <button
              key={age}
              onClick={() => handleSelect(age)}
              aria-label={label}
              style={{
                width: '100%',
                maxWidth: 320,
                padding: '20px 24px',
                borderRadius: 24,
                border: `3px solid ${isCurrent ? '#FDCB6E' : `${color}88`}`,
                background: bg,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: isCurrent
                  ? `0 0 0 4px rgba(253,203,110,0.35), 0 8px 28px ${color}40`
                  : `0 8px 28px ${color}40`,
                transition: 'transform .14s, box-shadow .14s',
                outline: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px ${color}60`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = isCurrent
                  ? `0 0 0 4px rgba(253,203,110,0.35), 0 8px 28px ${color}40`
                  : `0 8px 28px ${color}40`;
              }}
            >
              <span style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#fff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.82)',
                  marginTop: 2,
                }}>
                  {description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
