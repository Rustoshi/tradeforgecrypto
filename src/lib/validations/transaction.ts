import { z } from "zod";

export const createTransactionSchema = z.object({
  userId: z.string(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "PROFIT", "BONUS"]),
  asset: z.enum(["FIAT", "BTC"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  backdatedAt: z.string().optional(), // ISO date string for backdating
});

export const updateTransactionStatusSchema = z.object({
  transactionId: z.string(),
  status: z.enum(["APPROVED", "DECLINED"]),
});

export const transactionFilterSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "PROFIT", "BONUS"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "DECLINED"]).optional(),
  asset: z.enum(["FIAT", "BTC"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
