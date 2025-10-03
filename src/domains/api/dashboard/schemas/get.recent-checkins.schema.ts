import { z } from 'zod';

export const getRecentCheckInsSchema = z.object({
  query: z.object({
    quarter: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined) return true;
          const num = Number(val);
          return !isNaN(num) && num >= 1 && num <= 5;
        },
        {
          message: 'Quarter deve ser um número entre 1 e 5'
        }
      ),
    year: z.string().optional()
  })
});
