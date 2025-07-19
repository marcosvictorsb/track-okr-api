import { z } from 'zod';

export const confirmPasswordResetSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório').max(500, 'Token inválido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .max(100, 'A senha deve ter no máximo 100 caracteres')
  })
});
