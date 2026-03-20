import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface ScreenHeaderProps {
  /** Título exibido no header */
  title: string;
  /** Ícone (ReactNode) exibido antes do título */
  icon?: ReactNode;
  /** @deprecated Use `icon` em vez de `emoji` */
  emoji?: string;
  /** Callback do botão voltar */
  onBack: () => void;
  /** Gradiente CSS de fundo. Default: var(--gradient-primary) */
  gradient?: string;
  /** Subtítulo opcional abaixo do título */
  subtitle?: string;
  /** Ações extras renderizadas à direita */
  actions?: ReactNode;
}

/**
 * Header sticky reutilizável para todas as telas do app.
 */
export default function ScreenHeader({
  title,
  icon,
  emoji,
  onBack,
  gradient = 'var(--gradient-primary)',
  subtitle,
  actions,
}: ScreenHeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: gradient,
        padding: 'var(--spacing-md) var(--spacing-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <button
          onClick={onBack}
          className="ds-btn-icon"
          aria-label="Voltar"
          style={{
            minWidth: 44,
            minHeight: 44,
            background: 'rgba(255,255,255,.2)',
            color: 'var(--color-text-inverse)',
            fontSize: 'var(--font-size-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          {icon && <span style={{ color: 'var(--color-text-inverse)', display: 'flex' }}>{icon}</span>}
          <div>
            <h1
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 800,
                color: 'var(--color-text-inverse)',
                margin: 0,
                fontFamily: 'var(--font-family)',
                lineHeight: 1.2,
              }}
            >
              {!icon && emoji ? `${emoji} ` : ''}{title}
            </h1>

            {subtitle && (
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'rgba(255,255,255,.8)',
                  margin: 0,
                  fontFamily: 'var(--font-family)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {actions && <div>{actions}</div>}
    </header>
  );
}
