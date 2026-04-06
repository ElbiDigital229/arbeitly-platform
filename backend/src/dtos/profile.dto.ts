import { z } from 'zod';

export const UpdateProfileDto = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  marketingData: z.object({
    industry: z.string(),
    targetCountry: z.string(),
    howHeard: z.string(),
  }).optional(),
});

export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
