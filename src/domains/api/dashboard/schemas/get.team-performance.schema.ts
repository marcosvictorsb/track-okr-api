import { z } from 'zod';

export const getTeamPerformanceSchema = z.object({
  // Por enquanto não há parâmetros específicos para validar além da autenticação
  // Os dados vêm do JWT (id_user, id_company)
});

export type GetTeamPerformanceSchema = z.infer<typeof getTeamPerformanceSchema>;
