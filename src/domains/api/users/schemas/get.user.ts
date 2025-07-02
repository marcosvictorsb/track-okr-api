import { z } from 'zod';

export const getUserSchema = z.object({
  query: z.object({
    limite: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || (val > 0 && val <= 100), {
        message: 'Limite deve ser entre 1 e 100'
      }),
    status: z.enum(['active', 'inactive', 'pending_activation']).optional(),
    role: z.string().optional()
  })
});
