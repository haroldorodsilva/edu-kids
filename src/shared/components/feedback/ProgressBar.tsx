interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export default function ProgressBar({ current, total, color = 'var(--color-primary)' }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div
      className="w-full bg-white/30 rounded-full h-3 mb-4"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progresso: ${current} de ${total}`}
    >
      <div
        className="h-3 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
