import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paintbrush, PaintBucket, Eraser, Undo2, Redo2, Sparkles,
  Check, ChevronRight, Minus, Plus,
} from 'lucide-react';
import { beep } from '../../shared/utils/audio';
import { getColoringSheets, type ColoringSheet } from '../../shared/data/coloringSheets';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import LucideIcon from '../../shared/components/ui/LucideIcon';
import type { GameComponentProps } from '../../shared/types';

type Props = Pick<GameComponentProps, 'onBack' | 'onComplete'>;

type PaintMode = 'bucket' | 'brush' | 'eraser';

const PALETTE = [
  '#F44336', '#E91E63', '#FF4081', '#FF8A80',
  '#FF6D00', '#FF9100', '#FFC400', '#FFD740',
  '#00C853', '#69F0AE', '#00BFA5', '#1DE9B6',
  '#2979FF', '#40C4FF', '#AA00FF', '#EA80FC',
  '#795548', '#BCAAA4', '#FFCCBC', '#FFF9C4',
  '#FFFFFF', '#E0E0E0', '#757575', '#212121',
];

const STICKERS = ['⭐', '❤️', '🌈', '🦋', '🌸', '🎈', '✨', '🌟'];

const theme = getTheme('coloring');

// Paintbrush SVG cursor
function buildCursor(color: string, size: number): string {
  const r = Math.max(4, size / 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r * 2 + 4}" height="${r * 2 + 4}" viewBox="0 0 ${r * 2 + 4} ${r * 2 + 4}">
    <circle cx="${r + 2}" cy="${r + 2}" r="${r}" fill="${color}" fill-opacity="0.6" stroke="#222" stroke-width="1.5"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${r + 2} ${r + 2}, crosshair`;
}

function buildBucketCursor(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <path d="M 32 2 Q 26 8 20 16" stroke="#6B3A2A" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M 31 3 Q 25 9 19 17" stroke="#C47F4A" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M 17 15 L 22 20" stroke="#AAAAAA" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M 17 15 L 22 20" stroke="#DDDDDD" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M 13 21 Q 9 23 6 28 Q 10 33 16 31 Q 21 27 19 21 Z" fill="${color}" stroke="#222222" stroke-width="1.5"/>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 6 28, crosshair`;
}

// ── Flood fill for PNG/Canvas ─────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  fillColor: string,
  tolerance = 40,
  outlineThreshold = 80,
) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const [fr, fg, fb] = hexToRgb(fillColor);

  function idx(x: number, y: number) { return (y * width + x) * 4; }
  function luminance(i: number) {
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const si = idx(startX, startY);
  if (luminance(si) < outlineThreshold) return;

  const [sr, sg, sb] = [data[si], data[si + 1], data[si + 2]];
  if (colorDistance(sr, sg, sb, fr, fg, fb) < 5) return;

  const visited = new Uint8Array(width * height);
  const queue: number[] = [startX + startY * width];
  visited[startX + startY * width] = 1;

  while (queue.length > 0) {
    const pos = queue.pop()!;
    const x = pos % width;
    const y = (pos - x) / width;
    const i = pos * 4;

    if (luminance(i) < outlineThreshold) continue;
    if (colorDistance(data[i], data[i + 1], data[i + 2], sr, sg, sb) > tolerance) continue;

    data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;

    if (x > 0         && !visited[pos - 1])      { visited[pos - 1] = 1;      queue.push(pos - 1); }
    if (x < width - 1 && !visited[pos + 1])      { visited[pos + 1] = 1;      queue.push(pos + 1); }
    if (y > 0         && !visited[pos - width])   { visited[pos - width] = 1;  queue.push(pos - width); }
    if (y < height - 1 && !visited[pos + width]) { visited[pos + width] = 1;  queue.push(pos + width); }
  }

  ctx.putImageData(imageData, 0, 0);
}


// ── SVG coloring (path click → set fill) with undo support ───────────────────

interface UndoEntry {
  element: SVGElement;
  prevFill: string;
}

function useSvgColoring(
  sheet: ColoringSheet | undefined,
  containerRef: React.RefObject<HTMLDivElement | null>,
  selectedColorRef: React.RefObject<string>,
  modeRef: React.RefObject<PaintMode>,
  onPaint: () => void,
  pushUndo: (entry: UndoEntry) => void,
) {
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !sheet || sheet.type !== 'svg' || !sheet.svgContent) return;

    node.innerHTML = sheet.svgContent;
    const svg = node.querySelector('svg');
    if (!svg) return;

    svg.setAttribute('width', '100%');
    svg.removeAttribute('height');
    svg.style.cssText = 'display:block; width:100%; max-height:62vh;';

    const vb = (svg.getAttribute('viewBox') ?? '0 0 100 100').split(/[\s,]+/).map(Number);
    const [vx, vy, vw, vh] = [vb[0] ?? 0, vb[1] ?? 0, vb[2] ?? 100, vb[3] ?? 100];
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', String(vx));
    bgRect.setAttribute('y', String(vy));
    bgRect.setAttribute('width', String(vw));
    bgRect.setAttribute('height', String(vh));
    bgRect.setAttribute('fill', 'white');
    bgRect.style.pointerEvents = 'all';
    bgRect.style.transition = 'fill 0.15s ease';
    bgRect.addEventListener('click', (ev: Event) => {
      ev.stopPropagation();
      const mode = modeRef.current;
      const color = mode === 'eraser' ? 'white' : selectedColorRef.current;
      const prevFill = bgRect.getAttribute('fill') ?? 'white';
      pushUndo({ element: bgRect, prevFill });
      bgRect.style.fill = color;
      bgRect.setAttribute('fill', color);
      if (!bgRect.dataset.painted) { bgRect.dataset.painted = '1'; onPaint(); }
      beep('ok');
    });
    svg.insertBefore(bgRect, svg.firstChild);

    const all = Array.from(svg.querySelectorAll('path, circle, ellipse, rect, polygon, polyline'));
    all.forEach(el => {
      const e = el as SVGElement;
      if (e === bgRect) return;
      e.style.pointerEvents = 'all';
      e.style.transition = 'fill 0.15s ease';
      if (e.getAttribute('fill') === 'none' && !e.style.fill) return;

      const handler = (ev: Event) => {
        ev.stopPropagation();
        const mode = modeRef.current;
        const color = mode === 'eraser' ? 'white' : selectedColorRef.current;
        const prevFill = e.getAttribute('fill') ?? e.style.fill ?? 'white';
        pushUndo({ element: e, prevFill });
        e.style.fill = color;
        e.setAttribute('fill', color);
        if (!e.dataset.painted) { e.dataset.painted = '1'; onPaint(); }
        beep('ok');
      };
      e.addEventListener('click', handler);
    });

    return () => { node.innerHTML = ''; };
  }, [sheet?.id]);
}

// ── PNG coloring (canvas flood fill) ─────────────────────────────────────────

function PngColoring({ sheet, selectedColorRef, modeRef, onPaint, cursor, brushSize }: {
  sheet: ColoringSheet;
  selectedColorRef: React.RefObject<string>;
  modeRef: React.RefObject<PaintMode>;
  onPaint: () => void;
  cursor: string;
  brushSize: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sheet.pngUrl) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      setLoaded(true);
    };
    img.src = sheet.pngUrl;
  }, [sheet.id]);

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const mode = modeRef.current;

    if (mode === 'bucket') {
      const { x, y } = getCanvasPos(e);
      const color = selectedColorRef.current;
      floodFill(ctx, x, y, color);
      onPaint();
      beep('ok');
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const mode = modeRef.current;
    if (mode !== 'brush' && mode !== 'eraser') return;
    isDrawing.current = true;
    drawAt(e);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    drawAt(e);
  }

  function handleMouseUp() {
    if (isDrawing.current) {
      isDrawing.current = false;
      onPaint();
    }
  }

  function drawAt(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    const mode = modeRef.current;

    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = mode === 'eraser' ? '#FFFFFF' : selectedColorRef.current;
    ctx.fill();
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-label="Área de pintura"
      className="w-full bg-white"
      style={{
        cursor,
        maxHeight: '62vh',
        display: 'block',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
      }}
    />
  );
}

// ── Sticker overlay ──────────────────────────────────────────────────────────

function StickerOverlay({ stickers }: { stickers: { id: number; emoji: string; x: number; y: number; size: number }[] }) {
  return (
    <>
      {stickers.map(s => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.size,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            animation: 'pop 0.28s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          {s.emoji}
        </span>
      ))}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Coloring({ onBack }: Props) {
  const sheets = getColoringSheets();
  const [sheetIdx, setSheetIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [coloredCount, setColoredCount] = useState(0);
  const [paintMode, setPaintMode] = useState<PaintMode>('bucket');
  const [brushSize, setBrushSize] = useState(8);
  const [showStickers, setShowStickers] = useState(false);
  const [placedStickers, setPlacedStickers] = useState<{ id: number; emoji: string; x: number; y: number; size: number }[]>([]);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [redoStack, setRedoStack] = useState<UndoEntry[]>([]);

  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;
  const modeRef = useRef(paintMode);
  modeRef.current = paintMode;

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const handlePaint = useCallback(() => setColoredCount(c => c + 1), []);

  const pushUndo = useCallback((entry: UndoEntry) => {
    setUndoStack(prev => [...prev, entry]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const currentFill = last.element.getAttribute('fill') ?? 'white';
      setRedoStack(r => [...r, { element: last.element, prevFill: currentFill }]);
      last.element.setAttribute('fill', last.prevFill);
      last.element.style.fill = last.prevFill;
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const currentFill = last.element.getAttribute('fill') ?? 'white';
      setUndoStack(u => [...u, { element: last.element, prevFill: currentFill }]);
      last.element.setAttribute('fill', last.prevFill);
      last.element.style.fill = last.prevFill;
      return prev.slice(0, -1);
    });
  }, []);

  const current = sheets[sheetIdx];

  const cursor = paintMode === 'bucket'
    ? buildBucketCursor(selectedColor)
    : paintMode === 'eraser'
      ? buildCursor('#FFFFFF', brushSize)
      : buildCursor(selectedColor, brushSize);

  useSvgColoring(current, svgContainerRef, selectedColorRef, modeRef, handlePaint, pushUndo);

  function loadSheet(idx: number) {
    setSheetIdx(idx);
    setColoredCount(0);
    setUndoStack([]);
    setRedoStack([]);
    setPlacedStickers([]);
  }

  function handleStickerPlace(e: React.MouseEvent<HTMLDivElement>) {
    if (!activeSticker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlacedStickers(prev => [...prev, { id: Date.now(), emoji: activeSticker, x, y, size: 28 }]);
    beep('ok');
  }

  // Empty state
  if (!current) {
    return (
      <div className="ds-screen" style={{ background: theme.gradient }}>
        <ScreenHeader
          icon={<LucideIcon name={theme.icon} size={20} />}
          title={theme.label}
          onBack={onBack}
          gradient={theme.gradient}
        />
        <div className="flex flex-col items-center justify-center flex-1 text-center"
          style={{ padding: 'var(--spacing-xl)' }}>
          <LucideIcon name="Palette" size={64} color={theme.textColor} />
          <h2 className="text-2xl font-bold" style={{ color: theme.textColor, marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
            Nenhum desenho ainda
          </h2>
          <p style={{ color: theme.color, marginBottom: 'var(--spacing-sm)' }}>
            Coloque arquivos <strong>.svg</strong> ou <strong>.png</strong> em:
          </p>
          <code
            className="ds-badge"
            style={{
              background: `${theme.color}18`,
              color: theme.textColor,
              marginBottom: 'var(--spacing-xl)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            src/assets/paint/
          </code>
          <button onClick={onBack} className="ds-btn ds-btn-primary" style={{ background: theme.gradient }}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameLayout
      gameId="coloring"
      onBack={onBack}
      currentRound={sheetIdx}
      totalRounds={sheets.length}
      done={false}
    >
      {/* Toolbar: tools + undo/redo + paint count */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
      >
        {/* Left: tools */}
        <div className="flex items-center" style={{ gap: 4 }} role="toolbar" aria-label="Ferramentas de pintura">
          {([
            { mode: 'bucket' as PaintMode, Icon: PaintBucket, label: 'Balde' },
            { mode: 'brush' as PaintMode, Icon: Paintbrush, label: 'Pincel' },
            { mode: 'eraser' as PaintMode, Icon: Eraser, label: 'Borracha' },
          ]).map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => { setPaintMode(mode); setActiveSticker(null); }}
              className="ds-btn"
              aria-label={label}
              aria-pressed={paintMode === mode && !activeSticker}
              style={{
                minWidth: 36, minHeight: 36, padding: 0,
                borderRadius: 'var(--radius-md)',
                background: paintMode === mode && !activeSticker ? theme.color : `${theme.color}15`,
                color: paintMode === mode && !activeSticker ? '#fff' : theme.color,
              }}
            >
              <Icon size={16} />
            </button>
          ))}

          {/* Sticker toggle */}
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="ds-btn"
            aria-label="Adesivos"
            aria-pressed={showStickers}
            style={{
              minWidth: 36, minHeight: 36, padding: 0,
              borderRadius: 'var(--radius-md)',
              background: showStickers ? theme.color : `${theme.color}15`,
              color: showStickers ? '#fff' : theme.color,
            }}
          >
            <Sparkles size={16} />
          </button>

          {/* Brush size (only for brush/eraser) */}
          {(paintMode === 'brush' || paintMode === 'eraser') && (
            <div className="flex items-center" style={{ gap: 2, marginLeft: 4 }}>
              <button
                onClick={() => setBrushSize(s => Math.max(2, s - 2))}
                className="ds-btn"
                aria-label="Diminuir pincel"
                style={{ minWidth: 28, minHeight: 28, padding: 0, borderRadius: 'var(--radius-sm)', background: `${theme.color}15`, color: theme.color }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: theme.color, minWidth: 20, textAlign: 'center' }}>
                {brushSize}
              </span>
              <button
                onClick={() => setBrushSize(s => Math.min(30, s + 2))}
                className="ds-btn"
                aria-label="Aumentar pincel"
                style={{ minWidth: 28, minHeight: 28, padding: 0, borderRadius: 'var(--radius-sm)', background: `${theme.color}15`, color: theme.color }}
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Center: undo/redo */}
        <div className="flex items-center" style={{ gap: 4 }}>
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="ds-btn"
            aria-label="Desfazer"
            style={{ minWidth: 32, minHeight: 32, padding: 0, borderRadius: 'var(--radius-md)', background: `${theme.color}15`, color: theme.color }}
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="ds-btn"
            aria-label="Refazer"
            style={{ minWidth: 32, minHeight: 32, padding: 0, borderRadius: 'var(--radius-md)', background: `${theme.color}15`, color: theme.color }}
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Right: count + actions */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
          <div className="flex items-center gap-1 font-bold" style={{ color: theme.color, fontSize: 'var(--font-size-sm)' }}>
            <Paintbrush size={14} color={theme.color} aria-hidden="true" />
            <span>{coloredCount}</span>
          </div>

          {coloredCount > 0 && (
            <button
              onClick={onBack}
              className="ds-btn"
              aria-label="Finalizar pintura"
              style={{
                background: theme.gradient,
                color: 'var(--color-text-inverse)',
                padding: '6px 12px',
                fontSize: 'var(--font-size-xs)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Check size={14} /> Pronto
            </button>
          )}

          <button
            onClick={() => sheetIdx + 1 < sheets.length ? loadSheet(sheetIdx + 1) : onBack()}
            className="ds-btn"
            aria-label={sheetIdx + 1 < sheets.length ? 'Próximo desenho' : 'Voltar'}
            style={{
              background: `${theme.color}18`,
              color: theme.color,
              padding: '6px 10px',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            Pular <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Sticker picker */}
      {showStickers && (
        <div className="flex items-center flex-shrink-0 scrollbar-hide overflow-x-auto"
          style={{ gap: 'var(--spacing-xs)', padding: '0 var(--spacing-sm) var(--spacing-xs)' }}>
          {STICKERS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSticker(activeSticker === s ? null : s)}
              className="ds-btn flex-shrink-0"
              style={{
                minWidth: 36, minHeight: 36, padding: 0,
                fontSize: 20,
                borderRadius: 'var(--radius-md)',
                background: activeSticker === s ? theme.color : `${theme.color}10`,
                border: activeSticker === s ? `2px solid ${theme.color}` : '2px solid transparent',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Canvas area */}
      <div
        ref={canvasAreaRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ padding: '0 var(--spacing-sm)', cursor: activeSticker ? 'crosshair' : undefined }}
        onClick={activeSticker ? handleStickerPlace : undefined}
      >
        {current.type === 'svg' ? (
          <div
            key={current.id}
            ref={svgContainerRef}
            aria-label={`Desenho para pintar: ${current.name}`}
            className="w-full max-w-sm overflow-hidden"
            style={{
              cursor: activeSticker ? 'crosshair' : cursor,
              background: 'transparent',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
            }}
          />
        ) : (
          <div className="w-full max-w-sm">
            <PngColoring
              key={current.id}
              sheet={current}
              selectedColorRef={selectedColorRef}
              modeRef={modeRef}
              onPaint={handlePaint}
              cursor={activeSticker ? 'crosshair' : cursor}
              brushSize={brushSize}
            />
          </div>
        )}
        <StickerOverlay stickers={placedStickers} />
      </div>

      {/* Palette */}
      <div className="flex-shrink-0" style={{ padding: 'var(--spacing-xs) var(--spacing-sm) var(--spacing-sm)' }}>
        <div className="ds-card" style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}>
          <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
            {/* Selected swatch */}
            <div
              className="flex-shrink-0 rounded-full"
              aria-label={`Cor selecionada: ${selectedColor}`}
              style={{
                width: 26, height: 26,
                backgroundColor: selectedColor,
                border: '2px solid var(--color-border)',
              }}
            />

            {/* Preset swatches */}
            <div className="flex flex-1 overflow-x-auto scrollbar-hide"
              style={{ gap: 3, padding: '2px 0' }}>
              {PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 24, height: 24,
                    minWidth: 24, minHeight: 24,
                    backgroundColor: color,
                    border: selectedColor === color
                      ? '3px solid var(--color-text)'
                      : color === '#FFFFFF' ? '1.5px solid var(--color-border)' : '1.5px solid transparent',
                    transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform var(--transition-fast)',
                  }}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>

            {/* Native color picker */}
            <label
              className="flex-shrink-0 flex items-center justify-center cursor-pointer rounded-full"
              title="Mais cores"
              style={{
                width: 26, height: 26,
                border: '2px dashed var(--color-text-3)',
                color: 'var(--color-text-3)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
              }}
            >
              <Plus size={12} />
              <input
                type="color"
                className="sr-only"
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                aria-label="Escolher cor personalizada"
              />
            </label>
          </div>
        </div>

        {/* Sheet tabs */}
        {sheets.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-hide"
            style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)', paddingBottom: 'var(--spacing-xs)' }}>
            {sheets.map((s, i) => (
              <button
                key={s.id}
                onClick={() => loadSheet(i)}
                className="ds-btn flex-shrink-0"
                aria-label={`Desenho: ${s.name}`}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  backgroundColor: i === sheetIdx ? theme.color : `${theme.color}22`,
                  color: i === sheetIdx ? 'var(--color-text-inverse)' : theme.textColor,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </GameLayout>
  );
}
