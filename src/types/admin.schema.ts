import { z } from 'zod';

export const adminRegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(8).max(15),
  password: z.string().min(8),
});

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
