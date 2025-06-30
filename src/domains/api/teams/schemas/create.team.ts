import { z } from 'zod';

export const createTeamSchema = z.object({
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
