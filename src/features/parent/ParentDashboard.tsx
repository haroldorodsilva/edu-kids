import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, Users, Star, BookOpen, TrendingUp, LogOut,
  Plus, Trash2, CheckCircle2, X,
} from 'lucide-react';
import { useTrackProgress } from '../../shared/queries/tracks.queries';
import { usePlayerProfiles, useCreatePlayer, useDeletePlayer } from '../../shared/queries/players.queries';
import { useAuthStore } from '../../shared/stores/authStore';
import { useSessionStore } from '../../shared/stores/sessionStore';
import { z } from 'zod';
import { AgeGroupSchema } from '../../shared/schemas/track.schema';
import type { PlayerProfileCreate } from '../../shared/schemas/users.schema';
import type { AgeGroup } from '../../shared/tracks/types';
import type { PlayerProfile } from '../../shared/schemas/users.schema';

// Local form schema without .default() so RHF types align
const NewPlayerFormSchema = z.object({
  displayName: z.string().min(1, 'Nome obrigatório').max(50),
  ageGroup: AgeGroupSchema,
  avatarEmoji: z.string(),
});
type NewPlayerForm = z.infer<typeof NewPlayerFormSchema>;

// ── Age group config ─────────────────────────────────────────────────────────

const AGE_GROUPS: { id: AgeGroup; label: string; emoji: string; color: string }[] = [
  { id: '3-4',  label: '3–4 anos',  emoji: '🧒', color: '#27ae60' },
  { id: '5-6',  label: '5–6 anos',  emoji: '👦', color: '#2980b9' },
  { id: '7-8',  label: '7–8 anos',  emoji: '👧', color: '#8e44ad' },
  { id: '9-10', label: '9–10 anos', emoji: '🎓', color: '#7c3aed' },
];

const AVATAR_OPTIONS = ['🧒', '👦', '👧', '🧑', '👩', '👨', '🎓', '🌟', '🦁', '🐧', '🦊', '🐸'];

// ── Sub-components ───────────────────────────────────────────────────────────

function Stat({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div style={{ flex: 1, background: `${color}0d`, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2, color }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 16, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--color-text-2)' }}>{label}</div>
    </div>
  );
}

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
      background: 'var(--color-surface)', borderRadius: 16, padding: '16px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color}`,
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
        <Stat icon={<TrendingUp size={14} />} label="Nível" value={Math.floor(totalXP / 100) + 1} color={color} />
      </div>
      {progressList.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 8, textAlign: 'center' }}>
          Nenhuma lição concluída ainda.
        </p>
      )}
    </div>
  );
}

// ── New Player form (modal) ──────────────────────────────────────────────────

function NewPlayerModal({ onClose }: { onClose: () => void }) {
  const createPlayer = useCreatePlayer();
  const [selectedAvatar, setSelectedAvatar] = useState('🧒');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<NewPlayerForm>({
    resolver: zodResolver(NewPlayerFormSchema),
    defaultValues: { displayName: '', ageGroup: '5-6', avatarEmoji: '🧒' },
  });

  function onSubmit(data: NewPlayerForm) {
    const payload: PlayerProfileCreate = {
      displayName: data.displayName,
      ageGroup: data.ageGroup,
      avatarEmoji: selectedAvatar,
      totalXP: 0,
      parentId: null,
      teacherId: null,
    };
    createPlayer.mutate(payload, { onSuccess: onClose });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--color-surface)', borderRadius: 24,
        padding: '28px 24px', width: '100%', maxWidth: 380,
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            Novo Perfil de Aluno
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-2)', padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', display: 'block', marginBottom: 8 }}>
              Avatar
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { setSelectedAvatar(emoji); setValue('avatarEmoji', emoji); }}
                  style={{
                    fontSize: 22, lineHeight: 1, padding: 6, borderRadius: 10,
                    border: `2.5px solid ${selectedAvatar === emoji ? '#6C5CE7' : 'transparent'}`,
                    background: selectedAvatar === emoji ? '#6C5CE715' : 'var(--color-bg)',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)' }}>Nome</span>
            <input
              {...register('displayName')}
              placeholder="Ex: Ana, João..."
              style={{
                padding: '10px 12px', borderRadius: 12,
                border: `1.5px solid ${errors.displayName ? '#e55' : 'var(--color-border)'}`,
                background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 15, outline: 'none',
              }}
            />
            {errors.displayName && (
              <span style={{ fontSize: 11, color: '#e55' }}>{errors.displayName.message}</span>
            )}
          </label>

          {/* Age group */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-2)', display: 'block', marginBottom: 8 }}>
              Faixa etária
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {AGE_GROUPS.map(ag => (
                <label key={ag.id} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value={ag.id}
                    style={{ display: 'none' }}
                    {...register('ageGroup')}
                  />
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: `2px solid ${ag.color}`,
                    background: 'transparent', color: ag.color,
                    cursor: 'pointer',
                  }}>
                    {ag.emoji} {ag.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.ageGroup && (
              <span style={{ fontSize: 11, color: '#e55', display: 'block', marginTop: 4 }}>{errors.ageGroup.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 4, padding: '13px', borderRadius: 14,
              background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
              color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            Criar Perfil
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Player card ──────────────────────────────────────────────────────────────

function PlayerCard({
  player,
  isActive,
  onSelect,
  onDelete,
}: {
  player: PlayerProfile;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const ag = AGE_GROUPS.find(a => a.id === player.ageGroup) ?? AGE_GROUPS[1];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      background: isActive ? `${ag.color}12` : 'var(--color-surface)',
      border: `2px solid ${isActive ? ag.color : 'var(--color-border)'}`,
      borderRadius: 16, cursor: 'pointer',
      boxShadow: isActive ? `0 2px 12px ${ag.color}30` : '0 1px 6px rgba(0,0,0,0.04)',
      transition: 'all .15s',
    }}
      onClick={onSelect}
    >
      <span style={{ fontSize: 36, flexShrink: 0 }}>{player.avatarEmoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-text)' }}>{player.displayName}</div>
        <div style={{ fontSize: 12, color: ag.color, fontWeight: 600 }}>{ag.emoji} {ag.label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 2 }}>
          {player.totalXP} XP · Nível {Math.floor(player.totalXP / 100) + 1}
        </div>
      </div>
      {isActive && (
        <CheckCircle2 size={20} color={ag.color} style={{ flexShrink: 0 }} />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: 6, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Remover perfil"
      >
        <Trash2 size={13} color="#ef4444" />
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { activePlayerId, setActivePlayerId } = useSessionStore();
  const { data: players = [] } = usePlayerProfiles();
  const deletePlayer = useDeletePlayer();
  const [showNewPlayer, setShowNewPlayer] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleDeletePlayer(id: string) {
    if (!confirm('Remover este perfil? O progresso de jogo associado não será apagado.')) return;
    deletePlayer.mutate(id, {
      onSuccess: () => {
        if (activePlayerId === id) setActivePlayerId('local');
      },
    });
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}>
      {showNewPlayer && <NewPlayerModal onClose={() => setShowNewPlayer(false)} />}

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
              <Users size={22} color="#fff" />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                Painel do Responsável
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

      {/* Content */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Player profiles section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} /> Perfis de Alunos
            </h2>
            <button
              onClick={() => setShowNewPlayer(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 20,
                background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Novo Perfil
            </button>
          </div>

          {players.length === 0 ? (
            <div style={{
              background: 'var(--color-surface)', border: '1.5px dashed var(--color-border)',
              borderRadius: 16, padding: '24px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍👩‍👧</div>
              <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                Nenhum perfil criado
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 16 }}>
                Crie um perfil para cada filho e acompanhe o progresso individual.
              </div>
              <button
                onClick={() => setShowNewPlayer(true)}
                style={{
                  padding: '10px 20px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                  color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
                }}
              >
                Criar primeiro perfil
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Local / anonymous mode option */}
              <div
                onClick={() => setActivePlayerId('local')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  background: activePlayerId === 'local' ? '#f0eef8' : 'var(--color-surface)',
                  border: `2px solid ${activePlayerId === 'local' ? '#6C5CE7' : 'var(--color-border)'}`,
                  borderRadius: 14, cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 28 }}>👤</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Modo anónimo</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>Progresso partilhado sem perfil individual</div>
                </div>
                {activePlayerId === 'local' && <CheckCircle2 size={18} color="#6C5CE7" />}
              </div>

              {players.map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  isActive={activePlayerId === p.id}
                  onSelect={() => setActivePlayerId(p.id)}
                  onDelete={() => handleDeletePlayer(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress by age group */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={16} /> Progresso por faixa etária
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-text-2)', marginBottom: 12, marginTop: 0 }}>
            {activePlayerId === 'local'
              ? 'Modo anónimo — progresso partilhado do dispositivo'
              : `Perfil: ${players.find(p => p.id === activePlayerId)?.displayName ?? 'Desconhecido'}`}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {AGE_GROUPS.map(ag => <AgeGroupCard key={ag.id} {...ag} />)}
          </div>
        </div>

        {/* Coming soon */}
        <div style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
          borderRadius: 16, padding: '20px',
          color: '#fff', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Mais recursos em breve</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Histórico de erros, relatórios detalhados e sincronização entre dispositivos com a integração do backend.
          </div>
        </div>
      </div>
    </div>
  );
}
