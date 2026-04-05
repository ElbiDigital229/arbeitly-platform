import { z } from 'zod';

export const CreateCheckoutDto = z.object({
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
});

export type CreateCheckoutDtoType = z.infer<typeof CreateCheckoutDto>;
