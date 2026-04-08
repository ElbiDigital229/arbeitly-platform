import { z } from 'zod';

/**
 * Onboarding submission DTO.
 *
 * The onboarding form is driven by `src/config/onboarding-questions.json`,
 * so the user can add/remove/rename questions there without touching code.
 * To stay flexible we accept any extra fields and route unknown ones into
 * `onboardingData` JSON. The fields explicitly listed below are the ones
 * that map to dedicated columns on CandidateProfile and get type-checked.
 */
export const OnboardingDto = z
  .object({
    // Basics
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().optional(),
    preferredLanguage: z.enum(['de', 'en']).optional(),

    // Current situation
    currentRoleId: z.string().optional().nullable(),
    yearsExperienceMin: z.number().int().optional().nullable(),
    yearsExperienceMax: z.number().int().optional().nullable(),
    skillIds: z.array(z.string()).optional(),

    // Goals
    targetRoleIds: z.array(z.string()).optional(),
    targetIndustryIds: z.array(z.string()).optional(),
    careerGoal: z.string().optional().nullable(),

    // Logistics
    baseLocation: z
      .object({ city: z.string().optional(), country: z.string().optional() })
      .optional(),
    acceptsRemote: z.boolean().optional(),
    willingToRelocate: z.boolean().optional(),
    acceptedCities: z.union([z.string(), z.array(z.string())]).optional(),
    salaryRange: z
      .object({
        min: z.number().int().optional().nullable(),
        max: z.number().int().optional().nullable(),
        currency: z.string().optional(),
      })
      .optional(),
    candidateLanguages: z
      .array(z.object({ language: z.string(), level: z.string() }))
      .optional(),
    workAuth: z.array(z.string()).optional(),
  })
  .passthrough(); // any extra keys land in onboardingData

export type OnboardingDtoType = z.infer<typeof OnboardingDto>;
