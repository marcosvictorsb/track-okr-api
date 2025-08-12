import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Nome é obrigatório' })
      .min(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
      .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
    email: z
      .string({ required_error: 'Email é obrigatório' })
      .email({ message: 'Email deve ter um formato válido' })
      .max(255, { message: 'Email deve ter no máximo 255 caracteres' }),
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
      .max(100, { message: 'Senha deve ter no máximo 100 caracteres' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
      }),
    company_name: z
      .string({ required_error: 'Nome da empresa é obrigatório' })
      .min(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' })
      .max(255, {
        message: 'Nome da empresa deve ter no máximo 255 caracteres'
      }),
    plan: z
      .string({ required_error: 'Plano é obrigatório' })
      .min(1, { message: 'Plano é obrigatório' })
  })
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
