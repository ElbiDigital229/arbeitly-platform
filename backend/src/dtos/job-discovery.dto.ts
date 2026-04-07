import { z } from 'zod';

export const CreateJobDiscoveryDto = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  company: z.string().min(1, 'Company name is required').max(200),
  url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  requirements: z.string().optional(),
});

export type CreateJobDiscoveryDtoType = z.infer<typeof CreateJobDiscoveryDto>;

export const UpdateJobDiscoveryDto = CreateJobDiscoveryDto.partial();
export type UpdateJobDiscoveryDtoType = z.infer<typeof UpdateJobDiscoveryDto>;

export const BulkCreateJobDiscoveryDto = z.object({
  jobs: z.array(CreateJobDiscoveryDto).min(1, 'At least one job is required').max(500, 'Maximum 500 jobs per import'),
});
export type BulkCreateJobDiscoveryDtoType = z.infer<typeof BulkCreateJobDiscoveryDto>;
