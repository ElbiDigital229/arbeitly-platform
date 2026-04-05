import { z } from 'zod';

export const CreatePlanDto = z.object({
  name: z.string().min(1, 'Plan name is required').max(50),
  description: z.string().max(500).optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('EUR'),
  applicationLimit: z.number().int().min(0, 'Application limit must be positive'),
  features: z.array(z.object({ text: z.string(), included: z.boolean() })).default([]),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export type CreatePlanDtoType = z.infer<typeof CreatePlanDto>;

export const UpdatePlanDto = CreatePlanDto.partial();

export type UpdatePlanDtoType = z.infer<typeof UpdatePlanDto>;
