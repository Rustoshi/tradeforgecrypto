"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { collections, toObjectId, type User, type Transaction, type KYC, type AppSettings } from "@/lib/db";
import { getCurrentUser, getUserSession } from "@/lib/user-auth";
import { sendTransactionEmail } from "@/lib/services/email";
import {
  withdrawalRequestSchema,
  type WithdrawalRequestInput,
  type WithdrawalMethod,
} from "@/lib/validations/withdrawal";

export interface WithdrawalEligibility {
  eligible: boolean;
  reason?: string;
  hasPIN: boolean;
  hasWithdrawalFee: boolean;
  withdrawalFee?: number;
  withdrawalFeeInstruction?: string;
  hasSignalFee: boolean;
  signalFeeInstruction?: string;
  hasTierUpgrade: boolean;
  tierUpgradeInstruction?: string;
  tier?: number;
  kycStatus?: string;
  isSuspended?: boolean;
  isBlocked?: boolean;
  fiatBalance: number;
  btcBalance: number;
}

// Check if user is eligible to withdraw
export async function checkWithdrawalEligibility(): Promise<WithdrawalEligibility> {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      eligible: false,
      reason: "User not authenticated",
      hasPIN: false,
      hasWithdrawalFee: false,
      hasSignalFee: false,
      hasTierUpgrade: false,
      fiatBalance: 0,
      btcBalance: 0,
    };
  }

  // Check KYC status
  const kyc = await collections.kyc().findOne({ userId: toObjectId(user.id) }) as KYC | null;
  const kycStatus = kyc?.status || "NOT_SUBMITTED";

  // Get app settings for default withdrawal fee instruction
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;

  const result: WithdrawalEligibility = {
    eligible: true,
    hasPIN: !!user.transactionPIN,
    hasWithdrawalFee: (user.withdrawalFee || 0) > 0,
    withdrawalFee: user.withdrawalFee || 0,
    withdrawalFeeInstruction: user.withdrawalFeeInstruction || settings?.defaultWithdrawalInstruction,
    hasSignalFee: !!user.signalFeeEnabled,
    signalFeeInstruction: user.signalFeeInstruction,
    hasTierUpgrade: !!user.tierUpgradeEnabled,
    tierUpgradeInstruction: user.tierUpgradeInstruction,
    tier: user.tier || 1,
    kycStatus,
    isSuspended: user.isSuspended,
    isBlocked: user.isBlocked,
    fiatBalance: user.fiatBalance || 0,
    btcBalance: user.bitcoinBalance || 0,
  };

  // Check blocking conditions
  if (user.isBlocked) {
    result.eligible = false;
    result.reason = "Your account has been blocked. Please contact support.";
  } else if (user.isSuspended) {
    result.eligible = false;
    result.reason = "Your account is suspended. Please contact support.";
  } else if (kycStatus !== "APPROVED") {
    result.eligible = false;
    result.reason = kycStatus === "PENDING" 
      ? "Your KYC verification is pending. Please wait for approval."
      : "Please complete KYC verification before making withdrawals.";
  }

  return result;
}

// Verify user's transaction PIN
export async function verifyTransactionPIN(pin: string): Promise<{ valid: boolean; error?: string }> {
  const session = await getUserSession();
  
  if (!session) {
    return { valid: false, error: "User not authenticated" };
  }

  // Fetch user directly from DB to ensure we have the latest PIN
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
  
  if (!user) {
    return { valid: false, error: "User not found" };
  }

  if (!user.transactionPIN) {
    return { valid: false, error: "Transaction PIN not set" };
  }

  // Plain text comparison
  if (pin !== user.transactionPIN) {
    return { valid: false, error: "Invalid PIN. If you've forgotten your PIN, please contact support to retrieve it." };
  }

  return { valid: true };
}

// Set or update transaction PIN
export async function setTransactionPIN(pin: string): Promise<{ success: boolean; error?: string }> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return { success: false, error: "PIN must be exactly 4 digits" };
  }

  // Store PIN as plain text
  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    { 
      $set: { 
        transactionPIN: pin,
        updatedAt: new Date(),
      } 
    }
  );

  revalidatePath("/dashboard/withdraw");
  revalidatePath("/dashboard/settings");
  
  return { success: true };
}

// Process withdrawal request
export async function requestWithdrawal(input: WithdrawalRequestInput): Promise<{
  success: boolean;
  error?: string;
  transactionId?: string;
  reference?: string;
}> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  // Validate input
  const validated = withdrawalRequestSchema.safeParse(input);
  if (!validated.success) {
    const issues = validated.error.issues || [];
    return { success: false, error: issues[0]?.message || "Invalid input" };
  }

  const { balanceType, amount, method, withdrawalDetails, pin } = validated.data;

  // Get user
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Check account status
  if (user.isBlocked) {
    return { success: false, error: "Your account has been blocked. Please contact support." };
  }

  if (user.isSuspended) {
    return { success: false, error: "Your account is suspended. Please contact support." };
  }

  // Check KYC
  const kyc = await collections.kyc().findOne({ userId: user._id }) as KYC | null;
  if (!kyc || kyc.status !== "APPROVED") {
    return { success: false, error: "Please complete KYC verification before making withdrawals." };
  }

  // Check balance
  const balance = balanceType === "BTC" ? user.bitcoinBalance : user.fiatBalance;
  if (balance < amount) {
    return { success: false, error: `Insufficient ${balanceType === "BTC" ? "Bitcoin" : "fiat"} balance` };
  }

  // Verify PIN (plain text comparison)
  if (!user.transactionPIN) {
    return { success: false, error: "Please set up your transaction PIN first" };
  }

  if (pin !== user.transactionPIN) {
    return { success: false, error: "Invalid PIN. If you've forgotten your PIN, please contact support to retrieve it." };
  }

  // Check withdrawal fee
  if ((user.withdrawalFee || 0) > 0) {
    const settings = await collections.appSettings().findOne({}) as AppSettings | null;
    const instruction = user.withdrawalFeeInstruction || settings?.defaultWithdrawalInstruction || 
      "Please pay the required withdrawal fee to process your transaction. Contact support for payment details.";
    
    return { 
      success: false, 
      error: `WITHDRAWAL_FEE_REQUIRED:${user.withdrawalFee}:${instruction}` 
    };
  }

  // Check signal fee (shown after withdrawal fee is cleared)
  if (user.signalFeeEnabled) {
    const instruction = user.signalFeeInstruction || 
      "Signal fee payment is required to process your withdrawal. Contact support for payment details.";
    
    return { 
      success: false, 
      error: `SIGNAL_FEE_REQUIRED:${instruction}` 
    };
  }

  // Check tier upgrade requirement (shown after signal fee is cleared)
  if (user.tierUpgradeEnabled) {
    const tier = user.tier || 1;
    const instruction = user.tierUpgradeInstruction || 
      `You cannot make withdrawals because you are still in Tier ${tier}. You need to upgrade to Tier 3 to enable withdrawals. Please contact support for assistance.`;
    
    return { 
      success: false, 
      error: `TIER_UPGRADE_REQUIRED:${tier}:${instruction}` 
    };
  }

  // Create pending withdrawal transaction
  const now = new Date();
  const reference = `WD-${randomUUID().slice(0, 8).toUpperCase()}`;
  
  const result = await collections.transactions().insertOne({
    userId: user._id,
    type: "WITHDRAWAL",
    asset: balanceType,
    amount,
    status: "PENDING",
    reference,
    description: `${getMethodName(method)} withdrawal`,
    withdrawalMethod: method,
    withdrawalDetails: withdrawalDetails || {},
    createdAt: now,
    updatedAt: now,
  });

  // Deduct balance immediately (will be refunded if declined)
  const balanceField = balanceType === "BTC" ? "bitcoinBalance" : "fiatBalance";
  await collections.users().updateOne(
    { _id: user._id },
    { 
      $inc: { [balanceField]: -amount },
      $set: { updatedAt: now },
    }
  );

  // Send pending withdrawal email
  await sendTransactionEmail(user.email, {
    type: "WITHDRAWAL",
    status: "PENDING",
    amount,
    asset: balanceType,
    reference,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/withdraw");
  revalidatePath("/dashboard/transactions");

  return { 
    success: true, 
    transactionId: result.insertedId.toString(),
    reference,
  };
}

// Get user's withdrawal history
export async function getUserWithdrawals(limit: number = 10) {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const withdrawals = await collections.transactions()
    .find({ 
      userId: toObjectId(session.userId),
      type: "WITHDRAWAL",
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Transaction[];

  return withdrawals.map(tx => ({
    id: tx._id.toString(),
    amount: tx.amount,
    asset: tx.asset,
    status: tx.status,
    reference: tx.reference,
    description: tx.description,
    createdAt: tx.createdAt,
    approvedAt: tx.approvedAt,
  }));
}

// Helper function to get method display name
function getMethodName(method: WithdrawalMethod): string {
  const names: Record<WithdrawalMethod, string> = {
    BANK_TRANSFER: "Bank Transfer",
    BITCOIN: "Bitcoin",
    ETHEREUM: "Ethereum",
    CASHAPP: "Cash App",
    PAYPAL: "PayPal",
    ZELLE: "Zelle",
  };
  return names[method] || method;
}

// Refund withdrawal (called when admin declines)
export async function refundWithdrawal(transactionId: string): Promise<{ success: boolean; error?: string }> {
  const tx = await collections.transactions().findOne({ _id: toObjectId(transactionId) }) as Transaction | null;
  
  if (!tx) {
    return { success: false, error: "Transaction not found" };
  }

  if (tx.type !== "WITHDRAWAL") {
    return { success: false, error: "Transaction is not a withdrawal" };
  }

  if (tx.status !== "PENDING") {
    return { success: false, error: "Transaction has already been processed" };
  }

  // Refund the balance
  const balanceField = tx.asset === "BTC" ? "bitcoinBalance" : "fiatBalance";
  await collections.users().updateOne(
    { _id: tx.userId },
    { 
      $inc: { [balanceField]: tx.amount },
      $set: { updatedAt: new Date() },
    }
  );

  return { success: true };
}
