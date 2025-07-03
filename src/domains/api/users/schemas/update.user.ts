import { z } from 'zod';

export const updateUserSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID é obrigatório')
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'ID deve ser um número válido')
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Nome não pode estar vazio')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .optional(),
      email: z
        .string()
        .email('Email deve ter um formato válido')
        .max(150, 'Email deve ter no máximo 150 caracteres')
        .optional(),
      role: z
        .enum(['admin', 'user', 'manager'], {
          errorMap: () => ({ message: 'Role deve ser admin, user ou manager' })
        })
        .optional(),
      teamId: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
        .refine(
          (val) => !isNaN(val) && val > 0,
          'TeamId deve ser um número válido maior que 0'
        )
        .optional()
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.email !== undefined ||
        data.role !== undefined ||
        data.teamId !== undefined,
      {
        message:
          'Pelo menos um campo (name, email, role ou teamId) deve ser fornecido'
      }
    )
});
