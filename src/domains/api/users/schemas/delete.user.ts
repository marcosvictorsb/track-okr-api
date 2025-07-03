import { z } from 'zod';

export const deleteUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID é obrigatório')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'ID deve ser um número válido')
  })
});
