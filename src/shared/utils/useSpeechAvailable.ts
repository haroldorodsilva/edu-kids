import { useState, useEffect } from 'react';

/**
 * Verifica se há uma voz pt-BR disponível no dispositivo.
 * Retorna null enquanto carrega, true se disponível, false se não.
 */
export function useSpeechAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setAvailable(false);
      return;
    }

    function check() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return; // ainda carregando
      const hasPtBR = voices.some(v => v.lang.startsWith('pt'));
      setAvailable(hasPtBR);
    }

    // Chrome carrega vozes de forma assíncrona
    window.speechSynthesis.addEventListener('voiceschanged', check);
    check(); // tenta imediatamente (funciona no Firefox/Safari)

    // Timeout: se em 3s não chegou nenhuma voz, considera indisponível
    const timer = setTimeout(() => {
      if (available === null) setAvailable(false);
    }, 3000);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', check);
      clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return available;
}
