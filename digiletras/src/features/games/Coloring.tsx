import { useState, useRef, useEffect, useCallback } from 'react';
import { Paintbrush } from 'lucide-react';
import { beep } from '../../shared/utils/audio';
import { getColoringSheets, type ColoringSheet } from '../../shared/data/coloringSheets';

interface Props {
  onBack: () => void;
  onComplete?: (errors: number) => void;
}

const PALETTE = [
  '#F44336', '#E91E63', '#FF4081', '#FF8A80',
  '#FF6D00', '#FF9100', '#FFC400', '#FFD740',
  '#00C853', '#69F0AE', '#00BFA5', '#1DE9B6',
  '#2979FF', '#40C4FF', '#AA00FF', '#EA80FC',
  '#795548', '#BCAAA4', '#FFCCBC', '#FFF9C4',
  '#FFFFFF', '#E0E0E0', '#757575', '#212121',
];

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
    bgRect.style.transition = 'fill 0.12s';
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
      e.style.transition = 'fill 0.12s';
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
      className="w-full rounded-3xl shadow-xl bg-white"
      style={{ cursor, maxHeight: '62vh', display: 'block' }}
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

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #ffe0b2 100%)' }}>
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold text-orange-800 mb-2">Nenhum desenho ainda</h2>
        <p className="text-orange-600 mb-2">Coloque arquivos <strong>.svg</strong> ou <strong>.png</strong> em:</p>
        <code className="bg-orange-100 rounded-xl px-3 py-2 text-sm text-orange-800 mb-6">src/assets/paint/</code>
        <button onClick={onBack} className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold">← Voltar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col select-none"
      style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #ffe0b2 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button onClick={onBack} className="text-orange-700 text-2xl font-bold">←</button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Paintbrush size={18} style={{ color: selectedColor === '#FFFFFF' ? '#aaa' : selectedColor }} />
            <h1 className="text-lg font-bold text-orange-800">Pintar</h1>
          </div>
          <p className="text-orange-600 text-xs">{current.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
            <Paintbrush size={14} color="#FF6D00" />
            <span>{coloredCount}</span>
          </div>
          {/* Skip / Next */}
          {sheetIdx + 1 < sheets.length ? (
            <button
              onClick={() => loadSheet(sheetIdx + 1)}
              className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold"
            >
              Pular →
            </button>
          ) : (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold"
            >
              Pular →
            </button>
          )}
        </div>
      </div>

      {/* Finish button — shown after painting at least once */}
      {coloredCount > 0 && (
        <div className="px-4 pb-1 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-2xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #FF6D00, #E91E63)' }}
          >
            ✅ Finalizar
          </button>
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 px-3 flex items-center justify-center overflow-hidden">
        {current.type === 'svg' ? (
          <div
            key={current.id}
            ref={svgContainerRef}
            className="w-full max-w-sm rounded-3xl shadow-xl overflow-hidden"
            style={{ cursor, background: 'transparent' }}
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
      <div className="flex-shrink-0 px-3 pb-3 pt-2">
        <div className="bg-white rounded-2xl shadow px-3 py-2">
          <div className="flex items-center gap-2">
            {/* Selected swatch */}
            <div
              className="flex-shrink-0 rounded-full border-2 border-gray-300"
              style={{ width: 28, height: 28, backgroundColor: selectedColor }}
            />

            {/* Preset swatches */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 py-1">
              {PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="flex-shrink-0 rounded-full transition-all active:scale-90"
                  style={{
                    width: 26, height: 26,
                    backgroundColor: color,
                    border: selectedColor === color
                      ? '3px solid #333'
                      : color === '#FFFFFF' ? '1.5px solid #ccc' : '1.5px solid transparent',
                    transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                  }}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>

            {/* Native color picker */}
            <label
              className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer text-gray-500 hover:border-gray-600 text-xs font-bold"
              title="Mais cores"
            >
              +
              <input
                type="color"
                className="sr-only"
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Sheet tabs */}
        {sheets.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            {sheets.map((s, i) => (
              <button
                key={s.id}
                onClick={() => loadSheet(i)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: i === sheetIdx ? '#FF6F00' : '#FFE0B2',
                  color: i === sheetIdx ? 'white' : '#BF360C',
                }}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
