import { useState } from 'react';
import {
  getColoringSheets, saveColoringSheet, deleteColoringSheet, isAssetSheet,
  hideAssetSheet, getAllAssetSheets, getHiddenAssets, unhideAssetSheet,
  type ColoringSheet, type SheetType,
} from '../../shared/data/coloringSheets';

function newId() { return `col_${Date.now()}`; }

export default function ColoringEditor() {
  const [sheets, setSheets] = useState(() => getColoringSheets());
  const [editSheet, setEditSheet] = useState<ColoringSheet | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenIds, setHiddenIds] = useState(() => getHiddenAssets());

  function refresh() {
    setSheets(getColoringSheets());
    setHiddenIds(getHiddenAssets());
  }

  function handleDelete(id: string) {
    if (!confirm('Excluir esta folha de pintura?')) return;
    deleteColoringSheet(id);
    refresh();
  }

  function handleHide(id: string) {
    hideAssetSheet(id);
    refresh();
  }

  function handleUnhide(id: string) {
    unhideAssetSheet(id);
    refresh();
  }

  function handleSave(sheet: ColoringSheet) {
    saveColoringSheet(sheet);
    refresh();
    setEditSheet(null);
  }

  if (editSheet) {
    return <SheetForm sheet={editSheet} onSave={handleSave} onCancel={() => setEditSheet(null)} />;
  }

  const hiddenAssets = getAllAssetSheets().filter(s => hiddenIds.has(s.id));

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">🎨 Pintar</h2>
        <button
          onClick={() => setEditSheet({ id: newId(), name: '', emoji: '🎨', type: 'svg', svgContent: '' })}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm"
        >
          + Upload
        </button>
      </div>

      <div className="space-y-2">
        {sheets.map(sheet => (
          <div key={sheet.id} className="bg-white rounded-2xl p-4 shadow flex items-center gap-3">
            <span className="text-3xl">{sheet.emoji}</span>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{sheet.name || 'Sem nome'}</p>
              <p className="text-xs text-gray-400">
                {isAssetSheet(sheet.id) ? '📂 Arquivo' : '📤 Upload'}
              </p>
            </div>
            {/* Small SVG preview */}
            {sheet.svgContent && (
              <div
                className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200"
                dangerouslySetInnerHTML={{ __html: sheet.svgContent }}
                style={{ flexShrink: 0 }}
              />
            )}
            {isAssetSheet(sheet.id) ? (
              <button
                onClick={() => handleHide(sheet.id)}
                className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold"
                title="Ocultar da lista"
              >
                🙈
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditSheet(sheet)} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold">
                  ✏️
                </button>
                <button onClick={() => handleDelete(sheet.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold">
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {sheets.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🎨</p>
          <p>Nenhum desenho visível. Adicione arquivos em <code>src/assets/paint/</code> ou faça upload.</p>
        </div>
      )}

      {/* Hidden assets section */}
      {hiddenAssets.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHidden(v => !v)}
            className="text-sm text-gray-400 font-bold flex items-center gap-1"
          >
            {showHidden ? '▲' : '▼'} {hiddenAssets.length} oculto{hiddenAssets.length > 1 ? 's' : ''}
          </button>
          {showHidden && (
            <div className="space-y-2 mt-2 opacity-60">
              {hiddenAssets.map(sheet => (
                <div key={sheet.id} className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-dashed border-gray-300">
                  <span className="text-2xl grayscale">{sheet.emoji}</span>
                  <p className="flex-1 text-sm text-gray-500">{sheet.name}</p>
                  <button
                    onClick={() => handleUnhide(sheet.id)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-bold"
                    title="Mostrar novamente"
                  >
                    👁️ Mostrar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Upload Form ───────────────────────────────────────────────────────────────

interface FormProps {
  sheet: ColoringSheet;
  onSave: (s: ColoringSheet) => void;
  onCancel: () => void;
}

function SheetForm({ sheet, onSave, onCancel }: FormProps) {
  const [name, setName] = useState(sheet.name);
  const [emoji, setEmoji] = useState(sheet.emoji);
  const [type, setType] = useState<SheetType>(sheet.type ?? 'svg');
  const [svgContent, setSvgContent] = useState(sheet.svgContent ?? '');
  const [pngUrl, setPngUrl] = useState(sheet.pngUrl ?? '');
  const [error, setError] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isSvg = file.name.toLowerCase().endsWith('.svg');
    const isPng = file.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/);

    if (!isSvg && !isPng) { setError('Aceita .svg, .png, .jpg, .webp'); return; }

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    if (!name) setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));

    const reader = new FileReader();
    if (isSvg) {
      reader.onload = ev => { setSvgContent(ev.target?.result as string); setType('svg'); setError(''); };
      reader.readAsText(file, 'utf-8');
    } else {
      reader.onload = ev => { setPngUrl(ev.target?.result as string); setType('png'); setError(''); };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }

  function handleSave() {
    if (!name.trim()) { setError('Informe um nome'); return; }
    if (type === 'svg' && !svgContent.trim()) { setError('Faça upload de um SVG'); return; }
    if (type === 'png' && !pngUrl) { setError('Faça upload de uma imagem'); return; }
    onSave({ id: sheet.id, name: name.trim(), emoji, type, svgContent, pngUrl });
  }

  const hasPreview = type === 'svg' ? !!svgContent : !!pngUrl;

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onCancel} className="text-orange-700 text-xl font-bold">←</button>
        <h2 className="text-xl font-bold text-gray-800">Upload Desenho</h2>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={emoji} onChange={e => setEmoji(e.target.value)}
          placeholder="🎨"
          className="w-16 px-2 py-2 border-2 border-orange-200 rounded-xl text-center text-xl"
        />
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Nome (ex: Princesa, Gato, Borboleta)"
          className="flex-1 px-3 py-2 border-2 border-orange-200 rounded-xl text-sm focus:border-orange-500 outline-none"
        />
      </div>

      <label className="block w-full py-4 border-2 border-dashed border-orange-300 rounded-2xl text-center cursor-pointer hover:bg-orange-50 mb-3">
        <span className="text-3xl block mb-1">📂</span>
        <span className="text-sm text-orange-700 font-bold">SVG ou imagem (PNG/JPG)</span>
        <p className="text-xs text-orange-400 mt-1">SVG = clique por região • PNG = balde de tinta</p>
        <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp" className="hidden" onChange={handleFile} />
      </label>

      {/* Preview */}
      {hasPreview && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-gray-500 font-bold">Pré-visualização</p>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
              {type.toUpperCase()}
            </span>
          </div>
          {type === 'svg' ? (
            <div
              className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-orange-200 bg-white p-2"
              dangerouslySetInnerHTML={{ __html: svgContent }}
              style={{ maxHeight: 220 }}
            />
          ) : (
            <img
              src={pngUrl}
              alt="preview"
              className="w-full max-w-xs mx-auto rounded-2xl border-2 border-orange-200 bg-white"
              style={{ maxHeight: 220, objectFit: 'contain' }}
            />
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-gray-200 rounded-2xl font-bold text-gray-700">
          Cancelar
        </button>
        <button onClick={handleSave} className="flex-1 py-3 bg-orange-500 text-white rounded-2xl font-bold">
          💾 Salvar
        </button>
      </div>
    </div>
  );
}
