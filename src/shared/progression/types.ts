export type GameType = 'syllable' | 'quiz' | 'fill' | 'memory' | 'write' | 'firstletter' | 'buildsentence' | 'story';

export interface Activity {
  id: string;
  gameType: GameType;
  wordIds: string[];
  sentenceIds?: string[];
  storyId?: string;
  rounds?: number;
  storyMode?: 'typing' | 'dictation';
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  activities: Activity[];
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bg: string;
  lessons: Lesson[];
}

export interface LessonResult {
  stars: number; // 1-3
  xp: number;
  completedAt: string; // ISO date
}

export interface AppProgress {
  completedLessons: Record<string, LessonResult>;
  totalXP: number;
  lastPlayedAt: string;
}
