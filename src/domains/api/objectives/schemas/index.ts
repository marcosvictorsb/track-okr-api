import { z } from 'zod';

export const createObjectiveSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    id_team: z.number().int().positive('Team ID must be a positive integer'),
    quarter: z
      .number()
      .int()
      .min(1, 'Quarter must be between 1 and 4')
      .max(4, 'Quarter must be between 1 and 4'),
    year: z
      .number()
      .int()
      .min(2020, 'Year must be 2020 or later')
      .max(2100, 'Year must be 2100 or earlier')
  })
});

export const updateObjectiveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title too long')
      .optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'cancelled', 'completed']).optional(),
    quarter: z
      .number()
      .int()
      .min(1, 'Quarter must be between 1 and 4')
      .max(4, 'Quarter must be between 1 and 4')
      .optional(),
    year: z
      .number()
      .int()
      .min(new Date().getFullYear(), 'Year must be 2020 or later')
      .max(2100, 'Year must be 2100 or earlier')
      .optional()
  })
});

export const getObjectiveSchema = z.object({
  query: z.object({
    id_team: z
      .string()
      .regex(/^\d+$/, 'Team ID must be a number')
      .transform(Number)
      .optional(),
    quarter: z
      .string()
      .regex(/^\d+$/, 'Quarter must be a number')
      .transform(Number)
      .optional(),
    year: z
      .string()
      .regex(/^\d+$/, 'Year must be a number')
      .transform(Number)
      .optional(),
    status: z.enum(['active', 'cancelled', 'completed']).optional()
  })
});

export const deleteObjectiveSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
  })
});
