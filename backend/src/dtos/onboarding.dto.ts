import { z } from 'zod';

export const OnboardingDto = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  baseCoverLetter: z.string().optional(),
  dummyEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  dummyPassword: z.string().optional(),
  preferredLanguage: z.enum(['de', 'en']).optional(),
  // Step 1: Personal Details
  applicationEmail: z.string().optional(),
  linkedin: z.string().optional(),
  dob: z.string().optional(),
  placeOfBirth: z.string().optional(),
  address: z.string().optional(),
  // Step 2: Professional Background
  currentJobTitle: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentField: z.string().optional(),
  yearsExperience: z.string().optional(),
  currentSalary: z.string().optional(),
  workedInGermany: z.string().optional(),
  noticePeriod: z.string().optional(),
  highestStudy: z.string().optional(),
  degreeTitle: z.string().optional(),
  university: z.string().optional(),
  universityLocation: z.string().optional(),
  // Step 3: Skills & Career Goals
  topSkills: z.string().optional(),
  certifications: z.string().optional(),
  careerGoal: z.string().optional(),
  targetRoles: z.string().optional(),
  targetIndustries: z.string().optional(),
  employmentType: z.string().optional(),
  preferredLocation: z.string().optional(),
  openToRelocation: z.string().optional(),
  preferredSalary: z.string().optional(),
  targetCompanies: z.string().optional(),
  openToCareerChange: z.string().optional(),
  // Step 4: Final Details
  germanLevel: z.string().optional(),
  drivingLicense: z.string().optional(),
  transitionMotivation: z.string().optional(),
  trainingNeeds: z.string().optional(),
  howHeard: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type OnboardingDtoType = z.infer<typeof OnboardingDto>;
