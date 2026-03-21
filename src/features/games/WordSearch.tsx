import { useState, useRef, useCallback } from 'react';
import { words as allWords } from '../../shared/data/words';
import type { Word } from '../../shared/data/words';
import { shuffle } from '../../shared/utils/helpers';
import { beep, speak } from '../../shared/utils/audio';
import { getTheme } from '../../shared/data/gameThemes';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import LucideIcon from '../../shared/components/ui/LucideIcon';
import DoneCard from '../../shared/components/feedback/DoneCard';
import type { GameComponentProps } from '../../shared/types';
import { getAllPuzzles } from '../../shared/data/customWordSearchPuzzles';
import type { WordSearchPuzzle, PuzzleWord } from './wordSearchPuzzles';

type Props = Omit<GameComponentProps, 'rounds'>;

// ── Grid types ────────────────────────────────────────────────────────────────

const GRID_SIZE = 10;
const WORD_COUNT = 6;
const DIRECTIONS = [
  { dr: 0, dc: 1 },  // horizontal →
  { dr: 1, dc: 0 },  // vertical ↓
  { dr: 1, dc: 1 },  // diagonal ↘
] as const;

type Dir = (typeof DIRECTIONS)[number];

interface GridWord {
  word: string;
  emoji: string;
}

interface PlacedWord {
  item: GridWord;
  row: number;
  col: number;
  dir: Dir;
  cells: [number, number][];
}

// ── Normalize letters for grid (remove accents) ───────────────────────────────
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const PT_LETTERS = 'abcdefghijlmnoprstuvz';

function randomLetter() {
  return PT_LETTERS[Math.floor(Math.random() * PT_LETTERS.length)];
}

// ── Build grid ────────────────────────────────────────────────────────────────

function buildGrid(items: GridWord[]): { grid: string[][]; placed: PlacedWord[] } {
  const selected = items.slice(0, WORD_COUNT);
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('')
  );
  const placed: PlacedWord[] = [];

  for (const item of selected) {
    const letters = normalize(item.word).split('');
    const len = letters.length;
    let placedOk = false;

    for (let attempt = 0; attempt < 200 && !placedOk; attempt++) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const maxRow = GRID_SIZE - (dir.dr > 0 ? len - 1 : 0);
      const maxCol = GRID_SIZE - (dir.dc > 0 ? len - 1 : 0);
      if (maxRow <= 0 || maxCol <= 0) continue;
      const row = Math.floor(Math.random() * maxRow);
      const col = Math.floor(Math.random() * maxCol);

      let fits = true;
      const cells: [number, number][] = [];
      for (let i = 0; i < len; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;
        if (r >= GRID_SIZE || c >= GRID_SIZE) { fits = false; break; }
        const existing = grid[r][c];
        if (existing && existing !== letters[i]) { fits = false; break; }
        cells.push([r, c]);
      }

      if (fits) {
        cells.forEach(([r, c], i) => { grid[r][c] = letters[i]; });
        placed.push({ item, row, col, dir, cells });
        placedOk = true;
      }
    }
  }

  // Fill empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = randomLetter();
    }
  }

  return { grid, placed };
}

function wordsFromPool(pool: readonly Word[]): GridWord[] {
  return shuffle([...pool]).slice(0, WORD_COUNT).map(w => ({ word: w.word, emoji: w.emoji }));
}

function wordsFromPuzzle(puzzle: WordSearchPuzzle): GridWord[] {
  return shuffle([...puzzle.words]).map((pw: PuzzleWord) => ({ word: pw.word, emoji: pw.emoji }));
}

// ── Cell key helper ───────────────────────────────────────────────────────────
function cellKey(r: number, c: number) { return `${r},${c}`; }

// ── Check if selection is a straight line ────────────────────────────────────
function getLine(a: [number, number], b: [number, number]): [number, number][] | null {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  if (dr === 0 && dc === 0) return [a];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
  const cells: [number, number][] = [];
  for (let i = 0; i < len; i++) {
    cells.push([a[0] + stepR * i, a[1] + stepC * i]);
  }
  return cells;
}

// ── Colors ────────────────────────────────────────────────────────────────────
const FOUND_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF922B', '#CC5DE8',
];

// ── Puzzle Picker ────────────────────────────────────────────────────────────

interface PickerProps {
  onPick: (puzzle: WordSearchPuzzle | null) => void;
  theme: ReturnType<typeof getTheme>;
  onBack: () => void;
}

function PuzzlePicker({ onPick, theme, onBack }: PickerProps) {
  const allPuzzles = getAllPuzzles();
  return (
    <div className="ds-screen" style={{ overflowY: 'auto' }}>
      <ScreenHeader
        icon={<LucideIcon name={theme.icon} size={20} />}
        title={theme.label}
        onBack={onBack}
        gradient={theme.gradient}
      />
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 15, margin: 0 }}>
          Escolha um tema ou jogue com palavras aleatórias!
        </p>

        {/* Random mode */}
        <button
          onClick={() => onPick(null)}
          style={{
            padding: '14px 20px',
            borderRadius: 14,
            border: `2px solid ${theme.color}`,
            background: theme.gradient,
            color: theme.textColor,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 28 }}>🎲</span>
          <div style={{ textAlign: 'left' }}>
            <div>Aleatório</div>
            <div style={{ fontWeight: 400, fontSize: 13 }}>Palavras sortidas do banco</div>
          </div>
        </button>

        {/* Preset puzzles */}
        {allPuzzles.map(puzzle => (
          <button
            key={puzzle.id}
            onClick={() => onPick(puzzle)}
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              border: '2px solid #e0e0e0',
              background: '#fff',
              color: '#333',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 32 }}>{puzzle.emoji}</span>
            <div style={{ textAlign: 'left' }}>
              <div>{puzzle.title}</div>
              <div style={{ fontWeight: 400, fontSize: 13, color: '#777' }}>{puzzle.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function WordSearch({ onBack, wordPool, onComplete }: Props) {
  const theme = getTheme('cacapalavras');
  const pool = wordPool ?? allWords;

  // null = picker visible, WordSearchPuzzle | 'random' = puzzle selected
  const [selectedPuzzle, setSelectedPuzzle] = useState<WordSearchPuzzle | 'random' | null>(
    // If a wordPool was provided externally, skip picker and go random
    wordPool ? 'random' : null
  );

  function handlePick(puzzle: WordSearchPuzzle | null) {
    setSelectedPuzzle(puzzle ?? 'random');
  }

  if (selectedPuzzle === null) {
    return <PuzzlePicker onPick={handlePick} theme={theme} onBack={onBack} />;
  }

  const puzzleWords: GridWord[] =
    selectedPuzzle === 'random'
      ? wordsFromPool(pool)
      : wordsFromPuzzle(selectedPuzzle);

  const title =
    selectedPuzzle === 'random'
      ? theme.label
      : `${selectedPuzzle.emoji} ${selectedPuzzle.title}`;

  const description =
    selectedPuzzle === 'random'
      ? 'Encontre as palavras escondidas!'
      : selectedPuzzle.description;

  return (
    <GameBoard
      puzzleWords={puzzleWords}
      title={title}
      description={description}
      theme={theme}
      onBack={onBack}
      onComplete={onComplete}
      onRestart={() => setSelectedPuzzle(null)}
    />
  );
}

// ── Game Board ────────────────────────────────────────────────────────────────

interface BoardProps {
  puzzleWords: GridWord[];
  title: string;
  description: string;
  theme: ReturnType<typeof getTheme>;
  onBack: () => void;
  onComplete?: (errors: number) => void;
  onRestart: () => void;
}

function GameBoard({ puzzleWords, title, description, theme, onBack, onComplete, onRestart }: BoardProps) {
  const [{ grid, placed }, setBoard] = useState(() => buildGrid(puzzleWords));
  const [found, setFound] = useState<Set<string>>(new Set()); // word string
  const [foundColors, setFoundColors] = useState<Record<string, string>>({}); // word → color
  const [cellFoundColor, setCellFoundColor] = useState<Record<string, string>>({}); // cellKey → color

  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const totalWords = placed.length;
  const foundCount = found.size;

  function checkSelection(cells: [number, number][]) {
    if (!cells || cells.length < 2) return;
    const selStr = cells.map(([r, c]) => cellKey(r, c)).join('|');

    for (const pw of placed) {
      if (found.has(pw.item.word)) continue;
      const pwStr = pw.cells.map(([r, c]) => cellKey(r, c)).join('|');
      const pwStrRev = [...pw.cells].reverse().map(([r, c]) => cellKey(r, c)).join('|');

      if (selStr === pwStr || selStr === pwStrRev) {
        const color = FOUND_COLORS[found.size % FOUND_COLORS.length];
        const newFound = new Set([...found, pw.item.word]);
        setFound(newFound);
        setFoundColors(prev => ({ ...prev, [pw.item.word]: color }));
        const newCellColors: Record<string, string> = {};
        pw.cells.forEach(([r, c]) => { newCellColors[cellKey(r, c)] = color; });
        setCellFoundColor(prev => ({ ...prev, ...newCellColors }));
        beep('ok');
        speak(pw.item.word);

        if (newFound.size === totalWords) {
          setDone(true);
          beep('yay');
          if (onComplete) onComplete(errors);
        }
        return;
      }
    }
    beep('no');
    setErrors(e => e + 1);
  }

  function cellFromPointer(e: React.PointerEvent): [number, number] | null {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el) return null;
    const r = parseInt(el.dataset.row ?? '');
    const c = parseInt(el.dataset.col ?? '');
    if (isNaN(r) || isNaN(c)) return null;
    return [r, c];
  }

  const handlePointerDown = useCallback((r: number, c: number) => {
    setStart([r, c]);
    setEnd([r, c]);
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const cell = cellFromPointer(e);
    if (cell) setEnd(cell);
  }, [dragging]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (start && end) {
      const line = getLine(start, end);
      if (line && line.length >= 2) checkSelection(line);
    }
    setStart(null);
    setEnd(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, start, end, placed, found]);

  function restart() {
    setBoard(buildGrid(puzzleWords));
    setFound(new Set());
    setFoundColors({});
    setCellFoundColor({});
    setErrors(0);
    setDone(false);
    setStart(null);
    setEnd(null);
  }

  const selection = start && end ? getLine(start, end) : start ? [start] : [];
  const selectionKeys = new Set((selection ?? []).map(([r, c]) => cellKey(r, c)));
  const cellSize = Math.min(34, Math.floor((Math.min(typeof window !== 'undefined' ? window.innerWidth : 400, 400) - 32) / GRID_SIZE));

  return (
    <div className="ds-screen" style={{ overflowY: 'auto', userSelect: 'none' }}>
      <ScreenHeader
        icon={<LucideIcon name={theme.icon} size={20} />}
        title={title}
        onBack={onBack}
        gradient={theme.gradient}
      />

      {done ? (
        <DoneCard
          score={{ correct: totalWords, total: totalWords }}
          onBack={onBack}
          onNext={() => { restart(); onRestart(); }}
        />
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* Enunciado */}
          <p style={{ margin: 0, fontSize: 14, color: '#666', textAlign: 'center' }}>{description}</p>

          {/* Progress */}
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.color }}>
            {foundCount} / {totalWords} palavras encontradas
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
              gap: 2,
              touchAction: 'none',
              background: '#f0f0f0',
              borderRadius: 12,
              padding: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const key = cellKey(r, c);
                const isSelected = selectionKeys.has(key);
                const foundColor = cellFoundColor[key];
                const bg = foundColor ? foundColor : isSelected ? theme.color : '#fff';
                const color = foundColor || isSelected ? '#fff' : '#333';

                return (
                  <div
                    key={key}
                    data-row={r}
                    data-col={c}
                    onPointerDown={() => handlePointerDown(r, c)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: bg,
                      color,
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: cellSize * 0.48,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      boxShadow: isSelected ? `0 0 0 2px ${theme.color}` : undefined,
                    }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>

          {/* Word list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', width: '100%' }}>
            {placed.map(pw => {
              const isFound = found.has(pw.item.word);
              const color = foundColors[pw.item.word] ?? '#ccc';
              return (
                <button
                  key={pw.item.word}
                  onClick={() => speak(pw.item.word)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: `2px solid ${isFound ? color : '#ddd'}`,
                    background: isFound ? color : '#f9f9f9',
                    color: isFound ? '#fff' : '#555',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    textDecoration: isFound ? 'line-through' : 'none',
                    opacity: isFound ? 0.85 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{pw.item.emoji}</span>
                  <span>{pw.item.word}</span>
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Arraste para selecionar as letras
          </p>
        </div>
      )}
    </div>
  );
}
