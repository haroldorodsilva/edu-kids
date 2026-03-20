import type { Word } from './data/words';

export type { GameId } from './data/gameThemes';

/**
 * Base props shared by all standard game components.
 * Games with additional props should extend this interface.
 */
export interface GameComponentProps {
  onBack: () => void;
  wordPool?: Word[];
  rounds?: number;
  onComplete?: (errors: number) => void;
}
