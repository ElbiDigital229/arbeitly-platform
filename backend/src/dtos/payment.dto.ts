import { z } from 'zod';

export const PurchasePlanDto = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
});

export type PurchasePlanDtoType = z.infer<typeof PurchasePlanDto>;
