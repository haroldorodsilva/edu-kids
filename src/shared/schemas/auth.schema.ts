import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, 'Utilizador obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  role: z.enum(['admin', 'teacher', 'parent']),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
