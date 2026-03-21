import { useEffect } from 'react';
import { X } from 'lucide-react';

interface PreviewModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Generic full-height slide-up modal for admin previews.
 * Traps focus, closes on Escape, and blocks scroll on mount.
 */
export default function PreviewModal({ title, onClose, children }: PreviewModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    // Prevent body scroll while open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.60)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn .15s ease',
      }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        style={{
          width: '100%',
          maxHeight: '92dvh',
          background: 'var(--color-bg)',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp .2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--color-surface)',
          borderBottom: '1.5px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            👁 {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-2)',
            }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
