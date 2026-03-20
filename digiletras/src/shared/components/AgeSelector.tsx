import { AGE_GROUPS, saveAgeGroup, type AgeGroup } from '../config/ageGroups';

interface Props {
  /** Faixa etária atualmente selecionada (highlight) */
  current?: AgeGroup | null;
  /** Callback quando o usuário escolhe uma faixa */
  onSelect: (id: AgeGroup) => void;
}

/**
 * Card de seleção de faixa etária / perfil do aluno.
 * Pode ser usado como tela inicial (first-time) ou como popup/seção de configuração.
 */
export default function AgeSelector({ current, onSelect }: Props) {
  function handleSelect(id: AgeGroup) {
    saveAgeGroup(id);
    onSelect(id);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: 'var(--gradient-bg)' }}>
      <div className="text-5xl mb-3">👋</div>
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Quem vai aprender?</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-2)' }}>Escolha a fase para adaptar os jogos</p>

      <div className="w-full max-w-md flex flex-col gap-3">
        {AGE_GROUPS.map(ag => {
          const isActive = current === ag.id;
          return (
            <button
              key={ag.id}
              onClick={() => handleSelect(ag.id)}
              className="animate-pop-up"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px',
                borderRadius: 'var(--radius-xl)',
                border: `3px solid ${isActive ? ag.color : 'var(--color-border)'}`,
                background: isActive ? `${ag.color}15` : 'var(--color-surface)',
                boxShadow: isActive ? `0 4px 16px ${ag.color}30` : 'var(--shadow-card)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 36, lineHeight: 1 }}>{ag.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: isActive ? ag.color : 'var(--color-text)' }}>
                  {ag.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>
                  {ag.ageRange} — {ag.description}
                </div>
              </div>
              {isActive && (
                <span style={{ fontSize: 20, color: ag.color }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
