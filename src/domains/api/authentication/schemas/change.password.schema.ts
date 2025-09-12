import { z } from 'zod';

export const changePasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().max(255, 'Senha deve ter no máximo 255 caracteres')
  })
});
