import { z } from 'zod';

export const StorySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  emoji: z.string(),
  sentences: z.array(z.string()).min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  theme: z.string(),
});

export const StoryCreateSchema = StorySchema.omit({ id: true });

export type Story = z.infer<typeof StorySchema>;
export type StoryCreate = z.infer<typeof StoryCreateSchema>;
