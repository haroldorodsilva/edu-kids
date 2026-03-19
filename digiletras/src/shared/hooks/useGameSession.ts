import { useState } from 'react';
import type { Word } from '../data/words';
import { shuffle } from '../utils/helpers';

interface Options {
  wordPool: Word[];
  rounds: number;
  filter?: (w: Word) => boolean;
}

interface SessionState {
  pool: Word[];
  round: number;
  correct: number;
  errors: number;
  done: boolean;
}

interface SessionActions {
  current: Word | undefined;
  advance: (isCorrect: boolean) => { finished: boolean; errors: number };
  addError: () => void;
}

/**
 * Encapsula o padrão comum a todos os jogos de palavra:
 * pool embaralhado, rodada atual, contagem de acertos/erros e estado done.
 *
 * @deprecated Use `useGameRounds` de `shared/hooks/useGameRounds.ts` em vez deste hook.
 * O `useGameRounds` é genérico, aceita `onComplete` diretamente e não faz shuffle interno.
 */
export function useGameSession({ wordPool, rounds, filter }: Options): SessionState & SessionActions {
  const [pool] = useState<Word[]>(() => {
    const base = filter ? wordPool.filter(filter) : wordPool;
    return shuffle(base).slice(0, rounds);
  });
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[round];

  function addError() {
    setErrors(e => e + 1);
  }

  /**
   * Avança para a próxima rodada ou marca como concluído.
   * Retorna { finished, errors } para que o componente possa chamar onComplete.
   */
  function advance(isCorrect: boolean): { finished: boolean; errors: number } {
    const newErrors = isCorrect ? errors : errors + 1;
    const newCorrect = isCorrect ? correct + 1 : correct;

    if (!isCorrect) setErrors(newErrors);
    if (isCorrect) setCorrect(newCorrect);

    if (round + 1 >= rounds) {
      setDone(true);
      return { finished: true, errors: newErrors };
    }

    setRound(r => r + 1);
    return { finished: false, errors: newErrors };
  }

  return { pool, round, correct, errors, done, current, advance, addError };
}
