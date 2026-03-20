import { icons, type LucideProps } from 'lucide-react';

interface Props extends LucideProps {
  /** Nome do ícone Lucide (ex: 'Puzzle', 'Brain') */
  name: string;
}

/**
 * Renderiza um ícone Lucide pelo nome (string).
 * Útil quando o nome do ícone vem de dados (gameThemes, etc).
 */
export default function LucideIcon({ name, ...props }: Props) {
  const Icon = icons[name as keyof typeof icons];
  if (!Icon) return null;
  return <Icon {...props} />;
}
