const STATS_KEY = 'silabrinca_session_stats';

export interface WordStats {
  attempts: number;
  errors: number;
}

export interface SessionStats {
  gamesPlayed: Record<string, number>;
  wordStats: Record<string, WordStats>;
  totalAttempts: number;
  totalErrors: number;
}

function getStats(): SessionStats {
  try {
    const raw = sessionStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as SessionStats;
  } catch { /* noop */ }
  return { gamesPlayed: {}, wordStats: {}, totalAttempts: 0, totalErrors: 0 };
}

function saveStats(stats: SessionStats) {
  try { sessionStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* noop */ }
}

export function recordGamePlayed(game: string) {
  const stats = getStats();
  stats.gamesPlayed[game] = (stats.gamesPlayed[game] ?? 0) + 1;
  saveStats(stats);
}

export function recordWordAttempt(word: string, errors: number) {
  const stats = getStats();
  const ws = stats.wordStats[word] ?? { attempts: 0, errors: 0 };
  ws.attempts++;
  ws.errors += errors;
  stats.wordStats[word] = ws;
  stats.totalAttempts++;
  stats.totalErrors += errors;
  saveStats(stats);
}

export function getSessionStats(): SessionStats {
  return getStats();
}
