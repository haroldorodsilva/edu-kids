import { useState, useCallback, useRef } from 'react';
import { ArrowLeft, ChevronRight, PartyPopper, Volume2, Link, Lightbulb, CaseSensitive, Puzzle, Circle, FileText } from 'lucide-react';
import { getInteractiveStoryById } from '../../shared/data/interactiveStories';
import type {
  StoryActivity,
  FillWordActivity, PickLetterActivity, MatchPairsActivity,
  PickSyllableActivity, PickVowelsActivity, OrderSentenceActivity,
} from '../../shared/data/interactiveStories';
import { beep, speak } from '../../shared/utils/audio';
import { shuffle, randomEncouragement } from '../../shared/utils/helpers';
import ProgressBar from '../../shared/components/feedback/ProgressBar';
import DoneCard from '../../shared/components/feedback/DoneCard';

interface Props {
  storyId: string;
  onBack: () => void;
}

export default function InteractiveStoryPlayer({ storyId, onBack }: Props) {
  const story = getInteractiveStoryById(storyId);
  const [pageIdx, setPageIdx] = useState(0);
  const [activityDone, setActivityDone] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!story) return null;

  const page = story.pages[pageIdx];
  const hasActivity = !!page?.activity;
  const canAdvance = !hasActivity || activityDone;
  const isLastPage = pageIdx === story.pages.length - 1;

  function handleNext() {
    if (isLastPage) {
      setFinished(true);
      beep('yay');
    } else {
      setPageIdx(p => p + 1);
      setActivityDone(false);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleActivityComplete(correct: boolean) {
    setActivityDone(true);
    setTotalActivities(t => t + 1);
    if (correct) setTotalCorrect(c => c + 1);
  }

  if (finished) {
    return (
      <DoneCard
        score={{ correct: totalCorrect, total: totalActivities || 1 }}
        onBack={onBack}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(170deg, #FFF8EF 0%, #EDE9F9 50%, #F5F0E8 100%)',
    }}>
      {/* Header */}
      <header style={{
        flexShrink: 0, padding: '12px 16px 8px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={onBack}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--neutral-100)', border: 'none',
              fontSize: 20, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
            aria-label="Voltar"
          ><ArrowLeft size={20} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {story.emoji} {story.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>
              Página {pageIdx + 1} de {story.pages.length}
            </div>
          </div>
        </div>
        <ProgressBar current={pageIdx + 1} total={story.pages.length} color="var(--color-primary)" />
      </header>

      {/* Content */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 16px 120px' }}>
        {/* Illustration */}
        <div style={{
          textAlign: 'center', fontSize: 64, lineHeight: 1.2,
          padding: '20px 0', letterSpacing: 8,
          animation: 'pop 0.4s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          {page.illustration}
        </div>

        {/* Story text */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 20px',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 20,
          animation: 'slide-up 0.4s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          <SpeakableText text={page.text} />
        </div>

        {/* Activity */}
        {page.activity && (
          <div style={{
            animation: 'slide-up 0.5s cubic-bezier(.34,1.56,.64,1) both',
            animationDelay: '0.15s',
          }}>
            {activityDone ? (
              <div style={{
                textAlign: 'center', padding: 20,
                background: 'var(--feedback-ok-light)',
                borderRadius: 'var(--radius-xl)',
                border: '2px solid var(--feedback-ok)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 4 }}><PartyPopper size={40} color="var(--feedback-ok-dark)" /></div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--feedback-ok-dark)' }}>
                  {randomEncouragement()}
                </div>
              </div>
            ) : (
              <ActivityRenderer activity={page.activity} onComplete={handleActivityComplete} />
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1.5px solid var(--color-border)',
        display: 'flex', gap: 10, zIndex: 20,
      }}>
        {pageIdx > 0 && (
          <button
            onClick={() => { setPageIdx(p => p - 1); setActivityDone(false); }}
            style={{
              padding: '14px 20px', borderRadius: 999, fontWeight: 700, fontSize: 15,
              background: 'var(--neutral-100)', color: 'var(--color-text-2)',
              border: 'none', cursor: 'pointer', minHeight: 'var(--touch-min)',
            }}
          >
            <ArrowLeft size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Voltar
          </button>
        )}
        <button
          onClick={canAdvance ? handleNext : undefined}
          disabled={!canAdvance}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: 999, fontWeight: 800, fontSize: 16,
            background: canAdvance ? 'var(--gradient-primary)' : 'var(--neutral-200)',
            color: canAdvance ? '#fff' : 'var(--color-text-3)',
            border: 'none', cursor: canAdvance ? 'pointer' : 'not-allowed',
            opacity: canAdvance ? 1 : 0.6,
            minHeight: 'var(--touch-min)',
            transition: 'all 0.2s',
          }}
        >
          {isLastPage ? 'Terminar' : <>Continuar <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></>}
        </button>
      </div>
    </div>
  );
}

// ── Speakable text (tap to hear) ────────────────────────────

function SpeakableText({ text }: { text: string }) {
  return (
    <div
      onClick={() => speak(text)}
      style={{ cursor: 'pointer', position: 'relative' }}
      role="button"
      aria-label="Ouvir texto"
    >
      <p style={{
        fontSize: 18, lineHeight: 1.7, fontWeight: 600,
        color: 'var(--color-text)', margin: 0,
      }}>
        {text}
      </p>
      <div style={{
        position: 'absolute', top: -4, right: -4,
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--color-primary)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, boxShadow: 'var(--shadow-sm)',
      }}>
        <Volume2 size={14} />
      </div>
    </div>
  );
}

// ── Activity dispatcher ─────────────────────────────────────

function ActivityRenderer({ activity, onComplete }: {
  activity: StoryActivity;
  onComplete: (correct: boolean) => void;
}) {
  const cardStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px 16px',
    border: '2px solid var(--color-primary)33',
    boxShadow: 'var(--shadow-md)',
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 800, fontSize: 15, color: 'var(--color-primary)',
    marginBottom: 14, textAlign: 'center',
  };

  switch (activity.type) {
    case 'fill_word':
      return <FillWordGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
    case 'pick_letter':
      return <PickLetterGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
    case 'match_pairs':
      return <MatchPairsGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
    case 'pick_syllable':
      return <PickSyllableGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
    case 'pick_vowels':
      return <PickVowelsGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
    case 'order_sentence':
      return <OrderSentenceGame act={activity} cardStyle={cardStyle} titleStyle={titleStyle} onComplete={onComplete} />;
  }
}

// ── Shared types for mini-games ─────────────────────────────

interface GameProps<T> {
  act: T;
  cardStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
  onComplete: (correct: boolean) => void;
}

// ── Fill Word ───────────────────────────────────────────────

function FillWordGame({ act, cardStyle, titleStyle, onComplete }: GameProps<FillWordActivity>) {
  const letters = act.word.split('');
  const [blanks] = useState(() => {
    const indices: number[] = [];
    const count = Math.max(1, Math.floor(letters.length * 0.4));
    const all = letters.map((_, i) => i);
    const shuffled = shuffle(all);
    for (let i = 0; i < count && i < shuffled.length; i++) indices.push(shuffled[i]);
    return indices.sort((a, b) => a - b);
  });
  const [filled, setFilled] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState(0);

  const currentBlank = blanks[currentIdx];

  const handleTap = useCallback((letter: string) => {
    if (currentIdx >= blanks.length) return;
    const expected = letters[currentBlank].toLowerCase();
    if (letter.toLowerCase() === expected) {
      beep('ok');
      const newFilled = { ...filled, [currentBlank]: letters[currentBlank] };
      setFilled(newFilled);
      if (currentIdx + 1 >= blanks.length) {
        setTimeout(() => onComplete(errors === 0), 500);
      } else {
        setCurrentIdx(i => i + 1);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }, [currentIdx, blanks, currentBlank, filled, letters, errors, onComplete]);

  // Build letter options
  const [options] = useState(() => {
    const needed = new Set(blanks.map(i => letters[i].toLowerCase()));
    const extra = 'abcdefghijlmnopqrstuvxz'.split('').filter(l => !needed.has(l));
    const opts = [...needed, ...shuffle(extra).slice(0, Math.max(4, 8 - needed.size))];
    return shuffle(opts);
  });

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>
        Complete a palavra!
      </div>
      <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 8 }}>{act.emoji}</div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
        <Lightbulb size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{act.hint}
      </p>

      {/* Word display */}
      <div className={shake ? 'animate-shake' : ''} style={{
        display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18,
      }}>
        {letters.map((l, i) => {
          const isBlank = blanks.includes(i);
          const isFilled = filled[i] !== undefined;
          const isCurrent = i === currentBlank && !isFilled;
          return (
            <div key={i} style={{
              width: 42, height: 48, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800,
              border: `2.5px ${isBlank && !isFilled ? 'dashed' : 'solid'} ${isCurrent ? 'var(--feedback-current)' : isFilled || !isBlank ? 'var(--feedback-ok)' : 'var(--neutral-200)'}`,
              background: isCurrent ? 'var(--feedback-current-light)' : isFilled || !isBlank ? 'var(--feedback-ok-light)' : '#fff',
              color: 'var(--color-text)',
              transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s',
            }}>
              {isBlank ? (filled[i] || '') : l.toUpperCase()}
            </div>
          );
        })}
      </div>

      {/* Letter options */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {options.map((l, i) => (
          <button
            key={`${l}-${i}`}
            onClick={() => handleTap(l)}
            style={{
              width: 48, height: 48, borderRadius: 14,
              border: '2px solid var(--color-border)',
              background: '#fff', fontSize: 20, fontWeight: 800,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)',
              minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Pick Letter (tap images that start with letter) ─────────

function PickLetterGame({ act, cardStyle, titleStyle, onComplete }: GameProps<PickLetterActivity>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState(0);
  const correctCount = act.options.filter(o => o.correct).length;
  const foundCount = [...selected].filter(w => act.options.find(o => o.word === w)?.correct).length;

  function handleTap(opt: typeof act.options[0]) {
    if (selected.has(opt.word)) return;
    if (opt.correct) {
      beep('ok');
      const next = new Set(selected).add(opt.word);
      setSelected(next);
      const newFound = [...next].filter(w => act.options.find(o => o.word === w)?.correct).length;
      if (newFound >= correctCount) {
        setTimeout(() => onComplete(errors === 0), 600);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      setWrong(prev => new Set(prev).add(opt.word));
      setTimeout(() => setWrong(prev => { const n = new Set(prev); n.delete(opt.word); return n; }), 600);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>
        <CaseSensitive size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Toque nas imagens que começam com a letra:
      </div>
      <div style={{
        textAlign: 'center', fontSize: 56, fontWeight: 900,
        color: 'var(--color-primary)', marginBottom: 14,
        textShadow: '0 2px 8px rgba(126,111,212,0.3)',
      }}>
        {act.letter.toUpperCase()}
      </div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
        Encontre {correctCount} imagem{correctCount > 1 ? 'ns' : ''} ({foundCount}/{correctCount})
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(act.options.length, 3)}, 1fr)`,
        gap: 10,
      }}>
        {act.options.map((opt) => {
          const isSelected = selected.has(opt.word);
          const isWrong = wrong.has(opt.word);
          const isCorrectSelected = isSelected && opt.correct;
          return (
            <button
              key={opt.word}
              onClick={() => handleTap(opt)}
              disabled={isSelected}
              style={{
                padding: '14px 8px', borderRadius: 18,
                border: `3px solid ${isCorrectSelected ? 'var(--feedback-ok)' : isWrong ? 'var(--feedback-error)' : 'var(--color-border)'}`,
                background: isCorrectSelected ? 'var(--feedback-ok-light)' : isWrong ? 'var(--feedback-error-light)' : '#fff',
                cursor: isSelected ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.2s',
                transform: isWrong ? 'scale(0.95)' : isCorrectSelected ? 'scale(1.05)' : 'scale(1)',
                opacity: isSelected && !opt.correct ? 0.4 : 1,
                minHeight: 'var(--touch-min)',
              }}
            >
              <span style={{ fontSize: 36 }}>{opt.emoji}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: isCorrectSelected ? 'var(--feedback-ok-dark)' : 'var(--color-text)',
              }}>
                {opt.word}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Match Pairs (tap word → tap image) ──────────────────────

function MatchPairsGame({ act, cardStyle, titleStyle, onComplete }: GameProps<MatchPairsActivity>) {
  const [shuffledEmojis] = useState(() => shuffle(act.pairs.map(p => ({ ...p }))));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongEmoji, setWrongEmoji] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);

  function handleWordTap(word: string) {
    if (matched.has(word)) return;
    setSelectedWord(word === selectedWord ? null : word);
  }

  function handleEmojiTap(pair: { word: string; emoji: string }) {
    if (!selectedWord || matched.has(pair.word)) return;
    if (selectedWord === pair.word) {
      beep('ok');
      const next = new Set(matched).add(pair.word);
      setMatched(next);
      setSelectedWord(null);
      if (next.size >= act.pairs.length) {
        setTimeout(() => onComplete(errors === 0), 500);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      setWrongEmoji(pair.word);
      setTimeout(() => setWrongEmoji(null), 500);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={titleStyle}><Link size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Ligue as palavras às imagens!</div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
        Toque na palavra, depois na imagem certa ({matched.size}/{act.pairs.length})
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Words column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {act.pairs.map(p => {
            const isMatched = matched.has(p.word);
            const isSelected = selectedWord === p.word;
            return (
              <button
                key={p.word}
                onClick={() => handleWordTap(p.word)}
                disabled={isMatched}
                style={{
                  padding: '12px 8px', borderRadius: 14, fontWeight: 800, fontSize: 15,
                  border: `2.5px solid ${isMatched ? 'var(--feedback-ok)' : isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: isMatched ? 'var(--feedback-ok-light)' : isSelected ? 'var(--color-primary)' + '15' : '#fff',
                  color: isMatched ? 'var(--feedback-ok-dark)' : isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                  cursor: isMatched ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  minHeight: 'var(--touch-min)',
                }}
              >
                {isMatched ? '✓ ' : ''}{p.word}
              </button>
            );
          })}
        </div>

        {/* Emojis column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shuffledEmojis.map(p => {
            const isMatched = matched.has(p.word);
            const isWrong = wrongEmoji === p.word;
            return (
              <button
                key={`e-${p.word}`}
                onClick={() => handleEmojiTap(p)}
                disabled={isMatched}
                style={{
                  padding: '10px 8px', borderRadius: 14,
                  border: `2.5px solid ${isMatched ? 'var(--feedback-ok)' : isWrong ? 'var(--feedback-error)' : 'var(--color-border)'}`,
                  background: isMatched ? 'var(--feedback-ok-light)' : isWrong ? 'var(--feedback-error-light)' : '#fff',
                  cursor: isMatched ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, transition: 'all 0.2s',
                  transform: isWrong ? 'scale(0.9)' : 'scale(1)',
                  opacity: isMatched ? 0.6 : 1,
                  minHeight: 'var(--touch-min)',
                }}
              >
                {p.emoji}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Pick Syllable ───────────────────────────────────────────

function PickSyllableGame({ act, cardStyle, titleStyle, onComplete }: GameProps<PickSyllableActivity>) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledOptions] = useState(() => shuffle(act.options));

  function handlePick(syl: string) {
    if (selected) return;
    setSelected(syl);
    const correct = syl === act.syllables[act.missingIndex];
    setIsCorrect(correct);
    beep(correct ? 'ok' : 'no');
    setTimeout(() => onComplete(correct), 800);
  }

  return (
    <div style={cardStyle}>
      <div style={titleStyle}><Puzzle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Qual sílaba completa a palavra?</div>
      <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 8 }}>{act.emoji}</div>

      {/* Syllable display */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {act.syllables.map((syl, i) => {
          const isMissing = i === act.missingIndex;
          const filled = isMissing && selected && isCorrect;
          return (
            <div key={i} style={{
              padding: '10px 16px', borderRadius: 14, fontWeight: 800, fontSize: 22,
              border: `2.5px ${isMissing && !filled ? 'dashed' : 'solid'} ${filled ? 'var(--feedback-ok)' : isMissing ? 'var(--feedback-current)' : 'var(--color-primary)'}`,
              background: filled ? 'var(--feedback-ok-light)' : isMissing ? 'var(--feedback-current-light)' : 'var(--color-primary)' + '12',
              color: isMissing && !filled ? 'var(--feedback-current)' : 'var(--color-text)',
              minWidth: 48, textAlign: 'center',
            }}>
              {isMissing ? (isCorrect ? syl : '?') : syl}
            </div>
          );
        })}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {shuffledOptions.map(syl => {
          const isThis = selected === syl;
          const correct = syl === act.syllables[act.missingIndex];
          return (
            <button
              key={syl}
              onClick={() => handlePick(syl)}
              disabled={!!selected}
              style={{
                padding: '14px 10px', borderRadius: 16, fontWeight: 800, fontSize: 20,
                border: `2.5px solid ${isThis ? (correct ? 'var(--feedback-ok)' : 'var(--feedback-error)') : selected && correct ? 'var(--feedback-ok)' : 'var(--color-border)'}`,
                background: isThis ? (correct ? 'var(--feedback-ok-light)' : 'var(--feedback-error-light)') : selected && correct ? 'var(--feedback-ok-light)' : '#fff',
                color: isThis ? (correct ? 'var(--feedback-ok-dark)' : 'var(--feedback-error-dark)') : 'var(--color-text)',
                cursor: selected ? 'default' : 'pointer',
                transition: 'all 0.2s',
                minHeight: 'var(--touch-min)',
              }}
            >
              {syl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Pick Vowels ─────────────────────────────────────────────

function PickVowelsGame({ act, cardStyle, titleStyle, onComplete }: GameProps<PickVowelsActivity>) {
  const letters = act.word.toUpperCase().split('');
  const vowels = new Set('AEIOUÁÀÂÃÉÊÍÓÔÕÚ'.split(''));
  const vowelIndices = letters.map((l, i) => vowels.has(l) ? i : -1).filter(i => i >= 0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);

  function handleTap(idx: number) {
    if (found.has(idx)) return;
    if (vowelIndices.includes(idx)) {
      beep('ok');
      const next = new Set(found).add(idx);
      setFound(next);
      if (next.size >= vowelIndices.length) {
        setTimeout(() => onComplete(errors === 0), 500);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
    }
  }

  return (
    <div style={cardStyle}>
      <div style={titleStyle}><Circle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Toque nas vogais da palavra!</div>
      <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 8 }}>{act.emoji}</div>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-2)', marginBottom: 14 }}>
        Encontre {vowelIndices.length} vogai{vowelIndices.length > 1 ? 's' : ''} ({found.size}/{vowelIndices.length})
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {letters.map((l, i) => {
          const isFound = found.has(i);
          const isWrong = wrongIdx === i;
          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              disabled={isFound}
              style={{
                width: 52, height: 56, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 900,
                border: `3px solid ${isFound ? 'var(--feedback-ok)' : isWrong ? 'var(--feedback-error)' : 'var(--color-border)'}`,
                background: isFound ? 'var(--feedback-ok-light)' : isWrong ? 'var(--feedback-error-light)' : '#fff',
                color: isFound ? 'var(--feedback-ok-dark)' : isWrong ? 'var(--feedback-error-dark)' : 'var(--color-text)',
                cursor: isFound ? 'default' : 'pointer',
                transition: 'all 0.2s',
                transform: isWrong ? 'scale(0.9)' : isFound ? 'scale(1.05)' : 'scale(1)',
                minWidth: 'var(--touch-min)', minHeight: 'var(--touch-min)',
              }}
            >
              {l}
              {isFound && <span style={{ position: 'absolute', fontSize: 10, bottom: 2 }}>vogal</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Sentence ──────────────────────────────────────────

function OrderSentenceGame({ act, cardStyle, titleStyle, onComplete }: GameProps<OrderSentenceActivity>) {
  const correctWords = act.sentence.split(' ');
  const [shuffled] = useState(() => shuffle(correctWords.map((w, i) => ({ word: w, id: i }))));
  const [placed, setPlaced] = useState<{ word: string; id: number }[]>([]);
  const [wrong, setWrong] = useState(false);
  const [errors, setErrors] = useState(0);

  const remaining = shuffled.filter(w => !placed.find(p => p.id === w.id));

  function handlePlace(item: { word: string; id: number }) {
    const nextIdx = placed.length;
    if (item.word.toLowerCase() === correctWords[nextIdx].toLowerCase()) {
      beep('ok');
      const next = [...placed, item];
      setPlaced(next);
      if (next.length >= correctWords.length) {
        setTimeout(() => onComplete(errors === 0), 600);
      }
    } else {
      beep('no');
      setErrors(e => e + 1);
      setWrong(true);
      setTimeout(() => setWrong(false), 400);
    }
  }

  function handleRemoveLast() {
    if (placed.length > 0) {
      setPlaced(prev => prev.slice(0, -1));
    }
  }

  return (
    <div style={cardStyle}>
      <div style={titleStyle}><FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Coloque as palavras na ordem certa!</div>

      {/* Sentence area */}
      <div className={wrong ? 'animate-shake' : ''} style={{
        minHeight: 56, padding: '12px 14px', borderRadius: 16,
        border: '2px dashed var(--color-border)',
        background: 'var(--neutral-50)',
        marginBottom: 16,
        display: 'flex', gap: 8, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {placed.map((item) => (
          <span key={`p-${item.id}`} style={{
            padding: '8px 14px', borderRadius: 12,
            background: 'var(--feedback-ok-light)',
            border: '2px solid var(--feedback-ok)',
            fontWeight: 700, fontSize: 16, color: 'var(--feedback-ok-dark)',
            animation: 'pop 0.2s ease both',
          }}>
            {item.word}
          </span>
        ))}
        {placed.length < correctWords.length && (
          <span style={{
            padding: '8px 14px', borderRadius: 12,
            border: '2px dashed var(--feedback-current)',
            background: 'var(--feedback-current-light)',
            fontWeight: 600, fontSize: 14, color: 'var(--feedback-current)',
          }}>
            ?
          </span>
        )}
        {placed.length > 0 && (
          <button
            onClick={handleRemoveLast}
            style={{
              marginLeft: 'auto',
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--feedback-error-light)',
              border: '1.5px solid var(--feedback-error)',
              color: 'var(--feedback-error-dark)',
              fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Desfazer"
          >
            ⌫
          </button>
        )}
      </div>

      {/* Word options */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {remaining.map(item => (
          <button
            key={`r-${item.id}`}
            onClick={() => handlePlace(item)}
            style={{
              padding: '12px 18px', borderRadius: 14,
              border: '2.5px solid var(--color-primary)',
              background: '#fff',
              fontWeight: 700, fontSize: 16,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              minHeight: 'var(--touch-min)',
            }}
          >
            {item.word}
          </button>
        ))}
      </div>
    </div>
  );
}
