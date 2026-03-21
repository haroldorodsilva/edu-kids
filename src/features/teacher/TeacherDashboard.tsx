/**
 * TeacherDashboard — Phase 4 skeleton
 *
 * Routes:
 *   /teacher             → class overview (this component)
 *   /teacher/class/:id   → student list with progress (TeacherClassView — future)
 *   /teacher/assignment/:id → assignment detail (future)
 *
 * Currently shows aggregate stats across all age groups (same as ParentDashboard)
 * and a placeholder for class/assignment management.
 *
 * Full implementation requires backend:
 * - TeacherProfile creation
 * - Class (Turma) CRUD
 * - Assignment creation and tracking
 * - Per-student progress aggregation
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Users, BookOpen, ClipboardList, LogOut } from 'lucide-react';
import { useAllTracks } from '../../shared/queries/tracks.queries';
import { useAuthStore } from '../../shared/stores/authStore';

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number | string; color: string;
}) {
  return (
    <div style={{
      flex: 1, background: '#fff', borderRadius: 14, padding: '16px 12px', textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${color}`,
    }}>
      <div style={{ color, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 22, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: tracks = [] } = useAllTracks();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const tracksByAge = {
    '3-4': tracks.filter(t => t.ageGroup === '3-4').length,
    '5-6': tracks.filter(t => t.ageGroup === '5-6').length,
    '7-8': tracks.filter(t => t.ageGroup === '7-8').length,
    '9-10': tracks.filter(t => t.ageGroup === '9-10').length,
  };
  const totalLessons = tracks.reduce(
    (s, t) => s + t.units.reduce((us, u) => us + u.lessons.length, 0), 0,
  );

  const comingSoon = [
    { icon: <Users size={18} />, title: 'Turmas', desc: 'Crie e gerencie turmas de alunos', color: '#0984E3' },
    { icon: <ClipboardList size={18} />, title: 'Tarefas', desc: 'Atribua trilhas como tarefa para uma turma ou aluno individual', color: '#00B894' },
    { icon: <BookOpen size={18} />, title: 'Relatórios', desc: 'Veja o progresso de cada aluno por tarefa e identifique dificuldades', color: '#6C5CE7' },
  ];

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
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GraduationCap size={22} color="#fff" />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                Painel do Professor
              </h1>
            </div>
            {user && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>
                {user.displayName}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#fff', fontSize: 12, fontWeight: 600,
            }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </header>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Stats row — content available right now */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Conteúdo disponível
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard icon={<BookOpen size={18} />} label="Trilhas" value={tracks.length} color="#6C5CE7" />
            <StatCard icon={<ClipboardList size={18} />} label="Lições" value={totalLessons} color="#0984E3" />
            <StatCard icon={<Users size={18} />} label="Faixas" value={4} color="#00B894" />
          </div>
        </div>

        {/* Age group breakdown */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Trilhas por faixa etária
          </p>
          {[
            { id: '3-4', label: '3–4 anos', emoji: '🧒', color: '#27ae60' },
            { id: '5-6', label: '5–6 anos', emoji: '👦', color: '#2980b9' },
            { id: '7-8', label: '7–8 anos', emoji: '👧', color: '#8e44ad' },
            { id: '9-10', label: '9–10 anos', emoji: '🎓', color: '#7c3aed' },
          ].map(ag => {
            const count = tracksByAge[ag.id as keyof typeof tracksByAge];
            const pct = tracks.length > 0 ? count / tracks.length : 0;
            return (
              <div key={ag.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{ag.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', flex: 1 }}>{ag.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ag.color }}>{count} trilha{count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: 'var(--color-border)' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, background: ag.color,
                    width: `${Math.round(pct * 100)}%`, transition: 'width .6s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon features */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Em breve
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comingSoon.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fff', borderRadius: 14, padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: `3px solid ${item.color}`,
                opacity: 0.7,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.color}15`, color: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  background: `${item.color}15`, color: item.color,
                  borderRadius: 999, padding: '3px 8px', flexShrink: 0,
                }}>
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
