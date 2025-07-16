import { z } from 'zod';

export const getTopContributorsSchema = z.object({
  query: z
    .object({
      quarter: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined)),
      year: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : undefined)),
      limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
      page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1))
    })
    .optional(),
  params: z.object({}).optional(),
  body: z.object({}).optional()
});

export type GetTopContributorsSchema = z.infer<typeof getTopContributorsSchema>;
