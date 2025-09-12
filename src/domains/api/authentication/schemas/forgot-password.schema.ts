import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email deve ter um formato válido')
      .max(255, 'Email deve ter no máximo 255 caracteres')
  })
});
