import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').refine((val) => {
    return val.endsWith('@gmail.com') || val.endsWith('@assetflow.com');
  }, {
    message: 'Only verified email accounts ending with @gmail.com are permitted.',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').refine((val) => {
    return val.endsWith('@gmail.com') || val.endsWith('@assetflow.com');
  }, {
    message: 'Only verified email accounts ending with @gmail.com are permitted.',
  }),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').refine((val) => {
    return val.endsWith('@gmail.com') || val.endsWith('@assetflow.com');
  }, {
    message: 'Only verified email accounts ending with @gmail.com are permitted.',
  }),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
