import { z } from 'zod';

export const createCheckinsSchema = z.object({
  body: z.object({
    new_value: z
      .number()
      .min(0, 'New value must be non-negative')
      .finite('New value must be a valid number'),
    comment: z
      .string()
      .max(500, 'Comment must be 500 characters or less')
      .optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a valid number')
  })
});
