import { useState, useCallback } from 'react';
import type { AppProgress, LessonResult } from './types';

const STORAGE_KEY = 'silabrinca_progress';

function load(): AppProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completedLessons: {}, totalXP: 0, lastPlayedAt: new Date().toISOString() };
}

function save(p: AppProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(load);

  const completeLesson = useCallback((lessonId: string, result: LessonResult) => {
    setProgress(prev => {
      // Keep best stars for this lesson
      const existing = prev.completedLessons[lessonId];
      const keep = existing && existing.stars >= result.stars ? existing : result;
      const xpGain = existing ? 0 : result.xp; // XP only on first completion
      const next: AppProgress = {
        completedLessons: { ...prev.completedLessons, [lessonId]: keep },
        totalXP: prev.totalXP + xpGain,
        lastPlayedAt: new Date().toISOString(),
      };
      save(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: AppProgress = { completedLessons: {}, totalXP: 0, lastPlayedAt: new Date().toISOString() };
    save(fresh);
    setProgress(fresh);
  }, []);

  function isLessonUnlocked(lessonId: string, allLessons: string[]): boolean {
    const idx = allLessons.indexOf(lessonId);
    if (idx <= 0) return true; // first lesson always unlocked
    return !!progress.completedLessons[allLessons[idx - 1]];
  }

  return { progress, completeLesson, resetProgress, isLessonUnlocked };
}
