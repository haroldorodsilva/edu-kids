import { useState } from 'react';
import Dashboard from './Dashboard';
import StoryManager from './StoryManager';
import WordBank from './WordBank';
import AIGenerator from './AIGenerator';
import MatchGameEditor from './MatchGameEditor';
import ColoringEditor from './ColoringEditor';
import TrackEditor from './TrackEditor';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';

interface Props { onBack: () => void; }

type Tab = 'dashboard' | 'stories' | 'words' | 'ai' | 'matchgame' | 'coloring' | 'tracks';

const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
  { id: 'dashboard',   label: 'Dashboard', icon: '📊', color: '#6C5CE7' },
  { id: 'stories',     label: 'Histórias', icon: '📖', color: '#E17055' },
  { id: 'words',       label: 'Palavras',  icon: '📚', color: '#0984E3' },
  { id: 'matchgame',   label: 'Ligar',     icon: '🔗', color: '#6A1B9A' },
  { id: 'coloring',    label: 'Pintar',    icon: '🎨', color: '#E65100' },
  { id: 'ai',          label: 'IA',        icon: '🤖', color: '#00B894' },
  { id: 'tracks',      label: 'Trilhas',   icon: '🛤️', color: '#00897B' },
];

export default function AdminPanel({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('dashboard');

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <ScreenHeader
        title="Painel Admin"
        emoji="⚙️"
        onBack={onBack}
        subtitle={`${activeTab.icon} ${activeTab.label}`}
      />

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
        {tab === 'tracks'      && <TrackEditor />}
      </div>
    </div>
  );
}
