import { z } from 'zod';

export const createUserTeamSchema = z.object({
  body: z.object({
    id_user_to_add: z
      .number()
      .int('ID do usuário deve ser um número inteiro')
      .positive('ID do usuário deve ser positivo'),
    id_team: z
      .number()
      .int('ID do time deve ser um número inteiro')
      .positive('ID do time deve ser positivo'),
    role_in_team: z
      .string()
      .min(1, 'Cargo no time é obrigatório')
      .max(50, 'Cargo no time deve ter no máximo 50 caracteres')
      .optional()
      .default('member')
  })
});
