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
          return !isNaN(num) && num >= 1 && num <= 4;
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
          if (val === undefined) return true;
          const num = Number(val);
          return !isNaN(num) && num >= 2020 && num <= 2030;
        },
        {
          message: 'Year deve ser um número entre 2020 e 2030'
        }
      )
  })
});
