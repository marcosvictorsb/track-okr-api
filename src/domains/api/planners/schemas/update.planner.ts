import { z } from 'zod';

export const updatePlannerSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID é obrigatório')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'ID deve ser um número válido')
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Título é obrigatório')
      .max(150, 'O título deve ter no máximo 150 caracteres'),
    description: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(250, 'A descrição deve ter no máximo 150 caracteres'),
    year: z
      .number()
      .int()
      .min(1900, 'O ano deve ser válido')
      .max(new Date().getFullYear() + 5, 'O ano não pode estar muito no futuro')
  })
});
