import { z } from 'zod';

export const PurchasePlanDto = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  mockCard: z
    .object({
      name: z.string().optional(),
      last4: z.string().max(4).optional(),
      expiry: z.string().optional(),
    })
    .optional(),
});

export type PurchasePlanDtoType = z.infer<typeof PurchasePlanDto>;
