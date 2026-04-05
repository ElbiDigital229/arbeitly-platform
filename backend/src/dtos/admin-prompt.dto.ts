import { z } from 'zod';

export const CreateAdminPromptDto = z.object({
  type: z.enum(['CV_ENHANCEMENT', 'CL_ENHANCEMENT', 'CL_GENERATION', 'JOB_MATCHING']),
  name: z.string().min(1, 'Name is required').max(100),
  prompt: z.string().min(1, 'Prompt text is required'),
  isActive: z.boolean().default(true),
});

export type CreateAdminPromptDtoType = z.infer<typeof CreateAdminPromptDto>;

export const UpdateAdminPromptDto = CreateAdminPromptDto.partial();
export type UpdateAdminPromptDtoType = z.infer<typeof UpdateAdminPromptDto>;
