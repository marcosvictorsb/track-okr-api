import { z } from 'zod';

export const getCurrentSubscriptionSchema = z.object({
  body: z.object({
    id_company: z
      .number()
      .int()
      .positive('ID da empresa deve ser um número positivo'),
    id_user: z
      .number()
      .int()
      .positive('ID do usuário deve ser um número positivo')
  })
});
