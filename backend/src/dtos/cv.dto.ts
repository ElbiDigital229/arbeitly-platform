import { z } from 'zod';

export const CreateCVDto = z.object({
  title: z.string().min(1, 'Title is required'),
  editorData: z.any().optional(),
  htmlContent: z.string().optional(),
  style: z.string().optional(),
  language: z.string().optional(),
});

export type CreateCVDtoType = z.infer<typeof CreateCVDto>;

export const UpdateCVDto = z.object({
  title: z.string().min(1, 'Title must not be empty').optional(),
  editorData: z.any().optional(),
  htmlContent: z.string().optional(),
  style: z.string().optional(),
  language: z.string().optional(),
});

export type UpdateCVDtoType = z.infer<typeof UpdateCVDto>;
