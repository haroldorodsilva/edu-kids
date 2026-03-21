import { z } from 'zod';
import { AgeGroupSchema } from './track.schema';

// ── Subject / Matéria ─────────────────────────────────────────

export const SubjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),       // "Português", "Matemática"
  slug: z.string(),              // "portugues", "matematica"
  icon: z.string(),              // Lucide icon name
  color: z.string(),
});
export type Subject = z.infer<typeof SubjectSchema>;

// ── Child / Jogador ───────────────────────────────────────────

export const PlayerProfileSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1).max(50),
  avatarEmoji: z.string().default('🧒'),
  ageGroup: AgeGroupSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Denormalized XP total; authoritative source is progress records */
  totalXP: z.number().int().nonnegative().default(0),
  /** null = standalone local profile (no parent/teacher linkage) */
  parentId: z.string().nullable().default(null),
  teacherId: z.string().nullable().default(null),
});
export type PlayerProfile = z.infer<typeof PlayerProfileSchema>;

export const PlayerProfileCreateSchema = PlayerProfileSchema.omit({
  id: true, createdAt: true, updatedAt: true,
});
export type PlayerProfileCreate = z.infer<typeof PlayerProfileCreateSchema>;

// ── Parent / Responsável ──────────────────────────────────────

export const ParentProfileSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  /** IDs of PlayerProfile (children) linked to this parent */
  childIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ParentProfile = z.infer<typeof ParentProfileSchema>;

// ── Teacher / Professor ───────────────────────────────────────

export const TeacherProfileSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  email: z.string().email().optional(),
  classIds: z.array(z.string()),
  subjectIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TeacherProfile = z.infer<typeof TeacherProfileSchema>;

// ── Class / Turma ─────────────────────────────────────────────

export const ClassSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),   // "Turma 3A 2026"
  teacherId: z.string(),
  studentIds: z.array(z.string()),    // PlayerProfile IDs
  subjectIds: z.array(z.string()),
  ageGroup: AgeGroupSchema.optional(),
  academicYear: z.string().regex(/^\d{4}$/),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Class = z.infer<typeof ClassSchema>;

// ── Assignment / Tarefa ───────────────────────────────────────

export const AssignmentStatusSchema = z.enum(['active', 'completed', 'archived']);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

export const AssignmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  teacherId: z.string(),
  subjectId: z.string(),
  /** Target: either a class or an individual student — exactly one must be non-null */
  classId: z.string().nullable(),
  studentId: z.string().nullable(),
  /** Ordered sequence of track IDs to complete */
  trackIds: z.array(z.string()).min(1),
  dueDate: z.string().nullable(),
  status: AssignmentStatusSchema.default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
}).refine(
  a => Boolean(a.classId) !== Boolean(a.studentId),
  { message: 'Deve ter classId ou studentId, não ambos ou nenhum' },
);
export type Assignment = z.infer<typeof AssignmentSchema>;

// ── Extended TrackProgress for multi-profile ─────────────────
// Version 2 adds playerId. Existing records (v1) have playerId: 'local'.

export const TrackProgressV2Schema = z.object({
  id: z.string(),
  playerId: z.string().default('local'),
  trackId: z.string(),
  ageGroup: AgeGroupSchema,
  completedLessons: z.record(z.string(), z.object({
    stars: z.number().int().min(0).max(3),
    xp: z.number().int().nonnegative(),
    completedAt: z.string(),
    errors: z.number().int().nonnegative(),
    errorDetails: z.array(z.object({
      activityId: z.string(),
      wordId: z.string(),
      count: z.number().int().nonnegative(),
    })).optional(),
  })),
  totalXP: z.number().int().nonnegative(),
  lastPlayedAt: z.string(),
  version: z.literal(2),
});
export type TrackProgressV2 = z.infer<typeof TrackProgressV2Schema>;

/**
 * Migrate a v1 TrackProgress record to v2 by adding playerId: 'local'.
 * Safe to call on already-v2 records (returns them unchanged).
 */
export function migrateProgressToV2(record: Record<string, unknown>): TrackProgressV2 {
  if (record.version === 2) return record as unknown as TrackProgressV2;
  return {
    ...(record as object),
    playerId: 'local',
    version: 2,
  } as TrackProgressV2;
}
