import { useState, useRef, useEffect, useCallback } from 'react';
import { Paintbrush } from 'lucide-react';
import { beep } from '../../shared/utils/audio';
import { getColoringSheets, type ColoringSheet } from '../../shared/data/coloringSheets';
import { getTheme } from '../../shared/data/gameThemes';
import GameLayout from '../../shared/components/layout/GameLayout';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import type { GameComponentProps } from '../../shared/types';

type Props = Pick<GameComponentProps, 'onBack' | 'onComplete'>;

const PALETTE = [
  '#F44336', '#E91E63', '#FF4081', '#FF8A80',
  '#FF6D00', '#FF9100', '#FFC400', '#FFD740',
  '#00C853', '#69F0AE', '#00BFA5', '#1DE9B6',
  '#2979FF', '#40C4FF', '#AA00FF', '#EA80FC',
  '#795548', '#BCAAA4', '#FFCCBC', '#FFF9C4',
  '#FFFFFF', '#E0E0E0', '#757575', '#212121',
];

const theme = getTheme('coloring');

// Paintbrush SVG cursor — tip is the hotspot (bottom of bristles)
function buildCursor(color: string): string {
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
  outlineThreshold = 80,  // pixels darker than this (0-255 luminance) are treated as outlines
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
  // Don't fill outline pixels
  if (luminance(si) < outlineThreshold) return;

  const [sr, sg, sb] = [data[si], data[si + 1], data[si + 2]];
  // Don't refill if already same color
  if (colorDistance(sr, sg, sb, fr, fg, fb) < 5) return;

  const visited = new Uint8Array(width * height);
  const queue: number[] = [startX + startY * width];
  visited[startX + startY * width] = 1;

  while (queue.length > 0) {
    const pos = queue.pop()!;
    const x = pos % width;
    const y = (pos - x) / width;
    const i = pos * 4;

    // Skip outline pixels
    if (luminance(i) < outlineThreshold) continue;
    // Skip if too far from original color
    if (colorDistance(data[i], data[i + 1], data[i + 2], sr, sg, sb) > tolerance) continue;

    // Paint this pixel
    data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;

    // Enqueue neighbours
    if (x > 0         && !visited[pos - 1])        { visited[pos - 1] = 1;        queue.push(pos - 1); }
    if (x < width - 1 && !visited[pos + 1])        { visited[pos + 1] = 1;        queue.push(pos + 1); }
    if (y > 0         && !visited[pos - width])     { visited[pos - width] = 1;    queue.push(pos - width); }
    if (y < height - 1 && !visited[pos + width])   { visited[pos + width] = 1;    queue.push(pos + width); }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ── SVG coloring (path click → set fill) ─────────────────────────────────────

function useSvgColoring(
  sheet: ColoringSheet | undefined,
  containerRef: React.RefObject<HTMLDivElement | null>,
  selectedColorRef: React.RefObject<string>,
  onPaint: () => void,
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

    // Insert a background rect as the very first child so the user can paint the background
    const vb = (svg.getAttribute('viewBox') ?? '0 0 100 100').split(/[\s,]+/).map(Number);
    const [vx, vy, vw, vh] = [vb[0] ?? 0, vb[1] ?? 0, vb[2] ?? 100, vb[3] ?? 100];
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', String(vx));
    bgRect.setAttribute('y', String(vy));
    bgRect.setAttribute('width', String(vw));
    bgRect.setAttribute('height', String(vh));
    bgRect.setAttribute('fill', 'white');
    bgRect.style.pointerEvents = 'all';
    bgRect.style.transition = `fill var(--transition-fast)`;
    bgRect.addEventListener('click', (ev: Event) => {
      ev.stopPropagation();
      const color = selectedColorRef.current;
      bgRect.style.fill = color;
      bgRect.setAttribute('fill', color);
      if (!bgRect.dataset.painted) { bgRect.dataset.painted = '1'; onPaint(); }
      beep('ok');
    });
    svg.insertBefore(bgRect, svg.firstChild);

    const all = Array.from(svg.querySelectorAll('path, circle, ellipse, rect, polygon, polyline'));
    all.forEach(el => {
      const e = el as SVGElement;
      if (e === bgRect) return; // already handled
      e.style.pointerEvents = 'all';
      e.style.transition = `fill var(--transition-fast)`;
      if (e.getAttribute('fill') === 'none' && !e.style.fill) return;

      const handler = (ev: Event) => {
        ev.stopPropagation();
        const color = selectedColorRef.current;
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

function PngColoring({ sheet, selectedColorRef, onPaint, cursor }: {
  sheet: ColoringSheet;
  selectedColorRef: React.RefObject<string>;
  onPaint: () => void;
  cursor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

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

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    floodFill(ctx, x, y, selectedColorRef.current);
    onPaint();
    beep('ok');
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
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

// ── Main component ────────────────────────────────────────────────────────────

export default function Coloring({ onBack }: Props) {
  const sheets = getColoringSheets();
  const [sheetIdx, setSheetIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [coloredCount, setColoredCount] = useState(0);

  const selectedColorRef = useRef(selectedColor);
  selectedColorRef.current = selectedColor;

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handlePaint = useCallback(() => setColoredCount(c => c + 1), []);

  const current = sheets[sheetIdx];
  const cursor = buildCursor(selectedColor);

  useSvgColoring(current, svgContainerRef, selectedColorRef, handlePaint);

  function loadSheet(idx: number) {
    setSheetIdx(idx);
    setColoredCount(0);
  }

  // Empty state — no sheets available
  if (!current) {
    return (
      <div className="ds-screen" style={{ background: theme.gradient }}>
        <ScreenHeader
          emoji={theme.icon}
          title={theme.label}
          onBack={onBack}
          gradient={theme.gradient}
        />
        <div className="flex flex-col items-center justify-center flex-1 text-center"
          style={{ padding: 'var(--spacing-xl)' }}>
          <div className="text-6xl" style={{ marginBottom: 'var(--spacing-md)' }}>🎨</div>
          <h2 className="text-2xl font-bold" style={{ color: theme.textColor, marginBottom: 'var(--spacing-sm)' }}>
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
          <button
            onClick={onBack}
            className="ds-btn ds-btn-primary"
            style={{ background: theme.gradient }}
          >
            ← Voltar
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
      {/* Action bar: paint count + skip/finish */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: 'var(--spacing-xs) var(--spacing-md)' }}
      >
        <div className="flex items-center gap-1 font-bold" style={{ color: theme.color, fontSize: 'var(--font-size-sm)' }}>
          <Paintbrush size={14} color={theme.color} aria-hidden="true" />
          <span>{coloredCount}</span>
        </div>

        <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
          {/* Finish button — shown after painting at least once */}
          {coloredCount > 0 && (
            <button
              onClick={onBack}
              className="ds-btn"
              aria-label="Finalizar pintura"
              style={{
                background: theme.gradient,
                color: 'var(--color-text-inverse)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              ✅ Finalizar
            </button>
          )}

          {/* Skip / Next */}
          <button
            onClick={() => sheetIdx + 1 < sheets.length ? loadSheet(sheetIdx + 1) : onBack()}
            className="ds-btn"
            aria-label={sheetIdx + 1 < sheets.length ? 'Pular para próximo desenho' : 'Pular e voltar'}
            style={{
              background: `${theme.color}18`,
              color: theme.color,
              padding: 'var(--spacing-sm) var(--spacing-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              borderRadius: 'var(--radius-lg)',
            }}
          >
            Pular →
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ padding: '0 var(--spacing-sm)' }}>
        {current.type === 'svg' ? (
          <div
            key={current.id}
            ref={svgContainerRef}
            aria-label={`Desenho para pintar: ${current.name}`}
            className="w-full max-w-sm overflow-hidden"
            style={{
              cursor,
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
              onPaint={handlePaint}
              cursor={cursor}
            />
          </div>
        )}
      </div>

      {/* Palette */}
      <div className="flex-shrink-0" style={{ padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm)' }}>
        <div className="ds-card" style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
          <div className="flex items-center" style={{ gap: 'var(--spacing-sm)' }}>
            {/* Selected swatch */}
            <div
              className="flex-shrink-0 rounded-full"
              aria-label={`Cor selecionada: ${selectedColor}`}
              style={{
                width: 28,
                height: 28,
                backgroundColor: selectedColor,
                border: '2px solid var(--color-border)',
              }}
            />

            {/* Preset swatches */}
            <div className="flex flex-1 overflow-x-auto scrollbar-hide"
              style={{ gap: 'var(--spacing-xs)', padding: 'var(--spacing-xs) 0' }}>
              {PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 26, height: 26,
                    minWidth: 26, minHeight: 26,
                    backgroundColor: color,
                    border: selectedColor === color
                      ? '3px solid var(--color-text)'
                      : color === '#FFFFFF' ? '1.5px solid var(--color-border)' : '1.5px solid transparent',
                    transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                    transition: `transform var(--transition-fast)`,
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
                width: 28,
                height: 28,
                border: '2px dashed var(--color-text-3)',
                color: 'var(--color-text-3)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
              }}
            >
              +
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
            style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)', paddingBottom: 'var(--spacing-xs)' }}>
            {sheets.map((s, i) => (
              <button
                key={s.id}
                onClick={() => loadSheet(i)}
                className="ds-btn flex-shrink-0"
                aria-label={`Desenho: ${s.name}`}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  backgroundColor: i === sheetIdx ? theme.color : `${theme.color}22`,
                  color: i === sheetIdx ? 'var(--color-text-inverse)' : theme.textColor,
                  transition: `all var(--transition-fast)`,
                }}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </GameLayout>
  );
}
