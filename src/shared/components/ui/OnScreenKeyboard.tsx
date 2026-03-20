import { useState } from 'react';

interface Props {
  onKey: (key: string) => void;
  showSpace?: boolean;
  showBackspace?: boolean;
  lastFeedback?: 'ok' | 'no' | null;
  /** Se true, mostra sempre o backspace independente de showBackspace */
  alwaysBackspace?: boolean;
}

// Layout QWERTY português — 3 fileiras principais
const ROW1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'];
const ROW3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

// Acentos separados — aparecem ao tocar "Á?"
const ACCENTS = ['á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'];

export default function OnScreenKeyboard({
  onKey,
  showSpace = false,
  showBackspace = false,
  lastFeedback = null,
  alwaysBackspace = false,
}: Props) {
  const [pressed, setPressedKey] = useState<string | null>(null);
  const [showAccents, setShowAccents] = useState(false);

  const showBs = showBackspace || alwaysBackspace;

  function handlePress(key: string) {
    setPressedKey(key);
    onKey(key);
    setTimeout(() => setPressedKey(null), 120);
  }

  function keyBg(key: string): string {
    if (pressed !== key) return 'white';
    if (lastFeedback === 'ok') return '#C8E6C9';
    if (lastFeedback === 'no') return '#FFCDD2';
    return '#E8E0FF';
  }

  const keyBase: React.CSSProperties = {
    height: 52,
    borderRadius: 10,
    border: '1.5px solid #D1D5DB',
    fontFamily: 'var(--font-family)',
    fontWeight: 700,
    fontSize: 19,
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.08s, background-color 0.08s',
    boxShadow: '0 3px 0 #C4C9D4',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    color: '#1a1a2e',
  };

  function keyStyle(key: string): React.CSSProperties {
    const isPressed = pressed === key;
    return {
      ...keyBase,
      backgroundColor: keyBg(key),
      transform: isPressed ? 'scale(0.88) translateY(2px)' : 'scale(1)',
      boxShadow: isPressed ? 'none' : '0 3px 0 #C4C9D4',
    };
  }

  const specialStyle: React.CSSProperties = {
    ...keyBase,
    flex: 'none',
    width: 48,
    backgroundColor: '#F3F4F6',
    border: '1.5px solid #D1D5DB',
    fontSize: 22,
    color: '#4B5563',
  };

  const accentToggleStyle: React.CSSProperties = {
    ...keyBase,
    flex: 'none',
    width: 52,
    backgroundColor: showAccents ? '#EDE9FE' : '#F3F4F6',
    border: `1.5px solid ${showAccents ? '#7C3AED' : '#D1D5DB'}`,
    fontSize: 13,
    fontWeight: 800,
    color: showAccents ? '#7C3AED' : '#6B7280',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        background: '#E8EAED',
        borderRadius: 16,
        padding: '10px 6px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Acentos (expansível) */}
      {showAccents && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', paddingBottom: 2 }}>
          {ACCENTS.map(key => (
            <button
              key={key}
              onPointerDown={e => { e.preventDefault(); handlePress(key); }}
              style={{
                ...keyStyle(key),
                flex: 'none',
                width: 40,
                height: 48,
                fontSize: 18,
                borderColor: '#A78BFA',
                background: pressed === key ? '#EDE9FE' : '#F5F3FF',
              }}
              aria-label={`Letra ${key.toUpperCase()}`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Linha 1: Q W E R T Y U I O P */}
      <div style={{ display: 'flex', gap: 5 }}>
        {ROW1.map(key => (
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

      {/* Linha 2: A S D F G H J K L Ç (centralizada) */}
      <div style={{ display: 'flex', gap: 5, paddingLeft: 10, paddingRight: 10 }}>
        {ROW2.map(key => (
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

      {/* Linha 3: [⌫] Z X C V B N M [Á?] */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'stretch' }}>
        {/* Backspace */}
        {showBs && (
          <button
            onPointerDown={e => { e.preventDefault(); handlePress('Backspace'); }}
            style={{
              ...specialStyle,
              backgroundColor: pressed === 'Backspace' ? '#FFCDD2' : '#FFE4E1',
              border: '1.5px solid #FECACA',
              color: '#DC2626',
              transform: pressed === 'Backspace' ? 'scale(0.88) translateY(2px)' : 'scale(1)',
              boxShadow: pressed === 'Backspace' ? 'none' : '0 3px 0 #FCA5A5',
            }}
            aria-label="Apagar"
          >
            ⌫
          </button>
        )}

        {ROW3.map(key => (
          <button
            key={key}
            onPointerDown={e => { e.preventDefault(); handlePress(key); }}
            style={keyStyle(key)}
            aria-label={`Letra ${key.toUpperCase()}`}
          >
            {key.toUpperCase()}
          </button>
        ))}

        {/* Toggle acentos */}
        <button
          onPointerDown={e => { e.preventDefault(); setShowAccents(v => !v); }}
          style={{
            ...accentToggleStyle,
            transform: pressed === '__accent' ? 'scale(0.88) translateY(2px)' : 'scale(1)',
            boxShadow: showAccents ? '0 3px 0 #7C3AED55' : '0 3px 0 #C4C9D4',
          }}
          aria-label="Mostrar acentos"
          aria-pressed={showAccents}
        >
          Á?
        </button>
      </div>

      {/* Espaço (opcional) */}
      {showSpace && (
        <div style={{ display: 'flex', gap: 5 }}>
          <button
            onPointerDown={e => { e.preventDefault(); handlePress(' '); }}
            style={{
              ...keyStyle(' '),
              fontSize: 13,
              color: '#6B7280',
              letterSpacing: 1,
            }}
            aria-label="Espaço"
          >
            espaço
          </button>
        </div>
      )}
    </div>
  );
}
