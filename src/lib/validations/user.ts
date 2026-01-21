import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dob: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().default("USD"),
  fiatBalance: z.number().min(0).default(0),
  bitcoinBalance: z.number().min(0).default(0),
  profitBalance: z.number().min(0).default(0),
  totalBonus: z.number().min(0).default(10),
  withdrawalFee: z.number().min(0).default(0),
  withdrawalFeeInstruction: z.string().optional(),
  signalFeeEnabled: z.boolean().default(false),
  signalFeeInstruction: z.string().optional(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  tierUpgradeEnabled: z.boolean().default(false),
  tierUpgradeInstruction: z.string().optional(),
  transactionPIN: z.string().min(4).max(6).optional(),
  accountAge: z.string().optional(), // ISO date string for custom account creation date
  currentPlanId: z.string().optional(),
  sendWelcomeEmail: z.boolean().default(false),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string(),
});

export const updateUserBalanceSchema = z.object({
  userId: z.string(),
  fiatBalance: z.number().min(0).optional(),
  bitcoinBalance: z.number().min(0).optional(),
  profitBalance: z.number().min(0).optional(),
  totalBonus: z.number().min(0).optional(),
});

export const userActionSchema = z.object({
  userId: z.string(),
  action: z.enum(["suspend", "unsuspend", "block", "unblock", "resetPin"]),
});

// Comprehensive admin edit schema for all user fields
export const adminEditUserSchema = z.object({
  userId: z.string(),
  // Personal info
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rawPassword: z.string().optional(), // Plain text password for admin visibility
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  currency: z.string(),
  // Balances
  fiatBalance: z.number().min(0),
  bitcoinBalance: z.number().min(0),
  profitBalance: z.number().min(0),
  totalDeposited: z.number().min(0),
  totalWithdrawn: z.number().min(0),
  activeInvestment: z.number().min(0),
  totalBonus: z.number().min(0),
  // Settings
  withdrawalFee: z.number().min(0),
  withdrawalFeeInstruction: z.string().optional(),
  signalFeeEnabled: z.boolean(),
  signalFeeInstruction: z.string().optional(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tierUpgradeEnabled: z.boolean(),
  tierUpgradeInstruction: z.string().optional(),
  transactionPIN: z.string().optional(),
  // Status
  isSuspended: z.boolean(),
  isBlocked: z.boolean(),
  kycStatus: z.enum(["PENDING", "APPROVED", "DECLINED"]).optional(),
  // Dates
  createdAt: z.string(), // ISO date string
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserBalanceInput = z.infer<typeof updateUserBalanceSchema>;
export type UserActionInput = z.infer<typeof userActionSchema>;
export type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;
