import { z } from 'zod';

export const updateSettingBodySchema = z.object({
  block_okr_creation: z.boolean().optional(),
  block_key_result_creation: z.boolean().optional(),
  block_okr_editing: z.boolean().optional(),
  block_key_result_editing: z.boolean().optional(),
  allowed_quarters: z.array(z.number()).optional(),
  current_quarter_only: z.boolean().optional()
});

export const updateSettingParamsSchema = z.object({
  id: z.string().transform((val) => Number(val))
});

export const updateSettingSchema = z.object({
  body: updateSettingBodySchema,
  params: updateSettingParamsSchema
});

export type UpdateSettingRequest = z.infer<typeof updateSettingSchema>;
