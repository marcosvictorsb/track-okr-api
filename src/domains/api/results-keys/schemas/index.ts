import { z } from 'zod';

export const createResultKeyUpdateSchema = z.object({
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

export const createResultKeySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
      initial_value: z.number().min(0, 'Initial value must be non-negative'),
      target_value: z.number().min(0, 'Target value must be non-negative'),
      current_value: z.number().min(0, 'Current value must be non-negative'),
      unit: z.string().min(1, 'Unit is required').max(10, 'Unit too long'),
      responsible_team_id: z.number().int().positive().nullable().optional(),
      responsible_users: z.array(z.number().int().positive()).default([]),
      id_okr: z
        .number()
        .int()
        .positive('Objective ID must be a positive integer')
    })
    .refine(
      (data) => {
        const hasTeam =
          data.responsible_team_id !== null &&
          data.responsible_team_id !== undefined;
        const hasUsers = data.responsible_users.length > 0;

        // Deve ter pelo menos um responsável (time ou usuários)
        return hasTeam || hasUsers;
      },
      {
        message: 'Must have either responsible_team_id or responsible_users',
        path: ['responsible_team_id']
      }
    )
    .refine(
      (data) => {
        const hasTeam =
          data.responsible_team_id !== null &&
          data.responsible_team_id !== undefined;
        const hasUsers = data.responsible_users.length > 0;

        // Não pode ter ambos ao mesmo tempo
        return !(hasTeam && hasUsers);
      },
      {
        message: 'Cannot have both responsible_team_id and responsible_users',
        path: ['responsible_team_id']
      }
    )
    .refine(
      (data) => {
        // Target value deve ser maior que initial value
        return data.target_value > data.initial_value;
      },
      {
        message: 'Target value must be greater than initial value',
        path: ['target_value']
      }
    )
    .refine(
      (data) => {
        // Current value deve estar entre initial e target (ou pode ultrapassar)
        return data.current_value >= data.initial_value;
      },
      {
        message: 'Current value must be greater than or equal to initial value',
        path: ['current_value']
      }
    )
});
