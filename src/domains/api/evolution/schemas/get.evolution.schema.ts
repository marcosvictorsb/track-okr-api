import { z } from 'zod';

export const getEvolutionSchema = z.object({
  query: z.object({
    year: z
      .string()
      .regex(/^\d+$/, 'Year must be a number')
      .transform(Number)
      .refine(
        (val) => val >= 2020 && val <= 2030,
        'Year must be between 2020 and 2030'
      ),
    granularity: z.enum(['monthly', 'weekly'], {
      required_error: 'Granularity must be monthly or weekly'
    }),
    teams: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return [val];
        return val;
      }),
    responsibles: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (typeof val === 'string') return [val];
        return val;
      }),
    quarter: z
      .string()
      .regex(/^\d+$/, 'Quarter must be a number')
      .transform(Number)
      .refine((val) => val >= 1 && val <= 4, 'Quarter must be between 1 and 4')
      .optional()
  })
});

export const getKeyResultPeriodDetailSchema = z.object({
  params: z.object({
    kr_id: z
      .string()
      .regex(/^\d+$/, 'Key Result ID must be a number')
      .transform(Number),
    period: z.string().min(1, 'Period is required')
  })
});
