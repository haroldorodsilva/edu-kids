import { z } from 'zod';

export const AgeGroupSchema = z.enum(['3-4', '5-6', '7-8', '9-10']);

export const TrackGameTypeSchema = z.enum([
  'syllable', 'quiz', 'fill', 'memory', 'write',
  'firstletter', 'buildsentence', 'story', 'matchgame',
  'vowelgame', 'silfamilia', 'ditado', 'silfill',
]);

export const TrackActivitySchema = z.object({
  id: z.string(),
  gameType: TrackGameTypeSchema,
  wordIds: z.array(z.string()),
  sentenceIds: z.array(z.string()).optional(),
  storyId: z.string().optional(),
  storyMode: z.enum(['typing', 'dictation']).optional(),
  matchGameId: z.string().optional(),
  rounds: z.number().int().positive().optional(),
});

export const TrackLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  emoji: z.string(),
  activities: z.array(TrackActivitySchema),
});

export const TrackUnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  emoji: z.string(),
  color: z.string(),
  bg: z.string(),
  lessons: z.array(TrackLessonSchema),
});

export const TrackSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  ageGroup: AgeGroupSchema,
  emoji: z.string(),
  color: z.string(),
  units: z.array(TrackUnitSchema),
  builtin: z.boolean(),
  version: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TrackLessonResultSchema = z.object({
  stars: z.number().int().min(0).max(3),
  xp: z.number().int().nonnegative(),
  completedAt: z.string(),
  errors: z.number().int().nonnegative(),
});

export const TrackProgressSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  ageGroup: AgeGroupSchema,
  completedLessons: z.record(z.string(), TrackLessonResultSchema),
  totalXP: z.number().int().nonnegative(),
  lastPlayedAt: z.string(),
  version: z.number().int(),
});

export const RotationHistorySchema = z.record(z.string(), z.array(z.string()));

export type AgeGroup = z.infer<typeof AgeGroupSchema>;
export type TrackGameType = z.infer<typeof TrackGameTypeSchema>;
export type TrackActivity = z.infer<typeof TrackActivitySchema>;
export type TrackLesson = z.infer<typeof TrackLessonSchema>;
export type TrackUnit = z.infer<typeof TrackUnitSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type TrackLessonResult = z.infer<typeof TrackLessonResultSchema>;
export type TrackProgress = z.infer<typeof TrackProgressSchema>;
export type RotationHistory = z.infer<typeof RotationHistorySchema>;
