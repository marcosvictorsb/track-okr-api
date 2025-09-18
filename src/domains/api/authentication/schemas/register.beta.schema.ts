import { z } from 'zod';

export const registerBetaSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Nome é obrigatório' })
      .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
      .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
    email: z
      .string({ required_error: 'Email é obrigatório' })
      .email({ message: 'Email deve ter um formato válido' })
      .max(255, { message: 'Email deve ter no máximo 255 caracteres' }),
    company_name: z
      .string({ required_error: 'Nome da empresa é obrigatório' })
      .min(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' })
      .max(255, {
        message: 'Nome da empresa deve ter no máximo 255 caracteres'
      }),
    website: z.string().optional(),
    is_beta_tester: z
      .boolean({ required_error: 'is_beta_tester é obrigatório' })
      .refine((val) => val === true, {
        message: 'is_beta_tester deve ser true para usuários beta'
      })
  })
});

export type RegisterBetaInput = z.infer<typeof registerBetaSchema>['body'];
