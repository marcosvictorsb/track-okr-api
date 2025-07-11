import { z } from 'zod';

export const createProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  position: z
    .string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .trim()
    .optional()
});
