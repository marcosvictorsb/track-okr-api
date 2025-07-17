import { z } from 'zod';

export const getOverviewSchema = z.object({
  query: z.object({
    quarter: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    year: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    team: z.string().optional(),
    status: z
      .string()
      .optional()
      .refine(
        (val) => !val || ['active', 'completed', 'cancelled'].includes(val),
        'Status must be active, completed, or cancelled'
      )
  })
});
