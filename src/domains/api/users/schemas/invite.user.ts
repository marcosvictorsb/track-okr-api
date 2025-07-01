import { z } from 'zod';

export const inviteUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Email deve ter um formato válido')
      .min(1, 'Email é obrigatório'),
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .optional(),
    role: z
      .string()
      .min(1, 'Role deve ter pelo menos 1 caractere')
      .max(50, 'Role deve ter no máximo 50 caracteres')
      .optional(),
    teamId: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .refine(
        (val) => !isNaN(val) && val > 0,
        'TeamId deve ser um número válido maior que 0'
      )
      .optional()
  })
});
