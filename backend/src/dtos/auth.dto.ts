import { z } from 'zod';

export const RegisterDto = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(10, 'Password must be at least 10 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterDtoType = z.infer<typeof RegisterDto>;

export const LoginDto = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDtoType = z.infer<typeof LoginDto>;

export const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(10, 'New password must be at least 10 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export type ChangePasswordDtoType = z.infer<typeof ChangePasswordDto>;
