/**
 * ParentDashboard — Phase 4 skeleton
 *
 * Shows an overview of all linked children's progress:
 * - Active tracks, XP earned, lessons completed
 * - Error patterns (which words/lessons a child struggles with)
 * - Time-on-task summary per session
 *
 * Data comes from TrackProgressV2 records filtered by playerId.
 * Currently shows local ("local") profile data; expands to multi-profile
 * once PlayerProfile storage is implemented.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Star, BookOpen, TrendingUp } from 'lucide-react';
import { useTrackProgress } from '../../shared/queries/tracks.queries';
import type { AgeGroup } from '../../shared/tracks/types';

const AGE_GROUPS: { id: AgeGroup; label: string; emoji: string; color: string }[] = [
  { id: '3-4',  label: '3–4 anos',  emoji: '🧒', color: '#27ae60' },
  { id: '5-6',  label: '5–6 anos',  emoji: '👦', color: '#2980b9' },
  { id: '7-8',  label: '7–8 anos',  emoji: '👧', color: '#8e44ad' },
  { id: '9-10', label: '9–10 anos', emoji: '🎓', color: '#7c3aed' },
];

function AgeGroupCard({ id, label, emoji, color }: typeof AGE_GROUPS[0]) {
  const { data: progressList = [] } = useTrackProgress(id);
  const totalXP = progressList.reduce((s, p) => s + p.totalXP, 0);
  const completedCount = progressList.reduce(
    (s, p) => s + Object.keys(p.completedLessons).length, 0,
  );
  const tracksWithProgress = progressList.filter(
    p => Object.keys(p.completedLessons).length > 0,
  ).length;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '16px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 32 }}>{emoji}</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text)' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>
            {tracksWithProgress} trilha{tracksWithProgress !== 1 ? 's' : ''} em progresso
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color }}>
            {totalXP} <span style={{ fontSize: 12 }}>XP</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Stat icon={<BookOpen size={14} />} label="Lições" value={completedCount} color={color} />
        <Stat icon={<Star size={14} />} label="XP total" value={totalXP} color={color} />
        <Stat
          icon={<TrendingUp size={14} />}
          label="Nível"
          value={Math.floor(totalXP / 100) + 1}
          color={color}
        />
      </div>

      {progressList.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 8, textAlign: 'center' }}>
          Nenhuma lição concluída ainda.
        </p>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div style={{
      flex: 1, background: `${color}0d`, borderRadius: 10, padding: '8px 10px', textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2, color }}>
        {icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--color-text-2)' }}>{label}</div>
    </div>
  );
}

export default function ParentDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--gradient-hero)',
        padding: '16px 20px 20px',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
              width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={22} color="#fff" />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                Painel do Responsável
              </h1>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>
              Acompanhe o progresso do seu filho
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-2)', margin: 0 }}>
          Progresso atual por faixa etária:
        </p>

        {AGE_GROUPS.map(ag => (
          <AgeGroupCard key={ag.id} {...ag} />
        ))}

        {/* Coming soon banner */}
        <div style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
          borderRadius: 16, padding: '20px 20px',
          color: '#fff', textAlign: 'center', marginTop: 8,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
            Mais recursos em breve
          </div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Perfis de alunos, histórico de erros e relatórios detalhados serão disponibilizados com a integração do backend.
          </div>
        </div>
      </div>
    </div>
  );
}
