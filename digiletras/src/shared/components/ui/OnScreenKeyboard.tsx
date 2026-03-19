import { useState } from 'react';

interface Props {
  onKey: (key: string) => void;
  showSpace?: boolean;
  showBackspace?: boolean;
  lastFeedback?: 'ok' | 'no' | null;
}

// Linhas do teclado português
const ROWS = [
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  ['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
  ['u', 'v', 'x', 'z', 'ç'],
  ['á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'],
];

export default function OnScreenKeyboard({
  onKey,
  showSpace = false,
  showBackspace = false,
  lastFeedback = null,
}: Props) {
  const [pressed, setPressed] = useState<string | null>(null);

  function handlePress(key: string) {
    setPressed(key);
    onKey(key);
    setTimeout(() => setPressed(null), 150);
  }

  function keyStyle(key: string): React.CSSProperties {
    const isPressed = pressed === key;
    const feedbackBg =
      isPressed && lastFeedback === 'ok' ? '#C8E6C9' :
      isPressed && lastFeedback === 'no' ? '#FFCDD2' :
      isPressed ? '#E0E0E0' : 'white';

    return {
      minWidth: 32,
      minHeight: 44,
      padding: '0 6px',
      backgroundColor: feedbackBg,
      border: '1.5px solid #E0E0E0',
      borderRadius: 8,
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      transform: isPressed ? 'scale(0.9)' : 'scale(1)',
      transition: 'transform 0.1s, background-color 0.1s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    };
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        background: '#F5F5F5',
        borderRadius: 16,
        padding: '10px 6px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {row.map(key => (
            <button
              key={key}
              onPointerDown={e => { e.preventDefault(); handlePress(key); }}
              style={keyStyle(key)}
              aria-label={`Letra ${key.toUpperCase()}`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}

      {/* Linha de ações */}
      {(showSpace || showBackspace) && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {showSpace && (
            <button
              onPointerDown={e => { e.preventDefault(); handlePress(' '); }}
              style={{
                ...keyStyle(' '),
                flex: 3,
                fontSize: 13,
                color: '#666',
                letterSpacing: 1,
              }}
              aria-label="Espaço"
            >
              espaço
            </button>
          )}
          {showBackspace && (
            <button
              onPointerDown={e => { e.preventDefault(); handlePress('Backspace'); }}
              style={{
                ...keyStyle('Backspace'),
                flex: 1,
                backgroundColor: pressed === 'Backspace' ? '#FFCDD2' : '#FFE0E0',
                color: '#C62828',
                fontSize: 20,
              }}
              aria-label="Apagar"
            >
              ⌫
            </button>
          )}
        </div>
      )}
    </div>
  );
}
