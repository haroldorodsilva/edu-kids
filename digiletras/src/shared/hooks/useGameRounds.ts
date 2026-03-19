import { useState, useRef, useCallback } from 'react';

/**
 * Opções de configuração para o hook `useGameRounds`.
 *
 * @template T - Tipo dos itens no pool de rodadas
 */
export interface UseGameRoundsOptions<T> {
  /** Pool de itens para as rodadas (já preparado pelo caller, sem shuffle interno) */
  pool: T[];
  /** Número total de rodadas do jogo */
  totalRounds: number;
  /** Callback invocado exatamente uma vez quando todas as rodadas terminam */
  onComplete?: (errors: number) => void;
}

/**
 * Retorno do hook `useGameRounds`.
 *
 * @template T - Tipo dos itens no pool de rodadas
 */
export interface UseGameRoundsReturn<T> {
  /** Item atual da rodada */
  current: T | undefined;
  /** Índice da rodada atual (0-based) */
  round: number;
  /** Contagem de acertos */
  correct: number;
  /** Contagem de erros */
  errors: number;
  /** Se todas as rodadas foram completadas */
  done: boolean;
  /** Avança para próxima rodada. Retorna `{ finished, errors }`. No-op se `done` já for true. */
  advance: (isCorrect: boolean) => { finished: boolean; errors: number };
  /** Incrementa contador de erros sem avançar rodada */
  addError: () => void;
}

/**
 * Hook genérico para gerenciamento de rodadas em jogos educativos.
 *
 * Encapsula o padrão comum de progressão: pool de itens, rodada atual,
 * contagem de acertos/erros e estado de conclusão. Diferente do `useGameSession`,
 * é genérico (aceita qualquer tipo `T`), não faz shuffle internamente e aceita
 * um callback `onComplete` diretamente.
 *
 * @template T - Tipo dos itens no pool de rodadas
 * @param options - Configuração do hook (pool, totalRounds, onComplete)
 * @returns Estado da rodada atual e funções de controle
 *
 * @example
 * ```tsx
 * const { current, round, correct, errors, done, advance, addError } = useGameRounds({
 *   pool: shuffledWords,
 *   totalRounds: 5,
 *   onComplete: (errs) => console.log(`Fim! Erros: ${errs}`),
 * });
 * ```
 */
export function useGameRounds<T>(options: UseGameRoundsOptions<T>): UseGameRoundsReturn<T> {
  const { pool, totalRounds, onComplete } = options;

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const current = pool[round];

  const addError = useCallback(() => {
    setErrors(e => e + 1);
  }, []);

  const advance = useCallback(
    (isCorrect: boolean): { finished: boolean; errors: number } => {
      if (done) {
        return { finished: true, errors };
      }

      const newErrors = isCorrect ? errors : errors + 1;
      const newCorrect = isCorrect ? correct + 1 : correct;

      if (!isCorrect) setErrors(newErrors);
      if (isCorrect) setCorrect(newCorrect);

      if (round + 1 >= totalRounds) {
        setDone(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.(newErrors);
        }
        return { finished: true, errors: newErrors };
      }

      setRound(r => r + 1);
      return { finished: false, errors: newErrors };
    },
    [done, errors, correct, round, totalRounds, onComplete],
  );

  return { current, round, correct, errors, done, advance, addError };
}
