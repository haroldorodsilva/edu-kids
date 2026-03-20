// Singleton AudioContext — criado uma vez, reutilizado em todas as chamadas.
// Evita o limite de ~6 contextos simultâneos imposto pelos browsers.
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!_ctx) {
      _ctx = new AudioContext();
    }
    // Browsers suspendem o contexto se não houver interação do usuário recente
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  } catch {
    return null;
  }
}

export function beep(type: 'ok' | 'no' | 'yay') {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.07;

    if (type === 'ok')  { osc.frequency.value = 660; osc.type = 'sine'; }
    if (type === 'no')  { osc.frequency.value = 220; osc.type = 'triangle'; }
    if (type === 'yay') { osc.frequency.value = 880; osc.type = 'sine'; }

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch { /* ignore */ }
}

export function speak(text: string) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    u.rate = 0.75;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}
