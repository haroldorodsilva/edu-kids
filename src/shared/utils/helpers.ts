export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickRandom<T>(arr: readonly T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

export const encouragements = [
  'Muito bem! 🎉', 'Incrível! ⭐', 'Arrasou! 🚀',
  'Que demais! 🌟', 'Perfeito! ✨', 'Uhuul! 💫',
];

export function randomEncouragement() {
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}
