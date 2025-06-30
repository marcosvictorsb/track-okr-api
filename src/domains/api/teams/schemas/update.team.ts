import { z } from 'zod';

export const updateTeamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID é obrigatório')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'ID deve ser um número válido')
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    description: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(250, 'A descrição deve ter no máximo 250 caracteres')
  })
});
