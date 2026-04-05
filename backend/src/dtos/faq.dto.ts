import { z } from 'zod';

export const CreateFaqDto = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().optional(),
});

export const UpdateFaqDto = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().optional(),
  isApproved: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateFaqDtoType = z.infer<typeof CreateFaqDto>;
export type UpdateFaqDtoType = z.infer<typeof UpdateFaqDto>;
