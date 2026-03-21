/**
 * UsersManager — Phase 6
 *
 * Lists mock/local users and their roles. When backend is connected
 * (VITE_API_URL set), this will hit GET /users and support CRUD.
 * For now it shows the hardcoded demo accounts as a management preview.
 */

import { Shield, GraduationCap, Users, CheckCircle2, Clock } from 'lucide-react';
import type { AuthUser } from '../../shared/schemas/auth.schema';

// Mirror of MOCK_USERS in authStore (password omitted)
const DEMO_USERS: AuthUser[] = [
  { id: '1', username: 'admin',       displayName: 'Administrador',   role: 'admin'   },
  { id: '2', username: 'professor',   displayName: 'Professor Demo',  role: 'teacher' },
  { id: '3', username: 'responsavel', displayName: 'Responsável Demo', role: 'parent'  },
];

const ROLE_META: Record<AuthUser['role'], { label: string; color: string; bg: string; Icon: typeof Shield }> = {
  admin:   { label: 'Administrador', color: '#6C5CE7', bg: '#6C5CE715', Icon: Shield         },
  teacher: { label: 'Professor',     color: '#0984E3', bg: '#0984E315', Icon: GraduationCap  },
  parent:  { label: 'Responsável',   color: '#00B894', bg: '#00B89415', Icon: Users          },
};

function RoleBadge({ role }: { role: AuthUser['role'] }) {
  const meta = ROLE_META[role];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px',
      borderRadius: 999,
      background: meta.bg,
      color: meta.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <meta.Icon size={11} />
      {meta.label}
    </span>
  );
}

export default function UsersManager() {
  return (
    <div className="p-4">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Users size={20} /> Utilizadores
      </h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-2)', marginBottom: 20 }}>
        Gestão de contas. Dados reais disponíveis após integração com o backend.
      </p>

      {/* User list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {DEMO_USERS.map(u => {
          const meta = ROLE_META[u.role];
          return (
            <div
              key={u.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 14, padding: '14px 16px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: meta.bg, color: meta.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <meta.Icon size={20} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 3 }}>
                  {u.displayName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <code style={{
                    fontSize: 12, color: 'var(--color-text-2)',
                    background: 'var(--color-bg)', borderRadius: 6, padding: '1px 6px',
                    border: '1px solid var(--color-border)',
                  }}>
                    @{u.username}
                  </code>
                  <RoleBadge role={u.role} />
                </div>
              </div>

              {/* Active status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981', flexShrink: 0 }}>
                <CheckCircle2 size={13} />
                Ativo
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions matrix */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: '16px 20px', border: '1.5px solid var(--color-border)', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Permissões por perfil
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-2)', fontWeight: 600 }}>Recurso</th>
                {(['admin', 'teacher', 'parent'] as AuthUser['role'][]).map(r => (
                  <th key={r} style={{ textAlign: 'center', padding: '6px 8px', color: ROLE_META[r].color, fontWeight: 700 }}>
                    {ROLE_META[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { resource: 'Painel Admin',           admin: true,  teacher: false, parent: false },
                { resource: 'Trilhas (editar)',        admin: true,  teacher: false, parent: false },
                { resource: 'Palavras / Histórias',    admin: true,  teacher: false, parent: false },
                { resource: 'Painel do Professor',     admin: true,  teacher: true,  parent: false },
                { resource: 'Turmas e Tarefas',        admin: true,  teacher: true,  parent: false },
                { resource: 'Painel do Responsável',   admin: true,  teacher: false, parent: true  },
                { resource: 'Ver progresso do aluno',  admin: true,  teacher: true,  parent: true  },
              ].map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 8px', color: 'var(--color-text)', fontWeight: 500 }}>{row.resource}</td>
                  {(['admin', 'teacher', 'parent'] as AuthUser['role'][]).map(r => (
                    <td key={r} style={{ textAlign: 'center', padding: '8px 8px' }}>
                      {row[r] ? (
                        <CheckCircle2 size={14} color="#10b981" style={{ display: 'inline-block' }} />
                      ) : (
                        <span style={{ color: 'var(--color-border)', fontSize: 16, lineHeight: 1 }}>–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming soon */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--color-bg)',
        border: '1.5px dashed var(--color-border)',
        borderRadius: 14, padding: '14px 16px',
        color: 'var(--color-text-2)', fontSize: 13,
      }}>
        <Clock size={18} style={{ flexShrink: 0 }} />
        <span>
          Criação, edição e remoção de utilizadores será disponibilizada com a integração do backend (<code>VITE_API_URL</code>).
        </span>
      </div>
    </div>
  );
}
