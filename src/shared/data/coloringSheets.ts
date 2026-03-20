export type SheetType = 'svg' | 'png';

export interface ColoringSheet {
  id: string;
  name: string;
  emoji: string;
  type: SheetType;
  svgContent?: string; // raw SVG string (type=svg)
  pngUrl?: string;     // URL or base64 (type=png)
}

const STORAGE_KEY = 'silabrinca_coloring';

// Auto-load SVGs from src/assets/paint/
const svgAssets = import.meta.glob('../../assets/paint/*.svg', { as: 'raw', eager: true }) as Record<string, string>;
// Auto-load PNGs from src/assets/paint/
const pngAssets = import.meta.glob('../../assets/paint/*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

function filenameToName(path: string): string {
  const file = path.split('/').pop()?.replace(/\.(svg|png)$/, '') ?? 'Desenho';
  return file.charAt(0).toUpperCase() + file.slice(1).replace(/-|_/g, ' ');
}

const ASSET_SHEETS: ColoringSheet[] = [
  ...Object.entries(svgAssets).map(([path, content]) => ({
    id: 'asset_svg_' + (path.split('/').pop()?.replace('.svg', '') ?? Date.now()),
    name: filenameToName(path),
    emoji: '🎨',
    type: 'svg' as SheetType,
    svgContent: content,
  })),
  ...Object.entries(pngAssets).map(([path, mod]) => ({
    id: 'asset_png_' + (path.split('/').pop()?.replace('.png', '') ?? Date.now()),
    name: filenameToName(path),
    emoji: '🖼️',
    type: 'png' as SheetType,
    pngUrl: mod.default,
  })),
];

const HIDDEN_KEY = 'silabrinca_coloring_hidden';

export function getHiddenAssets(): Set<string> {
  try {
    const raw = sessionStorage.getItem(HIDDEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export function hideAssetSheet(id: string) {
  const hidden = getHiddenAssets();
  hidden.add(id);
  sessionStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
}

export function unhideAssetSheet(id: string) {
  const hidden = getHiddenAssets();
  hidden.delete(id);
  sessionStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
}

export function getColoringSheets(): ColoringSheet[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const custom: ColoringSheet[] = raw ? JSON.parse(raw) : [];
    const hidden = getHiddenAssets();
    const visibleAssets = ASSET_SHEETS.filter(s => !hidden.has(s.id));
    return [...visibleAssets, ...custom];
  } catch {
    return ASSET_SHEETS;
  }
}

export function getAllAssetSheets(): ColoringSheet[] {
  return ASSET_SHEETS;
}

export function saveColoringSheet(sheet: ColoringSheet) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const custom: ColoringSheet[] = raw ? JSON.parse(raw) : [];
    const idx = custom.findIndex(s => s.id === sheet.id);
    if (idx >= 0) custom[idx] = sheet;
    else custom.push(sheet);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  } catch { /* noop */ }
}

export function deleteColoringSheet(id: string) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const custom: ColoringSheet[] = raw ? JSON.parse(raw) : [];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(custom.filter(s => s.id !== id)));
  } catch { /* noop */ }
}

export function isAssetSheet(id: string) {
  return id.startsWith('asset_');
}
