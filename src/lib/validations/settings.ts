import { z } from "zod";

export const depositWalletSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Wallet name is required"),
  address: z.string().min(1, "Wallet address is required"),
  network: z.string().min(1, "Network is required"),
  isActive: z.boolean().default(true),
});

export const depositMethodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Method name is required"),
  type: z.enum(["CRYPTO", "BANK", "CARD"]),
  instructions: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateAppSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required").optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  depositWallets: z.array(depositWalletSchema).optional(),
  depositMethods: z.array(depositMethodSchema).optional(),
  defaultWithdrawalInstruction: z.string().optional(),
  defaultWithdrawalFee: z.number().min(0).optional(),
});

export const investmentPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Plan name is required"),
  minAmount: z.number().positive("Minimum amount must be positive"),
  maxAmount: z.number().positive("Maximum amount must be positive"),
  roiPercentage: z.number().positive("ROI must be positive"),
  durationDays: z.number().int().positive("Duration must be positive"),
  isActive: z.boolean(),
});

export type DepositWallet = z.infer<typeof depositWalletSchema>;
export type DepositMethod = z.infer<typeof depositMethodSchema>;
export type UpdateAppSettingsInput = z.infer<typeof updateAppSettingsSchema>;
export type InvestmentPlanInput = z.infer<typeof investmentPlanSchema>;
