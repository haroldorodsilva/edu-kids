/**
 * SyllableSpot — Identificar a Sílaba Inicial
 *
 * Exercício de consciência fonológica:
 * Mostra um emoji + fala a palavra → criança toca a sílaba correta
 * entre 3 opções (a primeira sílaba da palavra).
 *
 * Inspirado nos exercícios de livro didático:
 *  - "Observe as figuras e pinte a sílaba inicial"  (3 opções mistas)
 *  - "Ouça o nome das figuras e assinale a primeira sílaba" (família fixa)
 */
import { useState, useEffect, useCallback } from 'react';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';
import { shuffle } from '../../shared/utils/helpers';
import { recordGamePlayed, recordWordAttempt } from '../../shared/utils/sessionStats';

// ─── Dataset ─────────────────────────────────────────────────────────────────
interface SpotChallenge {
  word: string;
  emoji: string;
  answer: string;      // primeira sílaba, ex. "LU"
  options: string[];   // 3 opções (inclui a correta), já embaralhadas
}

// Sílabas distratoras por família para gerar variedade
const FAMILY_SYLLABLES: Record<string, string[]> = {
  A: ['BA','CA','DA','FA','GA','LA','MA','NA','PA','RA','SA','TA','VA','ZA'],
  E: ['BE','CE','DE','FE','GE','LE','ME','NE','PE','RE','SE','TE','VE'],
  I: ['BI','DI','FI','GI','JI','LI','MI','NI','PI','RI','SI','TI','VI'],
  O: ['BO','CO','DO','FO','GO','JO','LO','MO','NO','PO','RO','SO','TO','VO'],
  U: ['BU','CU','DU','FU','JU','LU','MU','NU','PU','RU','SU','TU','VU'],
};

const RAW: Omit<SpotChallenge, 'options'>[] = [
  // ── B ──
  { word:'BOLA',    emoji:'⚽',  answer:'BO' },
  { word:'BOLO',    emoji:'🎂',  answer:'BO' },
  { word:'BEBÊ',    emoji:'👶',  answer:'BE' },
  { word:'BICO',    emoji:'🐦',  answer:'BI' },
  { word:'BURRO',   emoji:'🫏',  answer:'BU' },
  { word:'BANANA',  emoji:'🍌',  answer:'BA' },
  // ── C ──
  { word:'CASA',    emoji:'🏠',  answer:'CA' },
  { word:'CAMA',    emoji:'🛏️', answer:'CA' },
  { word:'COCO',    emoji:'🥥',  answer:'CO' },
  { word:'COELHO',  emoji:'🐰',  answer:'CO' },
  { word:'CUBO',    emoji:'🎲',  answer:'CU' },
  // ── D ──
  { word:'DADO',    emoji:'🎲',  answer:'DA' },
  { word:'DEDO',    emoji:'👆',  answer:'DE' },
  { word:'DOCE',    emoji:'🍬',  answer:'DO' },
  // ── F ──
  { word:'FADA',    emoji:'🧚',  answer:'FA' },
  { word:'FOGO',    emoji:'🔥',  answer:'FO' },
  { word:'FIGO',    emoji:'🫐',  answer:'FI' },
  { word:'FOCA',    emoji:'🦭',  answer:'FO' },
  { word:'FITA',    emoji:'🎀',  answer:'FI' },
  { word:'FUMAÇA',  emoji:'💨',  answer:'FU' },
  { word:'FEIJÃO',  emoji:'🫘',  answer:'FE' },
  // ── G ──
  { word:'GATO',    emoji:'🐱',  answer:'GA' },
  { word:'GALO',    emoji:'🐔',  answer:'GA' },
  { word:'GELO',    emoji:'🧊',  answer:'GE' },
  { word:'GIRAFA',  emoji:'🦒',  answer:'GI' },
  // ── J ──
  { word:'JOGO',    emoji:'🎮',  answer:'JO' },
  { word:'JUBA',    emoji:'🦁',  answer:'JU' },
  { word:'JACARÉ',  emoji:'🐊',  answer:'JA' },
  { word:'JOIA',    emoji:'💎',  answer:'JO' },
  { word:'JANELA',  emoji:'🪟',  answer:'JA' },
  { word:'JOANINHA',emoji:'🐞',  answer:'JO' },
  { word:'JARDIM',  emoji:'🌸',  answer:'JAR' },
  { word:'JUNHO',   emoji:'📅',  answer:'JU' },
  // ── L ──
  { word:'LUA',     emoji:'🌙',  answer:'LU' },
  { word:'LOBO',    emoji:'🐺',  answer:'LO' },
  { word:'LAÇO',    emoji:'🎀',  answer:'LA' },
  { word:'LEÃO',    emoji:'🦁',  answer:'LE' },
  { word:'LIVRO',   emoji:'📖',  answer:'LI' },
  { word:'LIMÃO',   emoji:'🍋',  answer:'LI' },
  { word:'LARANJA', emoji:'🍊',  answer:'LA' },
  { word:'LEQUE',   emoji:'🪭',  answer:'LE' },
  // ── M ──
  { word:'MALA',    emoji:'🧳',  answer:'MA' },
  { word:'MESA',    emoji:'🍽️', answer:'ME' },
  { word:'MILHO',   emoji:'🌽',  answer:'MI' },
  { word:'MULA',    emoji:'🐴',  answer:'MU' },
  { word:'MACACO',  emoji:'🐒',  answer:'MA' },
  { word:'MÚSICA',  emoji:'🎵',  answer:'MÚ' },
  // ── N ──
  { word:'NINHO',   emoji:'🐦',  answer:'NI' },
  { word:'NOITE',   emoji:'🌙',  answer:'NO' },
  { word:'NUVEM',   emoji:'☁️',  answer:'NU' },
  // ── P ──
  { word:'PATO',    emoji:'🦆',  answer:'PA' },
  { word:'PIPA',    emoji:'🪁',  answer:'PI' },
  { word:'PEIXE',   emoji:'🐟',  answer:'PE' },
  { word:'PULGA',   emoji:'🦗',  answer:'PU' },
  { word:'PANELA',  emoji:'🍲',  answer:'PA' },
  { word:'PIRULITO',emoji:'🍭',  answer:'PI' },
  // ── R ──
  { word:'RATO',    emoji:'🐭',  answer:'RA' },
  { word:'REI',     emoji:'👑',  answer:'RE' },
  { word:'ROSA',    emoji:'🌹',  answer:'RO' },
  { word:'RUA',     emoji:'🛤️', answer:'RU' },
  { word:'RIO',     emoji:'🏞️', answer:'RI' },
  // ── S ──
  { word:'SAPO',    emoji:'🐸',  answer:'SA' },
  { word:'SOL',     emoji:'☀️',  answer:'SO' },
  { word:'SINO',    emoji:'🔔',  answer:'SI' },
  { word:'SUCO',    emoji:'🍹',  answer:'SU' },
  { word:'SELO',    emoji:'🏷️', answer:'SE' },
  // ── T ──
  { word:'TATU',    emoji:'🦔',  answer:'TA' },
  { word:'TEIA',    emoji:'🕸️', answer:'TE' },
  { word:'TIGRE',   emoji:'🐯',  answer:'TI' },
  { word:'TOMATE',  emoji:'🍅',  answer:'TO' },
  { word:'TUBARÃO', emoji:'🦈',  answer:'TU' },
  // ── V ──
  { word:'VACA',    emoji:'🐄',  answer:'VA' },
  { word:'VEADO',   emoji:'🦌',  answer:'VE' },
  { word:'VIDA',    emoji:'💚',  answer:'VI' },
  { word:'VULCÃO',  emoji:'🌋',  answer:'VU' },
  // ── Z ──
  { word:'ZEBRA',   emoji:'🦓',  answer:'ZE' },
  { word:'ZERO',    emoji:'0️⃣', answer:'ZE' },
];

function makeOptions(answer: string): string[] {
  // Determina a vogal da sílaba para buscar distratores relacionados
  const vowel = ['A','E','I','O','U'].find(v => answer.endsWith(v)) ?? 'A';
  const pool = (FAMILY_SYLLABLES[vowel] ?? []).filter(s => s !== answer);
  const distractors = shuffle(pool).slice(0, 2);
  return shuffle([answer, ...distractors]);
}

export const SYLLABLE_SPOT_DATA: SpotChallenge[] = RAW.map(r => ({
  ...r,
  options: makeOptions(r.answer),
}));

// Cores do tema
const COLOR  = '#7B1FA2';
void ('#F3E5F5'); // BG (reserved for future use)
const TEXT   = '#6A1B9A';
const GRAD   = 'linear-gradient(135deg, #F3E5F5, #CE93D8)';

export default function SyllableSpot({ onBack, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? 8;
  const [pool] = useState(() => shuffle(SYLLABLE_SPOT_DATA).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<SpotChallenge>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const { shake, triggerShake } = useShake();
  const roundErrorsRef = { current: 0 };

  useEffect(() => { recordGamePlayed('silspot'); }, []);

  useEffect(() => {
    if (!current) return;
    setSelected(null);
    setFeedback(null);
    roundErrorsRef.current = 0;
    setTimeout(() => speak(current.word), 300);
  }, [round, current]);

  const handleOption = useCallback((option: string) => {
    if (!current || selected !== null) return;
    const isCorrect = option === current.answer;
    setSelected(option);
    setFeedback(isCorrect ? 'ok' : 'no');

    if (isCorrect) {
      beep('ok');
      recordWordAttempt(current.word, roundErrorsRef.current);
      // Lê a sílaba e depois a palavra inteira
      speak(option);
      setTimeout(() => speak(current.word), 600);
      setTimeout(() => advance(true), 1600);
    } else {
      beep('no');
      addError();
      roundErrorsRef.current++;
      triggerShake();
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 900);
    }
  }, [current, selected, advance, addError, triggerShake]);

  void getTheme('silspot');
  if (!current && !done) return null;

  return (
    <GameLayout
      gameId="silspot"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center px-4 pb-4" style={{ gap: 14 }}>

        {/* Instrução */}
        <div style={{
          background: GRAD,
          borderRadius: 'var(--radius-xl)',
          padding: '10px 20px',
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
        }}>
          <p style={{ fontFamily:'var(--font-family)', fontWeight:800, fontSize:'var(--font-size-sm)', color: TEXT }}>
            Qual é a <strong>primeira sílaba</strong>?
          </p>
        </div>

        {/* Emoji grande */}
        <button
          onClick={() => current && speak(current.word)}
          className="animate-bounce-custom"
          aria-label={`Ouvir a palavra ${current?.word}`}
          style={{
            fontSize: 96,
            lineHeight: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          {current?.emoji}
        </button>

        {/* Palavra (letras) */}
        <div className={shake ? 'animate-shake' : ''}>
          <p style={{
            fontFamily: 'var(--font-family)',
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: 3,
            color: feedback === 'ok' ? '#2E7D32' : TEXT,
            transition: 'color .3s',
          }}>
            {current?.word}
          </p>
        </div>

        {/* Instrução secundária */}
        <p style={{ fontFamily:'var(--font-family)', fontWeight:600, color: COLOR, fontSize:'var(--font-size-xs)', marginTop: -6 }}>
          Toque a sílaba que começa a palavra ↓
        </p>

        {/* Botões de opção */}
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          {current?.options.map(opt => {
            const isSelected = selected === opt;
            const isCorrect = opt === current.answer;
            let bg = 'white';
            let border = `3px solid ${COLOR}`;
            let color = COLOR;

            if (isSelected && feedback === 'ok') {
              bg = '#E8F5E9'; border = '3px solid #4CAF50'; color = '#2E7D32';
            } else if (isSelected && feedback === 'no') {
              bg = '#FFEBEE'; border = '3px solid #F44336'; color = '#C62828';
            } else if (!isSelected && selected !== null && isCorrect && feedback === 'no') {
              // Mostra o correto após erro
              bg = '#E8F5E9'; border = '3px dashed #4CAF50'; color = '#2E7D32';
            }

            return (
              <button
                key={opt}
                onClick={() => handleOption(opt)}
                disabled={selected !== null && feedback === 'ok'}
                aria-label={`Sílaba ${opt}`}
                className="active:scale-90 transition-all duration-200"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 'var(--radius-xl)',
                  border,
                  background: bg,
                  color,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 900,
                  fontSize: 32,
                  cursor: selected !== null ? 'default' : 'pointer',
                  boxShadow: isSelected ? 'none' : `0 4px 14px ${COLOR}33`,
                  transition: 'all .2s ease',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback positivo */}
        {feedback === 'ok' && (
          <p style={{
            fontFamily: 'var(--font-family)',
            fontWeight: 800,
            fontSize: 22,
            color: '#2E7D32',
            animation: 'bounceIn .3s ease',
          }}>
            ✅ {current?.answer}... {current?.word}
          </p>
        )}
      </div>
    </GameLayout>
  );
}
