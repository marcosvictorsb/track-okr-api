import { z } from 'zod';

export const createPlannerSchema = z.object({
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
      .min(new Date().getFullYear(), 'O ano minimo deve ser o ano atual')
  })
});
