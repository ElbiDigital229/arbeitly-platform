import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const CreateApplicationDto = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobUrl: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(ApplicationStatus).optional(),
  appliedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  salary: z.string().max(255).optional(),
  contactPerson: z.string().max(255).optional(),
  nextAction: z.string().max(255).optional(),
  jobDescription: z.string().optional(),
  cvUsed: z.string().max(255).optional(),
  references: z.string().max(255).optional(),
});

export type CreateApplicationDtoType = z.infer<typeof CreateApplicationDto>;

export const UpdateApplicationDto = z.object({
  companyName: z.string().min(1).optional(),
  jobTitle: z.string().min(1).optional(),
  jobUrl: z.string().optional().or(z.literal('')),
  status: z.nativeEnum(ApplicationStatus).optional(),
  appliedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  salary: z.string().max(255).optional(),
  contactPerson: z.string().max(255).optional(),
  nextAction: z.string().max(255).optional(),
  jobDescription: z.string().optional(),
  cvUsed: z.string().max(255).optional(),
  references: z.string().max(255).optional(),
});

export const BulkCreateApplicationDto = z.object({
  applications: z.array(CreateApplicationDto).min(1).max(100),
});

export type UpdateApplicationDtoType = z.infer<typeof UpdateApplicationDto>;
