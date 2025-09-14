import { z } from 'zod';

export const createSupportContactSchema = z.object({
  body: z.object({
    contact_preference: z
      .string()
      .min(1, 'Preferência de contato é obrigatória')
      .max(50, 'Preferência de contato deve ter no máximo 50 caracteres')
      .trim(),
    contact_info: z
      .string()
      .min(1, 'Valor de contato é obrigatório')
      .max(255, 'Valor de contato deve ter no máximo 255 caracteres')
      .trim(),
    message: z
      .string()
      .min(1, 'Mensagem é obrigatória')
      .max(5000, 'Mensagem deve ter no máximo 5000 caracteres')
      .trim()
  })
});

export type CreateSupportContactRequest = z.infer<
  typeof createSupportContactSchema
>;
