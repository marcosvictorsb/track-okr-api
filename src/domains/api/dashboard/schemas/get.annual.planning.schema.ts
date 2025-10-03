import { z } from 'zod';

export const getAnnualPlanningSchema = z.object({
  query: z.object({
    year: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true; // Optional field
          const yearNumber = Number(value);
          return !isNaN(yearNumber) && yearNumber >= 2020 && yearNumber <= 2030;
        },
        {
          message: 'Ano deve ser um número válido entre 2020 e 2030'
        }
      ),
    quarter: z.string().refine(
      (value) => {
        const quarterNumber = Number(value);
        return (
          !isNaN(quarterNumber) && quarterNumber >= 1 && quarterNumber <= 5
        );
      },
      {
        message: 'Quarter é obrigatório e deve ser um número válido entre 1 e 5'
      }
    )
  })
});
