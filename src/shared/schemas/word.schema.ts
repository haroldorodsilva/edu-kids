import { z } from 'zod';

export const WordSchema = z.object({
  id: z.string(),
  word: z.string().min(1),
  syllables: z.array(z.string()).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  category: z.string(),
  emoji: z.string(),
  silabicFamily: z.string().optional(),
});

export const WordCreateSchema = WordSchema.omit({ id: true });

export type Word = z.infer<typeof WordSchema>;
export type WordCreate = z.infer<typeof WordCreateSchema>;
