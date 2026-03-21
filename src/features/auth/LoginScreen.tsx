import { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User, LogIn, CaseSensitive, AlertCircle } from 'lucide-react';
import { LoginSchema, type LoginInput } from '../../shared/schemas/auth.schema';
import { useAuthStore } from '../../shared/stores/authStore';
import type { AuthUser } from '../../shared/schemas/auth.schema';

// After login, redirect by role
function defaultPathForRole(role: AuthUser['role']): string {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/parent';
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuthStore();
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  // Already authenticated → redirect
  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from ?? defaultPathForRole(user.role)} replace />;
  }

  function onSubmit(data: LoginInput) {
    setLoginError('');
    const result = login(data.username, data.password);
    if (!result) {
      setLoginError('Utilizador ou senha incorretos.');
      return;
    }
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    navigate(from ?? defaultPathForRole(result.role), { replace: true });
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-hero)',
      padding: '24px 20px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <CaseSensitive size={36} color="#fff" />
        <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Silabrinca
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'var(--color-surface)',
        borderRadius: 24,
        padding: '32px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 6, textAlign: 'center' }}>
          Área Restrita
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-2)', textAlign: 'center', marginBottom: 28 }}>
          Acesso para administradores, professores e responsáveis
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)' }}>Utilizador</span>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-2)' }}
              />
              <input
                {...register('username')}
                autoComplete="username"
                placeholder="Ex: admin"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 12,
                  border: `1.5px solid ${errors.username ? '#e55' : 'var(--color-border)'}`,
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {errors.username && (
              <span style={{ fontSize: 12, color: '#e55' }}>{errors.username.message}</span>
            )}
          </label>

          {/* Password */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)' }}>Senha</span>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-2)' }}
              />
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 12,
                  border: `1.5px solid ${errors.password ? '#e55' : 'var(--color-border)'}`,
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {errors.password && (
              <span style={{ fontSize: 12, color: '#e55' }}>{errors.password.message}</span>
            )}
          </label>

          {/* Auth error */}
          {loginError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: '#fef2f2',
              border: '1.5px solid #fca5a5',
            }}>
              <AlertCircle size={15} color="#ef4444" />
              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 4,
              padding: '13px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'opacity .15s',
            }}
          >
            <LogIn size={18} />
            Entrar
          </button>
        </form>

        {/* Demo hint */}
        <div style={{
          marginTop: 24,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'var(--color-bg)',
          border: '1px dashed var(--color-border)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Contas demo
          </p>
          {[
            { user: 'admin',       role: 'Administrador' },
            { user: 'professor',   role: 'Professor'     },
            { user: 'responsavel', role: 'Responsável'   },
          ].map(({ user: u, role }) => (
            <div key={u} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-2)', padding: '2px 0' }}>
              <span><b style={{ color: 'var(--color-text)' }}>{u}</b> / silabrinca2025</span>
              <span style={{ color: 'var(--color-text-2)', fontStyle: 'italic' }}>{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 24,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.75)',
          fontSize: 13,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        ← Voltar ao início
      </button>
    </div>
  );
}
