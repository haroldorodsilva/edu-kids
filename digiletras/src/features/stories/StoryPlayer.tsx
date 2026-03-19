import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllStories } from '../../shared/data/customStories';
import { speak, beep } from '../../shared/utils/audio';
import { isTouchDevice } from '../../shared/utils/device';
import { useKeyboardInput } from '../../shared/hooks/useKeyboardInput';
import DoneCard from '../../shared/components/feedback/DoneCard';
import ProgressBar from '../../shared/components/feedback/ProgressBar';
import OnScreenKeyboard from '../../shared/components/ui/OnScreenKeyboard';

interface Props {
  storyId: string;
  mode: 'typing' | 'dictation';
  onBack: () => void;
  onComplete?: (errors: number) => void;
}

export default function StoryPlayer({ storyId, mode, onBack, onComplete }: Props) {
  const story = getAllStories().find(s => s.id === storyId)!;
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [typed, setTyped] = useState<(string | null)[]>([]);
  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTouch = isTouchDevice();

  const sentence = story.sentences[sentenceIdx];
  const currentPos = typed.length;

  // Calcula o índice da palavra atual baseado na posição do cursor
  function getWordRanges(s: string): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    let start = 0;
    for (let i = 0; i <= s.length; i++) {
      if (i === s.length || s[i] === ' ') {
        if (i > start) ranges.push({ start, end: i - 1 });
        start = i + 1;
      }
    }
    return ranges;
  }
  const wordRanges = getWordRanges(sentence);
  const currentWordIdx = wordRanges.findIndex(r => currentPos >= r.start && currentPos <= r.end);

  useEffect(() => {
    setTyped([]);
    setRevealed(false);
    if (mode === 'typing') speak(sentence);
    if (!isTouch) inputRef.current?.focus();
  }, [sentenceIdx, sentence, mode, isTouch]);

  const handleChar = useCallback((ch: string) => {
    if (ch.length !== 1) return;
    const expected = sentence[currentPos];
    if (!expected) return;

    if (ch.toLowerCase() === expected.toLowerCase() || (ch === ' ' && expected === ' ')) {
      beep('ok');
      setFeedback('ok');
      setTyped(prev => [...prev, sentence[currentPos]]);
      setTotalCorrect(c => c + 1);
      if (currentPos + 1 === sentence.length) {
        setTimeout(() => {
          setFeedback(null);
          if (sentenceIdx + 1 >= story.sentences.length) {
            if (onComplete) {
              onComplete(totalErrors);
            } else {
              setDone(true);
            }
          } else {
            setSentenceIdx(i => i + 1);
          }
        }, 1500);
      } else {
        setTimeout(() => setFeedback(null), 200);
      }
    } else {
      beep('no');
      setFeedback('no');
      setShake(true);
      setTotalErrors(e => e + 1);
      setTimeout(() => { setShake(false); setFeedback(null); }, 350);
    }
  }, [sentence, currentPos, sentenceIdx, story.sentences.length, totalErrors, onComplete]);

  // Teclado físico (desktop) via hook centralizado
  useKeyboardInput({ onChar: handleChar, active: !isTouch });

  if (done) return (
    <DoneCard
      score={{ correct: totalCorrect, total: totalCorrect + totalErrors }}
      onBack={onBack}
    />
  );

  return (
    <div className="min-h-screen p-4 flex flex-col" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #667eea 100%)' }}>
      <ProgressBar current={sentenceIdx} total={story.sentences.length} color="#1565C0" />
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="text-blue-900 text-2xl font-bold">←</button>
        <span className="text-4xl">{story.emoji}</span>
        <h1 className="text-xl font-bold text-blue-900">{story.title}</h1>
      </div>

      {mode === 'dictation' && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => speak(sentence)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
          >
            🔊 Ouvir
          </button>
          <button
            onClick={() => setRevealed(r => !r)}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl font-bold"
          >
            👀 Espiar
          </button>
        </div>
      )}

      {!isTouch && <input ref={inputRef} className="opacity-0 absolute" readOnly />}

      <div className={`flex flex-wrap gap-1 mb-4 ${shake ? 'animate-shake' : ''}`}>
        {sentence.split('').map((char, i) => {
          const isCurrent = i === typed.length;
          const isDone = i < typed.length;
          const isSpace = char === ' ';
          const showChar = !isSpace && (isDone || (mode === 'typing') || revealed);
          // Descobre se esta letra está na palavra atual
          const charWordIdx = wordRanges.findIndex(r => i >= r.start && i <= r.end);
          const isInCurrentWord = charWordIdx === currentWordIdx && !isDone;
          return (
            <div
              key={i}
              className="flex items-center justify-center font-bold transition-all duration-200"
              style={{
                width: isSpace ? 12 : 28,
                height: 36,
                borderRadius: 8,
                fontSize: 18,
                backgroundColor: isSpace ? 'transparent'
                  : isDone ? '#C8E6C9'
                  : isCurrent ? '#FFF3E0'
                  : isInCurrentWord ? '#FFF9C4'
                  : mode === 'dictation' && !revealed ? '#E3F2FD'
                  : 'white',
                borderBottom: isSpace ? 'none' : `3px solid ${isDone ? '#4CAF50' : isCurrent ? '#FF9800' : isInCurrentWord ? '#FFC107' : '#90CAF9'}`,
                transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                color: isDone ? '#2E7D32' : '#333',
              }}
            >
              {showChar ? char : (isSpace ? '' : mode === 'dictation' && !revealed ? '?' : char)}
            </div>
          );
        })}
      </div>

      <p className="text-blue-600 text-sm mb-3">
        Frase {sentenceIdx + 1} de {story.sentences.length} • Erros: {totalErrors}
      </p>

      {isTouch && (
        <OnScreenKeyboard
          onKey={handleChar}
          showSpace={true}
          lastFeedback={feedback}
        />
      )}
    </div>
  );
}
