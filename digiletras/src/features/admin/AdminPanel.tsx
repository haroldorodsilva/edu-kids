import { useState } from 'react';
import Dashboard from './Dashboard';
import StoryManager from './StoryManager';
import WordBank from './WordBank';
import AIGenerator from './AIGenerator';
import MatchGameEditor from './MatchGameEditor';
import ColoringEditor from './ColoringEditor';

interface Props { onBack: () => void; }

type Tab = 'dashboard' | 'stories' | 'words' | 'ai' | 'matchgame' | 'coloring';

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'dashboard',   label: 'Dashboard', icon: '📊', color: '#6C5CE7' },
  { id: 'stories',     label: 'Histórias', icon: '📖', color: '#E17055' },
  { id: 'words',       label: 'Palavras',  icon: '📚', color: '#0984E3' },
  { id: 'matchgame',   label: 'Ligar',     icon: '🔗', color: '#6A1B9A' },
  { id: 'coloring',    label: 'Pintar',    icon: '🎨', color: '#E65100' },
  { id: 'ai',          label: 'IA',        icon: '🤖', color: '#00B894' },
];

export default function AdminPanel({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--gradient-primary)',
        padding: '14px 16px 12px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 2px 12px rgba(108,92,231,0.35)',
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            color: '#fff', fontSize: 18, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none',
            transition: 'background 0.15s',
          }}
          aria-label="Voltar"
        >
          ←
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
            ⚙️ Painel Admin
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            {activeTab.icon} {activeTab.label}
          </p>
        </div>
      </header>

      {/* ── Tab bar ────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 62, zIndex: 19,
        background: 'var(--color-surface)',
        borderBottom: '1.5px solid var(--color-border)',
        overflowX: 'auto',
      }} className="scrollbar-hide">
        <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 8px' }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 14px',
                  fontSize: 13, fontWeight: 700,
                  color: active ? t.color : 'var(--color-text-2)',
                  borderBottom: `3px solid ${active ? t.color : 'transparent'}`,
                  background: 'none', border: 'none',
                  borderBottomStyle: 'solid',
                  borderBottomWidth: 3,
                  borderBottomColor: active ? t.color : 'transparent',
                  cursor: 'pointer', outline: 'none',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: active ? `${t.color}1A` : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  transition: 'background 0.15s',
                }}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        {tab === 'dashboard'   && <Dashboard />}
        {tab === 'stories'     && <StoryManager />}
        {tab === 'words'       && <WordBank />}
        {tab === 'matchgame'   && <MatchGameEditor />}
        {tab === 'coloring'    && <ColoringEditor />}
        {tab === 'ai'          && <AIGenerator />}
      </div>
    </div>
  );
}
