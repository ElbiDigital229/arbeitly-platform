import { z } from 'zod';

export const OnboardingDto = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  baseCoverLetter: z.string().optional(),
});

export type OnboardingDtoType = z.infer<typeof OnboardingDto>;
