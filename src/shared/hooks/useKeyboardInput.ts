import { useEffect, useCallback } from 'react';

const PT_BR_PATTERN = /^[a-záàâãéèêíïóôõúüçñ ]$/i;

interface Options {
  onChar: (char: string) => void;
  active?: boolean; // se false, o listener não é adicionado (ex: em dispositivos touch)
}

/**
 * Registra um listener global de keydown que passa caracteres válidos (letras pt-BR + espaço)
 * para o callback onChar. Remove o listener quando o componente é desmontado ou active=false.
 *
 * Resolve o problema de stale closure: o callback é sempre a versão mais recente via useCallback.
 */
export function useKeyboardInput({ onChar, active = true }: Options) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') e.preventDefault();
    if (!PT_BR_PATTERN.test(e.key)) return;
    onChar(e.key.toLowerCase());
  }, [onChar]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey, active]);
}
