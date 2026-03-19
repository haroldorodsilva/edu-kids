import type { ReactNode } from 'react';

export interface ScreenHeaderProps {
  /** Título exibido no header */
  title: string;
  /** Emoji exibido antes do título */
  emoji: string;
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
 *
 * Renderiza um `<header>` com gradiente, botão voltar acessível,
 * título com emoji, subtítulo opcional e área de ações à direita.
 * Usa exclusivamente tokens do Design System.
 */
export default function ScreenHeader({
  title,
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
          }}
        >
          ←
        </button>

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
            {emoji} {title}
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

      {actions && <div>{actions}</div>}
    </header>
  );
}
