import { useState, useCallback } from 'react';

/**
 * Encapsula o padrão de shake em erro:
 * ativa a classe CSS por 350ms e depois desativa.
 */
export function useShake() {
  const [shake, setShake] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 350);
  }, []);

  return { shake, triggerShake };
}
