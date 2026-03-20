import { useState, useEffect, useCallback } from 'react';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';
import { shuffle } from '../../shared/utils/helpers';

// Each challenge: show a consonant + target syllable, child taps the vowel
interface SyllableChallenge {
  consonant: string;    // e.g. "B"
  vowel: string;        // e.g. "A"
  syllable: string;     // e.g. "BA"
  emoji: string;
  word: string;         // e.g. "BALA"
}

const SYLLABLE_DATA: SyllableChallenge[] = [
  // Família B
  { consonant: 'B', vowel: 'A', syllable: 'BA', emoji: '🍌', word: 'BALA' },
  { consonant: 'B', vowel: 'E', syllable: 'BE', emoji: '🐝', word: 'BEBE' },
  { consonant: 'B', vowel: 'I', syllable: 'BI', emoji: '🚲', word: 'BICO' },
  { consonant: 'B', vowel: 'O', syllable: 'BO', emoji: '🎳', word: 'BOLA' },
  { consonant: 'B', vowel: 'U', syllable: 'BU', emoji: '🦁', word: 'BURRO' },
  // Família C
  { consonant: 'C', vowel: 'A', syllable: 'CA', emoji: '🏠', word: 'CASA' },
  { consonant: 'C', vowel: 'O', syllable: 'CO', emoji: '❤️', word: 'COR' },
  { consonant: 'C', vowel: 'U', syllable: 'CU', emoji: '🍽️', word: 'CUIA' },
  // Família D
  { consonant: 'D', vowel: 'A', syllable: 'DA', emoji: '🎲', word: 'DADO' },
  { consonant: 'D', vowel: 'E', syllable: 'DE', emoji: '🦷', word: 'DENTE' },
  { consonant: 'D', vowel: 'I', syllable: 'DI', emoji: '💰', word: 'DINHEIRO' },
  { consonant: 'D', vowel: 'O', syllable: 'DO', emoji: '🎁', word: 'DOCE' },
  { consonant: 'D', vowel: 'U', syllable: 'DU', emoji: '🚿', word: 'DUCHA' },
  // Família F
  { consonant: 'F', vowel: 'A', syllable: 'FA', emoji: '🗣️', word: 'FALA' },
  { consonant: 'F', vowel: 'E', syllable: 'FE', emoji: '🌿', word: 'FEIJÃO' },
  { consonant: 'F', vowel: 'I', syllable: 'FI', emoji: '🧵', word: 'FIO' },
  { consonant: 'F', vowel: 'O', syllable: 'FO', emoji: '🔥', word: 'FOGO' },
  { consonant: 'F', vowel: 'U', syllable: 'FU', emoji: '💨', word: 'FUMO' },
  // Família G
  { consonant: 'G', vowel: 'A', syllable: 'GA', emoji: '🐔', word: 'GALO' },
  { consonant: 'G', vowel: 'O', syllable: 'GO', emoji: '🩸', word: 'GOTA' },
  { consonant: 'G', vowel: 'U', syllable: 'GU', emoji: '🌂', word: 'GUARDA' },
  // Família L
  { consonant: 'L', vowel: 'A', syllable: 'LA', emoji: '🐑', word: 'LÃ' },
  { consonant: 'L', vowel: 'E', syllable: 'LE', emoji: '🦁', word: 'LEÃO' },
  { consonant: 'L', vowel: 'I', syllable: 'LI', emoji: '📖', word: 'LIVRO' },
  { consonant: 'L', vowel: 'O', syllable: 'LO', emoji: '🐺', word: 'LOBO' },
  { consonant: 'L', vowel: 'U', syllable: 'LU', emoji: '🌙', word: 'LUA' },
  // Família M
  { consonant: 'M', vowel: 'A', syllable: 'MA', emoji: '🍎', word: 'MAÇÃ' },
  { consonant: 'M', vowel: 'E', syllable: 'ME', emoji: '🍯', word: 'MEL' },
  { consonant: 'M', vowel: 'I', syllable: 'MI', emoji: '🌽', word: 'MILHO' },
  { consonant: 'M', vowel: 'O', syllable: 'MO', emoji: '🎒', word: 'MOCHILA' },
  { consonant: 'M', vowel: 'U', syllable: 'MU', emoji: '🐄', word: 'MULA' },
  // Família N
  { consonant: 'N', vowel: 'A', syllable: 'NA', emoji: '🏊', word: 'NADAR' },
  { consonant: 'N', vowel: 'E', syllable: 'NE', emoji: '☁️', word: 'NEVO' },
  { consonant: 'N', vowel: 'I', syllable: 'NI', emoji: '🐦', word: 'NINHO' },
  { consonant: 'N', vowel: 'O', syllable: 'NO', emoji: '🌙', word: 'NOITE' },
  { consonant: 'N', vowel: 'U', syllable: 'NU', emoji: '☁️', word: 'NUVEM' },
  // Família P
  { consonant: 'P', vowel: 'A', syllable: 'PA', emoji: '🦆', word: 'PATO' },
  { consonant: 'P', vowel: 'E', syllable: 'PE', emoji: '🐟', word: 'PEIXE' },
  { consonant: 'P', vowel: 'I', syllable: 'PI', emoji: '🌲', word: 'PINHEIRO' },
  { consonant: 'P', vowel: 'O', syllable: 'PO', emoji: '🌉', word: 'PONTE' },
  { consonant: 'P', vowel: 'U', syllable: 'PU', emoji: '🐟', word: 'PULGA' },
  // Família R
  { consonant: 'R', vowel: 'A', syllable: 'RA', emoji: '🐸', word: 'RATO' },
  { consonant: 'R', vowel: 'E', syllable: 'RE', emoji: '👑', word: 'REI' },
  { consonant: 'R', vowel: 'I', syllable: 'RI', emoji: '😄', word: 'RIR' },
  { consonant: 'R', vowel: 'O', syllable: 'RO', emoji: '🌹', word: 'ROSA' },
  { consonant: 'R', vowel: 'U', syllable: 'RU', emoji: '🛤️', word: 'RUA' },
  // Família S
  { consonant: 'S', vowel: 'A', syllable: 'SA', emoji: '🐸', word: 'SAPO' },
  { consonant: 'S', vowel: 'E', syllable: 'SE', emoji: '🌳', word: 'SELVA' },
  { consonant: 'S', vowel: 'O', syllable: 'SO', emoji: '☀️', word: 'SOL' },
  { consonant: 'S', vowel: 'U', syllable: 'SU', emoji: '🍹', word: 'SUCO' },
  // Família T
  { consonant: 'T', vowel: 'A', syllable: 'TA', emoji: '🎯', word: 'TATU' },
  { consonant: 'T', vowel: 'E', syllable: 'TE', emoji: '🕷️', word: 'TEIA' },
  { consonant: 'T', vowel: 'I', syllable: 'TI', emoji: '🐯', word: 'TIGRE' },
  { consonant: 'T', vowel: 'O', syllable: 'TO', emoji: '🍅', word: 'TOMATE' },
  { consonant: 'T', vowel: 'U', syllable: 'TU', emoji: '🦈', word: 'TUBARÃO' },
  // Família V
  { consonant: 'V', vowel: 'A', syllable: 'VA', emoji: '🐄', word: 'VACA' },
  { consonant: 'V', vowel: 'E', syllable: 'VE', emoji: '🌬️', word: 'VENTO' },
  { consonant: 'V', vowel: 'I', syllable: 'VI', emoji: '🍇', word: 'VIDEIRA' },
  { consonant: 'V', vowel: 'O', syllable: 'VO', emoji: '🦅', word: 'VOAR' },
  { consonant: 'V', vowel: 'U', syllable: 'VU', emoji: '🌋', word: 'VULCÃO' },
  // Família Z
  { consonant: 'Z', vowel: 'E', syllable: 'ZE', emoji: '🦓', word: 'ZEBRA' },
  { consonant: 'Z', vowel: 'O', syllable: 'ZO', emoji: '🐘', word: 'ZOOLÓGICO' },
  { consonant: 'Z', vowel: 'U', syllable: 'ZU', emoji: '🐝', word: 'ZUMBIDO' },
];

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

export default function SyllableFamily({ onBack, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? 8;
  const theme = getTheme('silfamilia');

  const [pool] = useState(() => shuffle(SYLLABLE_DATA).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<SyllableChallenge>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [showSyllable, setShowSyllable] = useState(false);
  const { shake, triggerShake } = useShake();

  const announceSyllable = useCallback((ch: SyllableChallenge) => {
    speak(ch.consonant);
    setTimeout(() => speak(ch.vowel), 600);
    setTimeout(() => speak(ch.syllable), 1200);
  }, []);

  useEffect(() => {
    if (!current) return;
    setFeedback({});
    setShowSyllable(false);
    // Speak consonant + example word
    setTimeout(() => speak(current.word), 200);
  }, [round, current]);

  function handleVowel(vowel: string) {
    if (!current || Object.keys(feedback).length > 0) return;

    const isCorrect = vowel === current.vowel;
    const fb: Record<string, 'correct' | 'wrong'> = {};
    fb[vowel] = isCorrect ? 'correct' : 'wrong';
    if (!isCorrect) fb[current.vowel] = 'correct';

    setFeedback(fb);

    if (isCorrect) {
      beep('ok');
      setShowSyllable(true);
      announceSyllable(current);
      setTimeout(() => advance(true), 2000);
    } else {
      beep('no');
      addError();
      triggerShake();
      setTimeout(() => {
        setFeedback({});
      }, 1000);
    }
  }

  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="silfamilia"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Emoji + word hint */}
        <div className="text-8xl mb-1 animate-bounce-custom">{current?.emoji}</div>
        <p
          style={{ color: 'var(--color-text-2)', fontFamily: 'var(--font-family)', fontSize: 'var(--font-size-sm)' }}
          className="mb-4"
        >
          {current?.word}
        </p>

        {/* Syllable formation display */}
        <div
          className="flex items-center justify-center gap-3 mb-6"
          style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 24px',
            boxShadow: 'var(--shadow-md)',
            minWidth: 220,
          }}
        >
          {/* Consonant box */}
          <div
            style={{
              width: 64,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              background: theme.bg,
              border: `3px solid ${theme.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 36,
              color: theme.textColor,
              fontFamily: 'var(--font-family)',
            }}
          >
            {current?.consonant}
          </div>

          <span style={{ fontSize: 28, color: 'var(--color-text-2)', fontWeight: 700 }}>+</span>

          {/* Vowel box (empty or filled) */}
          <div
            style={{
              width: 64,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              background: showSyllable ? '#E8F5E9' : '#f5f5f5',
              border: `3px solid ${showSyllable ? '#4CAF50' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 36,
              color: showSyllable ? '#2E7D32' : 'var(--color-text-3)',
              fontFamily: 'var(--font-family)',
              transition: 'all .3s ease',
            }}
          >
            {showSyllable ? current?.vowel : '?'}
          </div>

          <span style={{ fontSize: 28, color: 'var(--color-text-2)', fontWeight: 700 }}>=</span>

          {/* Result syllable */}
          <div
            style={{
              width: 80,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              background: showSyllable ? theme.gradient : '#f5f5f5',
              border: `3px solid ${showSyllable ? theme.color : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 36,
              color: showSyllable ? theme.textColor : 'var(--color-text-3)',
              fontFamily: 'var(--font-family)',
              transition: 'all .3s ease',
              transform: showSyllable ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {showSyllable ? current?.syllable : '??'}
          </div>
        </div>

        <p
          style={{ color: theme.textColor, fontFamily: 'var(--font-family)', fontWeight: 700 }}
          className="mb-5 text-base"
        >
          Qual vogal completa?
        </p>

        {/* Vowel buttons */}
        <div className={`flex gap-3 justify-center flex-wrap ${shake ? 'animate-shake' : ''}`}>
          {VOWELS.map(vowel => {
            const fb = feedback[vowel];
            return (
              <button
                key={vowel}
                onClick={() => handleVowel(vowel)}
                aria-label={`Vogal ${vowel}`}
                disabled={showSyllable}
                className="transition-all duration-300 active:scale-90"
                style={{
                  width: 60,
                  height: 68,
                  borderRadius: 'var(--radius-lg)',
                  border: `3px solid ${
                    fb === 'correct' ? '#4CAF50'
                    : fb === 'wrong' ? '#F44336'
                    : theme.color
                  }`,
                  background:
                    fb === 'correct' ? '#E8F5E9'
                    : fb === 'wrong' ? '#FFEBEE'
                    : 'white',
                  color:
                    fb === 'correct' ? '#2E7D32'
                    : fb === 'wrong' ? '#C62828'
                    : theme.textColor,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 900,
                  fontSize: 28,
                  cursor: showSyllable ? 'default' : 'pointer',
                  boxShadow: `0 3px 10px ${theme.color}33`,
                }}
              >
                {vowel}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
