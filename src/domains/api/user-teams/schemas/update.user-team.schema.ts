import { z } from 'zod';

export const updateUserTeamSchema = z.object({
  body: z.object({
    role_in_team: z
      .string()
      .min(1, 'Cargo no time é obrigatório')
      .max(50, 'Cargo no time deve ter no máximo 50 caracteres')
      .optional()
  }),
  params: z.object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0,
        'ID deve ser um número válido maior que 0'
      )
      .optional(),
    id_user_to_update: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0,
        'ID do usuário deve ser um número válido maior que 0'
      )
      .optional(),
    id_team: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => !isNaN(val) && val > 0,
        'ID do time deve ser um número válido maior que 0'
      )
      .optional()
  })
});
