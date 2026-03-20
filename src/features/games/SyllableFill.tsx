/**
 * SyllableFill — Completar a sílaba da família
 *
 * Mostra a família silábica da vez (ex: FA · FE · FI · FO · FU)
 * e uma palavra com emoji onde UMA sílaba está em branco.
 * A criança toca a sílaba correta para completar a palavra.
 */
import { useState, useEffect, useCallback } from 'react';
import { beep, speak } from '../../shared/utils/audio';
import { useShake } from '../../shared/hooks/useShake';
import { useGameRounds } from '../../shared/hooks/useGameRounds';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import type { GameComponentProps } from '../../shared/types';
import { shuffle } from '../../shared/utils/helpers';

export interface SyllableFillChallenge {
  family: string;       // letra consoante: "F"
  answer: string;       // sílaba correta: "FA"
  syllables: string[];  // palavra dividida: ["FA","DA"]
  blankIdx: number;     // índice do espaço em branco
  emoji: string;
  word: string;         // palavra completa
}

// ─── Dados das famílias ───────────────────────────────────────────────────────
export const SYLLABLE_FILL_DATA: SyllableFillChallenge[] = [
  // ── Família B ──
  { family:'B', answer:'BO', syllables:['BO','LA'], blankIdx:0, emoji:'⚽', word:'BOLA' },
  { family:'B', answer:'BO', syllables:['BO','LO'], blankIdx:0, emoji:'🎂', word:'BOLO' },
  { family:'B', answer:'BE', syllables:['BE','BÊ'], blankIdx:0, emoji:'👶', word:'BEBÊ' },
  { family:'B', answer:'BI', syllables:['BI','CO'], blankIdx:0, emoji:'🐦', word:'BICO' },
  { family:'B', answer:'BA', syllables:['BA','NA','NA'], blankIdx:0, emoji:'🍌', word:'BANANA' },
  { family:'B', answer:'BU', syllables:['BU','RRO'], blankIdx:0, emoji:'🫏', word:'BURRO' },
  { family:'B', answer:'BI', syllables:['BI','CI','CLE','TA'], blankIdx:0, emoji:'🚲', word:'BICICLETA' },
  { family:'B', answer:'BA', syllables:['SA','BA'],  blankIdx:1, emoji:'🐸', word:'SAPO' },

  // ── Família C ──
  { family:'C', answer:'CA', syllables:['CA','SA'], blankIdx:0, emoji:'🏠', word:'CASA' },
  { family:'C', answer:'CA', syllables:['CA','MA'], blankIdx:0, emoji:'🛏️', word:'CAMA' },
  { family:'C', answer:'CA', syllables:['CA','FÉ'], blankIdx:0, emoji:'☕', word:'CAFÉ' },
  { family:'C', answer:'CO', syllables:['CO','CO'], blankIdx:0, emoji:'🥥', word:'COCO' },
  { family:'C', answer:'CO', syllables:['CO','EL','HO'], blankIdx:0, emoji:'🐰', word:'COELHO' },
  { family:'C', answer:'CU', syllables:['CU','BO'], blankIdx:0, emoji:'🎲', word:'CUBO' },
  { family:'C', answer:'CE', syllables:['CE','BÔ','LA'], blankIdx:0, emoji:'🧅', word:'CEBOLA' },
  { family:'C', answer:'CI', syllables:['CI','DA','DE'], blankIdx:0, emoji:'🏙️', word:'CIDADE' },

  // ── Família D ──
  { family:'D', answer:'DA', syllables:['DA','DO'], blankIdx:0, emoji:'🎲', word:'DADO' },
  { family:'D', answer:'DE', syllables:['DE','DO'], blankIdx:0, emoji:'👆', word:'DEDO' },
  { family:'D', answer:'DI', syllables:['DI','A'], blankIdx:0, emoji:'☀️', word:'DIA' },
  { family:'D', answer:'DO', syllables:['DO','CE'], blankIdx:0, emoji:'🍬', word:'DOCE' },
  { family:'D', answer:'DU', syllables:['DU','AS'], blankIdx:0, emoji:'✌️', word:'DUAS' },
  { family:'D', answer:'DA', syllables:['ES','CA','DA'], blankIdx:2, emoji:'🪜', word:'ESCADA' },
  { family:'D', answer:'DO', syllables:['JA','DO'], blankIdx:1, emoji:'🦎', word:'JACARÉ' },

  // ── Família F ──
  { family:'F', answer:'FA', syllables:['FA','DA'], blankIdx:0, emoji:'🧚', word:'FADA' },
  { family:'F', answer:'FO', syllables:['FO','GO'], blankIdx:0, emoji:'🔥', word:'FOGO' },
  { family:'F', answer:'FI', syllables:['FI','GO'], blankIdx:0, emoji:'🫐', word:'FIGO' },
  { family:'F', answer:'FO', syllables:['FO','CA'], blankIdx:0, emoji:'🦭', word:'FOCA' },
  { family:'F', answer:'FE', syllables:['FE','IJÃ','O'], blankIdx:0, emoji:'🫘', word:'FEIJÃO' },
  { family:'F', answer:'FU', syllables:['FU','MA','ÇA'], blankIdx:0, emoji:'💨', word:'FUMAÇA' },
  { family:'F', answer:'FI', syllables:['FI','TA'], blankIdx:0, emoji:'🎀', word:'FITA' },
  { family:'F', answer:'FA', syllables:['FA','ZEN','DA'], blankIdx:0, emoji:'🌾', word:'FAZENDA' },

  // ── Família G ──
  { family:'G', answer:'GA', syllables:['GA','TO'], blankIdx:0, emoji:'🐱', word:'GATO' },
  { family:'G', answer:'GA', syllables:['GA','LO'], blankIdx:0, emoji:'🐔', word:'GALO' },
  { family:'G', answer:'GE', syllables:['GE','LO'], blankIdx:0, emoji:'🧊', word:'GELO' },
  { family:'G', answer:'GI', syllables:['GI','RA','FA'], blankIdx:0, emoji:'🦒', word:'GIRAFA' },
  { family:'G', answer:'GO', syllables:['GO','TA'], blankIdx:0, emoji:'💧', word:'GOTA' },
  { family:'G', answer:'GU', syllables:['GU','AR','DÁ'], blankIdx:0, emoji:'☂️', word:'GUARDA' },
  { family:'G', answer:'GA', syllables:['Á','GUA'], blankIdx:1, emoji:'💦', word:'ÁGUA' },

  // ── Família L ──
  { family:'L', answer:'LU', syllables:['LU','A'], blankIdx:0, emoji:'🌙', word:'LUA' },
  { family:'L', answer:'LO', syllables:['LO','BO'], blankIdx:0, emoji:'🐺', word:'LOBO' },
  { family:'L', answer:'LA', syllables:['LA','RA','NJA'], blankIdx:0, emoji:'🍊', word:'LARANJA' },
  { family:'L', answer:'LE', syllables:['LE','ÃO'], blankIdx:0, emoji:'🦁', word:'LEÃO' },
  { family:'L', answer:'LI', syllables:['LI','VRO'], blankIdx:0, emoji:'📖', word:'LIVRO' },
  { family:'L', answer:'LA', syllables:['BO','LA'], blankIdx:1, emoji:'⚽', word:'BOLA' },
  { family:'L', answer:'LO', syllables:['BO','LO'], blankIdx:1, emoji:'🎂', word:'BOLO' },
  { family:'L', answer:'LU', syllables:['PU','LO'], blankIdx:1, emoji:'🦘', word:'PULO' },

  // ── Família M ──
  { family:'M', answer:'MA', syllables:['MA','LÃ'], blankIdx:0, emoji:'🧳', word:'MALA' },
  { family:'M', answer:'ME', syllables:['ME','SA'], blankIdx:0, emoji:'🍽️', word:'MESA' },
  { family:'M', answer:'MI', syllables:['MI','LHO'], blankIdx:0, emoji:'🌽', word:'MILHO' },
  { family:'M', answer:'MO', syllables:['MO','CA'], blankIdx:0, emoji:'👒', word:'MOÇA' },
  { family:'M', answer:'MU', syllables:['MU','LA'], blankIdx:0, emoji:'🐴', word:'MULA' },
  { family:'M', answer:'MA', syllables:['CA','MA'], blankIdx:1, emoji:'🛏️', word:'CAMA' },
  { family:'M', answer:'MI', syllables:['MÍ','SI','CA'], blankIdx:0, emoji:'🎵', word:'MÚSICA' },
  { family:'M', answer:'MA', syllables:['MA','CA','CÓ'], blankIdx:0, emoji:'🐒', word:'MACACO' },

  // ── Família N ──
  { family:'N', answer:'NA', syllables:['NA','DOR'], blankIdx:0, emoji:'🏊', word:'NADAR' },
  { family:'N', answer:'NE', syllables:['NE','VO','EI','RO'], blankIdx:0, emoji:'☁️', word:'NEVOEIRO' },
  { family:'N', answer:'NI', syllables:['NI','NHO'], blankIdx:0, emoji:'🐦', word:'NINHO' },
  { family:'N', answer:'NO', syllables:['NO','ITE'], blankIdx:0, emoji:'🌙', word:'NOITE' },
  { family:'N', answer:'NU', syllables:['NU','VEM'], blankIdx:0, emoji:'☁️', word:'NUVEM' },
  { family:'N', answer:'NA', syllables:['BA','NA','NA'], blankIdx:1, emoji:'🍌', word:'BANANA' },
  { family:'N', answer:'NE', syllables:['SO','NE','TO'], blankIdx:1, emoji:'👦', word:'SONETO' },

  // ── Família P ──
  { family:'P', answer:'PA', syllables:['PA','TO'], blankIdx:0, emoji:'🦆', word:'PATO' },
  { family:'P', answer:'PI', syllables:['PI','PA'], blankIdx:0, emoji:'🪁', word:'PIPA' },
  { family:'P', answer:'PE', syllables:['PE','IX','E'], blankIdx:0, emoji:'🐟', word:'PEIXE' },
  { family:'P', answer:'PO', syllables:['PO','VO'], blankIdx:0, emoji:'👥', word:'POVO' },
  { family:'P', answer:'PU', syllables:['PU','LGA'], blankIdx:0, emoji:'🐛', word:'PULGA' },
  { family:'P', answer:'PA', syllables:['SA','PA','TO'], blankIdx:1, emoji:'👟', word:'SAPATO' },
  { family:'P', answer:'PO', syllables:['HI','PO'], blankIdx:1, emoji:'🦛', word:'HIPOPÓTAMO' },
  { family:'P', answer:'PI', syllables:['GUA','PI'], blankIdx:1, emoji:'🐊', word:'JACARÉ' },

  // ── Família R ──
  { family:'R', answer:'RA', syllables:['RA','TO'], blankIdx:0, emoji:'🐭', word:'RATO' },
  { family:'R', answer:'RE', syllables:['RE','I'], blankIdx:0, emoji:'👑', word:'REI' },
  { family:'R', answer:'RO', syllables:['RO','SA'], blankIdx:0, emoji:'🌹', word:'ROSA' },
  { family:'R', answer:'RO', syllables:['RO','DA'], blankIdx:0, emoji:'🛞', word:'RODA' },
  { family:'R', answer:'RU', syllables:['RU','A'], blankIdx:0, emoji:'🛤️', word:'RUA' },
  { family:'R', answer:'RA', syllables:['BO','RA','CHA'], blankIdx:1, emoji:'🐢', word:'BORRACHA' },
  { family:'R', answer:'RI', syllables:['RI','O'], blankIdx:0, emoji:'🏞️', word:'RIO' },
  { family:'R', answer:'RE', syllables:['Á','RE','A'], blankIdx:1, emoji:'📐', word:'ÁREA' },

  // ── Família S ──
  { family:'S', answer:'SA', syllables:['SA','PO'], blankIdx:0, emoji:'🐸', word:'SAPO' },
  { family:'S', answer:'SO', syllables:['SO','L'], blankIdx:0, emoji:'☀️', word:'SOL' },
  { family:'S', answer:'SI', syllables:['SI','NO'], blankIdx:0, emoji:'🔔', word:'SINO' },
  { family:'S', answer:'SE', syllables:['SE','LVA'], blankIdx:0, emoji:'🌴', word:'SELVA' },
  { family:'S', answer:'SU', syllables:['SU','CO'], blankIdx:0, emoji:'🍹', word:'SUCO' },
  { family:'S', answer:'SA', syllables:['CA','SA'], blankIdx:1, emoji:'🏠', word:'CASA' },
  { family:'S', answer:'SO', syllables:['OS','SO'], blankIdx:1, emoji:'🦴', word:'OSSO' },
  { family:'S', answer:'SE', syllables:['ME','SE'], blankIdx:1, emoji:'📅', word:'MESES' },

  // ── Família T ──
  { family:'T', answer:'TA', syllables:['TA','TU'], blankIdx:0, emoji:'🦔', word:'TATU' },
  { family:'T', answer:'TE', syllables:['TE','IA'], blankIdx:0, emoji:'🕷️', word:'TEIA' },
  { family:'T', answer:'TI', syllables:['TI','GRE'], blankIdx:0, emoji:'🐯', word:'TIGRE' },
  { family:'T', answer:'TO', syllables:['TO','MA','TE'], blankIdx:0, emoji:'🍅', word:'TOMATE' },
  { family:'T', answer:'TU', syllables:['TU','BA','RÃO'], blankIdx:0, emoji:'🦈', word:'TUBARÃO' },
  { family:'T', answer:'TO', syllables:['GA','TO'], blankIdx:1, emoji:'🐱', word:'GATO' },
  { family:'T', answer:'TA', syllables:['PA','TA'], blankIdx:1, emoji:'🦆', word:'PATA' },
  { family:'T', answer:'TE', syllables:['MA','TE'], blankIdx:1, emoji:'☕', word:'MATE' },

  // ── Família V ──
  { family:'V', answer:'VA', syllables:['VA','CA'], blankIdx:0, emoji:'🐄', word:'VACA' },
  { family:'V', answer:'VE', syllables:['VE','A','DO'], blankIdx:0, emoji:'🦌', word:'VEADO' },
  { family:'V', answer:'VI', syllables:['VI','DA'], blankIdx:0, emoji:'💚', word:'VIDA' },
  { family:'V', answer:'VO', syllables:['VO','AR'], blankIdx:0, emoji:'🦅', word:'VOAR' },
  { family:'V', answer:'VU', syllables:['VU','L','CÃO'], blankIdx:0, emoji:'🌋', word:'VULCÃO' },
  { family:'V', answer:'VA', syllables:['U','VA'], blankIdx:1, emoji:'🍇', word:'UVA' },
  { family:'V', answer:'VO', syllables:['O','VO'], blankIdx:1, emoji:'🥚', word:'OVO' },

  // ── Família Z ──
  { family:'Z', answer:'ZE', syllables:['ZE','BRA'], blankIdx:0, emoji:'🦓', word:'ZEBRA' },
  { family:'Z', answer:'ZO', syllables:['ZO','O'], blankIdx:0, emoji:'🐘', word:'ZOO' },
  { family:'Z', answer:'ZU', syllables:['ZU','M','BI','DO'], blankIdx:0, emoji:'🐝', word:'ZUMBIDO' },
];

// Agrupa por família para facilitar filtro
export function getChallengesByFamily(family: string): SyllableFillChallenge[] {
  return SYLLABLE_FILL_DATA.filter(c => c.family === family);
}

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

const theme_color = '#0288D1';
const theme_bg = '#E1F5FE';
const theme_text = '#01579B';
const theme_gradient = 'linear-gradient(135deg, #E1F5FE, #81D4FA)';

export default function SyllableFill({ onBack, rounds, onComplete }: GameComponentProps) {
  const effectiveRounds = rounds ?? 8;

  const [pool] = useState(() => shuffle(SYLLABLE_FILL_DATA).slice(0, effectiveRounds));

  const { current, round, correct, done, advance, addError } = useGameRounds<SyllableFillChallenge>({
    pool,
    totalRounds: effectiveRounds,
    onComplete,
  });

  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [revealed, setRevealed] = useState(false);
  const { shake, triggerShake } = useShake();

  // The 5 syllable options for this family
  const options = current
    ? VOWELS.map(v => `${current.family}${v}`)
    : [];

  const announceWord = useCallback((ch: SyllableFillChallenge) => {
    ch.syllables.forEach((syl, i) => {
      setTimeout(() => speak(syl), i * 500);
    });
    setTimeout(() => speak(ch.word), ch.syllables.length * 500 + 200);
  }, []);

  useEffect(() => {
    if (!current) return;
    setFeedback({});
    setRevealed(false);
    setTimeout(() => speak(current.word), 300);
  }, [round, current]);

  function handleOption(option: string) {
    if (!current || revealed) return;

    const isCorrect = option === current.answer;
    const fb: Record<string, 'correct' | 'wrong'> = { [option]: isCorrect ? 'correct' : 'wrong' };
    if (!isCorrect) fb[current.answer] = 'correct';
    setFeedback(fb);

    if (isCorrect) {
      beep('ok');
      setRevealed(true);
      announceWord(current);
      setTimeout(() => advance(true), 1800);
    } else {
      beep('no');
      addError();
      triggerShake();
      setTimeout(() => setFeedback({}), 900);
    }
  }

  if (!current && !done) return null;

  const theme = getTheme('silfamilia');

  return (
    <GameLayout
      gameId="silfamilia"
      onBack={onBack}
      currentRound={round}
      totalRounds={effectiveRounds}
      done={done}
      score={{ correct, total: effectiveRounds }}
    >
      <div className="flex-1 flex flex-col items-center px-4 pb-4" style={{ gap: 12 }}>

        {/* Família em destaque */}
        <div style={{
          background: theme_gradient,
          borderRadius: 'var(--radius-xl)',
          padding: '10px 20px',
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
        }}>
          <p style={{ fontFamily:'var(--font-family)', fontWeight:700, fontSize:'var(--font-size-xs)', color: theme_text, marginBottom:4 }}>
            Família {current?.family}
          </p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {options.map(syl => (
              <span key={syl} style={{
                fontFamily:'var(--font-family)',
                fontWeight:900,
                fontSize:20,
                color: syl === current?.answer && revealed ? '#2E7D32' : theme_color,
                background: syl === current?.answer && revealed ? '#E8F5E9' : 'white',
                borderRadius: 8,
                padding: '4px 10px',
                border: `2px solid ${syl === current?.answer && revealed ? '#4CAF50' : theme_bg}`,
                transition: 'all .3s',
              }}>
                {syl}
              </span>
            ))}
          </div>
        </div>

        {/* Emoji */}
        <div className="animate-bounce-custom" style={{ fontSize: 80, lineHeight:1, marginTop:4 }}>
          {current?.emoji}
        </div>

        {/* Palavra com lacuna */}
        <div className={`flex gap-2 justify-center flex-wrap ${shake ? 'animate-shake' : ''}`}>
          {current?.syllables.map((syl, i) => {
            const isBlank = i === current.blankIdx;
            const filled = revealed && isBlank;
            return (
              <div
                key={i}
                style={{
                  minWidth: 56,
                  height: 64,
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 900,
                  fontSize: 26,
                  padding: '0 10px',
                  border: `3px solid ${filled ? '#4CAF50' : isBlank ? theme_color : '#e0e0e0'}`,
                  background: filled ? '#E8F5E9' : isBlank ? theme_bg : 'white',
                  color: filled ? '#2E7D32' : isBlank ? theme_color : 'var(--color-text)',
                  transition: 'all .3s ease',
                  transform: isBlank && !filled ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isBlank && !filled ? `0 4px 14px ${theme_color}44` : 'var(--shadow-sm)',
                }}
              >
                {isBlank ? (filled ? current.answer : '???') : syl}
              </div>
            );
          })}
        </div>

        {/* Botões de sílaba */}
        <p style={{ fontFamily:'var(--font-family)', fontWeight:700, color:theme_text, fontSize:'var(--font-size-sm)', marginTop:4 }}>
          Qual sílaba completa?
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {options.map(option => {
            const fb = feedback[option];
            return (
              <button
                key={option}
                onClick={() => handleOption(option)}
                disabled={revealed}
                aria-label={`Sílaba ${option}`}
                className="active:scale-90 transition-all duration-200"
                style={{
                  width: 68,
                  height: 76,
                  borderRadius: 'var(--radius-xl)',
                  border: `3px solid ${
                    fb === 'correct' ? '#4CAF50'
                    : fb === 'wrong' ? '#F44336'
                    : theme_color
                  }`,
                  background:
                    fb === 'correct' ? '#E8F5E9'
                    : fb === 'wrong' ? '#FFEBEE'
                    : 'white',
                  color:
                    fb === 'correct' ? '#2E7D32'
                    : fb === 'wrong' ? '#C62828'
                    : theme_color,
                  fontFamily: 'var(--font-family)',
                  fontWeight: 900,
                  fontSize: 28,
                  cursor: revealed ? 'default' : 'pointer',
                  boxShadow: fb
                    ? 'none'
                    : `0 4px 12px ${theme_color}33`,
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
