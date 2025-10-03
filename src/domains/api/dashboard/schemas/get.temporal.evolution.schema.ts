import { z } from 'zod';

export const getTemporalEvolutionSchema = z.object({
  query: z.object({
    quarter: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseInt(val);
          return !isNaN(num) && num >= 1 && num <= 5;
        },
        {
          message: 'Quarter deve ser um número entre 1 e 4'
        }
      ),
    year: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseInt(val);
          return !isNaN(num) && num >= 2020 && num <= 2030;
        },
        {
          message: 'Year deve ser um número entre 2020 e 2030'
        }
      ),
    period: z.enum(['monthly', 'weekly']).optional().default('monthly')
  })
});
