"use server";

import { revalidatePath } from "next/cache";
import { collections, toObjectId, type User, type Transaction } from "@/lib/db";
import { getUserSession, getCurrentUser } from "@/lib/user-auth";
import { sendDepositSubmittedEmail } from "@/lib/services/email";
import { randomUUID } from "crypto";
import { z } from "zod";

// Input type for deposit submission
export interface SubmitDepositInput {
  amount: number;
  cryptoAmount?: number | null;
  cryptoCurrency?: string | null;
  walletAddress?: string | null;
  walletNetwork?: string | null;
  depositProofUrl: string;
  paymentMethodId?: string | null;
  paymentMethodType?: string | null;
  paymentMethodName?: string | null;
}

// Validation schema for deposit submission
const submitDepositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  cryptoAmount: z.number().positive("Crypto amount must be positive").optional().nullable(),
  cryptoCurrency: z.string().optional().nullable(),
  walletAddress: z.string().optional().nullable(),
  walletNetwork: z.string().optional().nullable(),
  depositProofUrl: z.string().url("Valid proof URL is required"),
  paymentMethodId: z.string().optional().nullable(),
  paymentMethodType: z.string().optional().nullable(),
  paymentMethodName: z.string().optional().nullable(),
});

export interface DepositResult {
  success: boolean;
  transactionId?: string;
  reference?: string;
  error?: string;
}

// Submit a new deposit request
export async function submitDeposit(input: SubmitDepositInput): Promise<DepositResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "You must be logged in to make a deposit" };
  }

  try {
    const validated = submitDepositSchema.parse(input);

    const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const reference = `DEP-${randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date();

    // Determine description based on payment method
    const paymentDescription = validated.paymentMethodName 
      ? `Deposit via ${validated.paymentMethodName}`
      : validated.walletNetwork 
        ? `Deposit via ${validated.walletNetwork}`
        : "Deposit";

    const result = await collections.transactions().insertOne({
      userId: toObjectId(session.userId),
      type: "DEPOSIT",
      asset: "FIAT",
      amount: validated.amount,
      cryptoAmount: validated.cryptoAmount,
      cryptoCurrency: validated.cryptoCurrency,
      walletAddress: validated.walletAddress,
      walletNetwork: validated.walletNetwork,
      depositProofUrl: validated.depositProofUrl,
      paymentMethodId: validated.paymentMethodId,
      paymentMethodType: validated.paymentMethodType,
      paymentMethodName: validated.paymentMethodName,
      status: "PENDING",
      reference,
      description: paymentDescription,
      createdAt: now,
      updatedAt: now,
    });

    // Send email notification to user
    await sendDepositSubmittedEmail(user.email, {
      fullName: user.fullName,
      amount: validated.amount,
      currency: user.currency || "USD",
      cryptoAmount: validated.cryptoAmount || 0,
      cryptoCurrency: validated.cryptoCurrency || validated.paymentMethodName || "N/A",
      reference,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/deposit");

    return {
      success: true,
      transactionId: result.insertedId.toString(),
      reference,
    };
  } catch (error) {
    console.error("Deposit submission error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to submit deposit" };
  }
}

// Get user's pending deposits
export interface UserDeposit {
  id: string;
  amount: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  walletNetwork?: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  reference: string;
  depositProofUrl?: string;
  createdAt: Date;
}

export async function getUserDeposits(): Promise<UserDeposit[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const deposits = await collections.transactions()
    .find({ 
      userId: toObjectId(session.userId),
      type: "DEPOSIT"
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray() as Transaction[];

  return deposits.map(tx => ({
    id: tx._id.toString(),
    amount: tx.amount,
    cryptoAmount: tx.cryptoAmount,
    cryptoCurrency: tx.cryptoCurrency,
    walletNetwork: tx.walletNetwork,
    status: tx.status,
    reference: tx.reference,
    depositProofUrl: tx.depositProofUrl,
    createdAt: tx.createdAt,
  }));
}

// Get user's currency for display
export async function getUserCurrency(): Promise<string> {
  const user = await getCurrentUser();
  return user?.currency || "USD";
}
