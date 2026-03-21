import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, BarChart3, BookOpen, Library, Link, Route, Search, LogOut, Users,
} from 'lucide-react';
import Dashboard from './Dashboard';
import StoryManager from './StoryManager';
import WordBank from './WordBank';
import MatchGameEditor from './MatchGameEditor';
import TrackEditor from './TrackEditor';
import WordSearchEditor from './WordSearchEditor';
import UsersManager from './UsersManager';
import ScreenHeader from '../../shared/components/layout/ScreenHeader';
import { useAuthStore } from '../../shared/stores/authStore';
import type { AuthUser } from '../../shared/schemas/auth.schema';

interface Props { onBack: () => void; }

type Tab = 'dashboard' | 'stories' | 'words' | 'matchgame' | 'tracks' | 'wordsearch' | 'users';

interface TabDef {
  id: Tab;
  label: string;
  Icon: typeof BarChart3;
  color: string;
  /** If set, only these roles can see this tab */
  roles?: AuthUser['role'][];
}

const ALL_TABS: TabDef[] = [
  { id: 'dashboard',  label: 'Dashboard', Icon: BarChart3, color: '#6C5CE7' },
  { id: 'stories',    label: 'Histórias', Icon: BookOpen,  color: '#E17055' },
  { id: 'words',      label: 'Palavras',  Icon: Library,   color: '#0984E3' },
  { id: 'matchgame',  label: 'Ligar',     Icon: Link,      color: '#6A1B9A' },
  { id: 'tracks',     label: 'Trilhas',   Icon: Route,     color: '#00897B' },
  { id: 'wordsearch', label: 'Caça Pal.', Icon: Search,    color: '#C62828' },
  { id: 'users',      label: 'Utilizad.', Icon: Users,     color: '#F39C12', roles: ['admin'] },
];

export default function AdminPanel({ onBack }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Filter tabs by role
  const tabs = ALL_TABS.filter(t => !t.roles || (user && t.roles.includes(user.role)));

  const [tab, setTab] = useState<Tab>('dashboard');
  // Fallback if current tab becomes invisible after role change
  const activeTab = tabs.find(t => t.id === tab) ?? tabs[0];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="ds-screen" style={{ background: 'var(--color-bg)', overflowY: 'auto' }}>
      <ScreenHeader
        title="Painel Admin"
        icon={<Settings size={20} />}
        onBack={onBack}
        subtitle={activeTab.label}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600,
                color: 'var(--color-text-2)',
                padding: '4px 10px',
                borderRadius: 20,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}>
                <Users size={12} />
                {user.displayName}
              </span>
            )}
            <button
              onClick={handleLogout}
              title="Sair"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 10px',
                borderRadius: 20,
                border: '1px solid #fca5a5',
                background: '#fef2f2',
                color: '#ef4444',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <LogOut size={12} />
              Sair
            </button>
          </div>
        }
      />

      {/* Tab bar */}
      <div style={{
        position: 'sticky', top: 62, zIndex: 19,
        background: 'var(--color-surface)',
        borderBottom: '1.5px solid var(--color-border)',
        overflowX: 'auto',
      }} className="scrollbar-hide">
        <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 8px' }}>
          {tabs.map(t => {
            const active = activeTab.id === t.id;
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
                  transition: 'background 0.15s',
                }}>
                  <t.Icon size={16} />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {activeTab.id === 'dashboard'  && <Dashboard />}
        {activeTab.id === 'stories'    && <StoryManager />}
        {activeTab.id === 'words'      && <WordBank />}
        {activeTab.id === 'matchgame'  && <MatchGameEditor />}
        {activeTab.id === 'tracks'     && <TrackEditor />}
        {activeTab.id === 'wordsearch' && <WordSearchEditor />}
        {activeTab.id === 'users'      && <UsersManager />}
      </div>
    </div>
  );
}
