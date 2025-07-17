import { z } from 'zod';

export const getSettingSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export type GetSettingRequest = z.infer<typeof getSettingSchema>;
