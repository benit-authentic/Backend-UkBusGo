import { z } from 'zod';

export const validationSchema = z.object({
  student: z.string().min(1),
  driver: z.string().min(1),
  amount: z.number().positive(),
  isValid: z.boolean().optional(),
});

export type ValidationInput = z.infer<typeof validationSchema>;
