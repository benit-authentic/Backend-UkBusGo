import { z } from 'zod';

export const transactionSchema = z.object({
  user: z.string().min(1),
  type: z.enum(['recharge', 'purchase']),
  amount: z.number().positive(),
  identifier: z.string().min(1),
  network: z.enum(['FLOOZ', 'TMONEY']),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
