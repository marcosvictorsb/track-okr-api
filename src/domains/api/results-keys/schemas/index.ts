import { z } from 'zod';

export const createResultKeySchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
      initial_value: z.number().min(0, 'Initial value must be non-negative'),
      target_value: z.number().min(0, 'Target value must be non-negative'),
      current_value: z.number().min(0, 'Current value must be non-negative'),
      unit: z.string().min(1, 'Unit is required').max(100, 'Unit too long'),
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

export const updateResultKeySchema = z.object({
  params: z.object({
    id: z.string().transform((val) => {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed <= 0) {
        throw new Error('ID must be a positive integer');
      }
      return parsed;
    })
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name too long')
        .optional(),
      initial_value: z
        .number()
        .min(0, 'Initial value must be non-negative')
        .optional(),
      target_value: z
        .number()
        .min(0, 'Target value must be non-negative')
        .optional(),
      current_value: z
        .number()
        .min(0, 'Current value must be non-negative')
        .optional(),
      unit: z
        .string()
        .min(1, 'Unit is required')
        .max(50, 'Unit too long')
        .optional(),
      responsible_team_id: z.number().int().positive().nullable().optional(),
      responsible_users: z.array(z.number().int().positive()).optional()
    })
    .refine(
      (data) => {
        // Se fornecidos ambos, não pode ter team e users ao mesmo tempo
        if (
          data.responsible_team_id !== undefined &&
          data.responsible_users !== undefined
        ) {
          const hasTeam = data.responsible_team_id !== null;
          const hasUsers = data.responsible_users.length > 0;
          return !(hasTeam && hasUsers);
        }
        return true;
      },
      {
        message: 'Cannot have both responsible_team_id and responsible_users',
        path: ['responsible_team_id']
      }
    )
    .refine(
      (data) => {
        // Se target e initial são fornecidos, target deve ser maior
        if (
          data.target_value !== undefined &&
          data.initial_value !== undefined
        ) {
          return data.target_value > data.initial_value;
        }
        return true;
      },
      {
        message: 'Target value must be greater than initial value',
        path: ['target_value']
      }
    )
    .refine(
      (data) => {
        // Se current e initial são fornecidos, current deve ser >= inicial
        if (
          data.current_value !== undefined &&
          data.initial_value !== undefined
        ) {
          return data.current_value >= data.initial_value;
        }
        return true;
      },
      {
        message: 'Current value must be greater than or equal to initial value',
        path: ['current_value']
      }
    )
});
