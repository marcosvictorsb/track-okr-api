import { z } from 'zod';

export const createSettingBodySchema = z.object({
  block_okr_creation: z.boolean().optional().default(false),
  block_key_result_creation: z.boolean().optional().default(false),
  block_okr_editing: z.boolean().optional().default(false),
  block_key_result_editing: z.boolean().optional().default(false),
  allowed_quarters: z
    .array(z.number().int().min(1).max(4))
    .optional()
    .default([1, 2, 3, 4]),
  current_quarter_only: z.boolean().optional().default(false)
});

export const createSettingSchema = z.object({
  body: createSettingBodySchema
});

export type CreateSettingRequest = z.infer<typeof createSettingSchema>;
