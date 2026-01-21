"use server";

import { revalidatePath } from "next/cache";
import { collections, toObjectId, type User, type Transaction } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getUserSession } from "@/lib/user-auth";
import { createAuditLog, AuditActions } from "@/lib/services/audit";
import {
  sendDepositApprovedEmail,
  sendDepositDeclinedEmail,
  sendWithdrawalApprovedEmail,
  sendWithdrawalDeclinedEmail,
  sendAdminDepositEmail,
  sendAdminWithdrawalEmail,
  sendProfitCreditedEmail,
  sendBonusCreditedEmail,
} from "@/lib/services/email";
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  transactionFilterSchema,
  type CreateTransactionInput,
  type UpdateTransactionStatusInput,
  type TransactionFilterInput,
} from "@/lib/validations/transaction";
import { randomUUID } from "crypto";

export async function getTransactions(params?: Partial<TransactionFilterInput>) {
  await requireAdmin();

  const validated = transactionFilterSchema.parse(params || {});
  const { page, limit, ...filters } = validated;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (filters.userId) filter.userId = toObjectId(filters.userId);
  if (filters.type) filter.type = filters.type;
  if (filters.status) filter.status = filters.status;
  if (filters.asset) filter.asset = filters.asset;

  if (filters.startDate || filters.endDate) {
    filter.createdAt = {};
    if (filters.startDate) {
      (filter.createdAt as Record<string, Date>).$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      (filter.createdAt as Record<string, Date>).$lte = new Date(filters.endDate);
    }
  }

  const [transactionsRaw, total] = await Promise.all([
    collections.transactions()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collections.transactions().countDocuments(filter),
  ]);

  // Get related user and admin data - properly serialize all ObjectIds
  const transactions = await Promise.all(
    transactionsRaw.map(async (tx) => {
      const [user, createdByAdmin] = await Promise.all([
        collections.users().findOne({ _id: tx.userId }, { projection: { fullName: 1, email: 1 } }),
        tx.createdByAdminId ? collections.admins().findOne({ _id: tx.createdByAdminId }, { projection: { name: 1 } }) : null,
      ]);
      
      // Destructure to remove _id and serialize properly
      const { _id, userId, createdByAdminId, ...txData } = tx;
      
      return {
        ...txData,
        id: _id.toString(),
        userId: userId?.toString() || null,
        createdByAdminId: createdByAdminId?.toString() || null,
        user: user ? { id: user._id.toString(), fullName: user.fullName, email: user.email } : null,
        createdByAdmin: createdByAdmin ? { id: createdByAdmin._id.toString(), name: createdByAdmin.name } : null,
      };
    })
  );

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTransactionById(id: string) {
  await requireAdmin();

  const tx = await collections.transactions().findOne({ _id: toObjectId(id) }) as Transaction | null;
  if (!tx) return null;

  const [user, createdByAdmin] = await Promise.all([
    collections.users().findOne({ _id: tx.userId }),
    tx.createdByAdminId ? collections.admins().findOne({ _id: tx.createdByAdminId }, { projection: { name: 1, email: 1 } }) : null,
  ]);

  return {
    ...tx,
    id: tx._id.toString(),
    user: user ? { ...user, id: user._id.toString() } : null,
    createdByAdmin: createdByAdmin ? { id: createdByAdmin._id.toString(), name: createdByAdmin.name, email: createdByAdmin.email } : null,
  };
}

export async function createTransaction(input: CreateTransactionInput) {
  const admin = await requireAdmin();
  const validated = createTransactionSchema.parse(input);

  const user = await collections.users().findOne({ _id: toObjectId(validated.userId) }) as User | null;
  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();
  const result = await collections.transactions().insertOne({
    userId: toObjectId(validated.userId),
    type: validated.type,
    asset: validated.asset,
    amount: validated.amount,
    description: validated.description,
    status: "APPROVED", // Admin-created transactions are auto-approved
    reference: randomUUID(),
    createdByAdminId: toObjectId(admin.id),
    approvedAt: now,
    backdatedAt: validated.backdatedAt ? new Date(validated.backdatedAt) : undefined,
    createdAt: now,
    updatedAt: now,
  });

  // Update user balance based on transaction type
  await reconcileUserBalance(validated.userId, validated.type, validated.asset, validated.amount);

  await createAuditLog({
    adminId: admin.id,
    action: validated.backdatedAt
      ? AuditActions.TRANSACTION_BACKDATED
      : AuditActions.TRANSACTION_CREATED,
    entityType: "Transaction",
    entityId: result.insertedId.toString(),
    details: {
      userId: validated.userId,
      type: validated.type,
      asset: validated.asset,
      amount: validated.amount,
      backdatedAt: validated.backdatedAt,
    },
  });

  // Send email notification based on transaction type
  const currency = validated.asset === "BTC" ? "BTC" : (user.currency || "USD");
  const emailData = {
    fullName: user.fullName,
    amount: validated.amount,
    currency,
    description: validated.description,
  };

  try {
    switch (validated.type) {
      case "DEPOSIT":
        await sendAdminDepositEmail(user.email, emailData);
        break;
      case "WITHDRAWAL":
        await sendAdminWithdrawalEmail(user.email, emailData);
        break;
      case "PROFIT":
        await sendProfitCreditedEmail(user.email, emailData);
        break;
      case "BONUS":
        await sendBonusCreditedEmail(user.email, emailData);
        break;
    }
  } catch (emailError) {
    console.error("Failed to send transaction email:", emailError);
    // Don't throw - transaction was successful, email is secondary
  }

  revalidatePath("/admin/transactions");
  revalidatePath(`/admin/users/${validated.userId}`);
  return { id: result.insertedId.toString(), ...validated };
}

export async function updateTransactionStatus(input: UpdateTransactionStatusInput) {
  const admin = await requireAdmin();
  const validated = updateTransactionStatusSchema.parse(input);

  const tx = await collections.transactions().findOne({ _id: toObjectId(validated.transactionId) }) as Transaction | null;
  if (!tx) {
    throw new Error("Transaction not found");
  }

  if (tx.status !== "PENDING") {
    throw new Error("Transaction has already been processed");
  }

  const user = await collections.users().findOne({ _id: tx.userId }) as User | null;
  if (!user) {
    throw new Error("User not found");
  }

  await collections.transactions().updateOne(
    { _id: toObjectId(validated.transactionId) },
    { 
      $set: {
        status: validated.status,
        approvedAt: validated.status === "APPROVED" ? new Date() : undefined,
        updatedAt: new Date(),
      }
    }
  );

  // If approved, update user balance
  if (validated.status === "APPROVED") {
    await reconcileUserBalance(
      tx.userId.toString(),
      tx.type,
      tx.asset,
      tx.amount
    );

    // Send email notification
    if (tx.type === "DEPOSIT") {
      await sendDepositApprovedEmail(user.email, {
        fullName: user.fullName,
        amount: tx.amount,
        currency: user.currency || "USD",
        reference: tx.reference,
      });
    } else if (tx.type === "WITHDRAWAL") {
      await sendWithdrawalApprovedEmail(user.email, tx.amount, tx.asset);
    }
  } else {
    // For declined withdrawals, refund the balance (it was deducted when request was made)
    if (tx.type === "WITHDRAWAL") {
      const balanceField = tx.asset === "BTC" ? "bitcoinBalance" : "fiatBalance";
      await collections.users().updateOne(
        { _id: tx.userId },
        { 
          $inc: { [balanceField]: tx.amount },
          $set: { updatedAt: new Date() },
        }
      );
    }
    
    // Send decline email
    if (tx.type === "DEPOSIT") {
      await sendDepositDeclinedEmail(user.email, {
        fullName: user.fullName,
        amount: tx.amount,
        currency: user.currency || "USD",
        reference: tx.reference,
      });
    } else if (tx.type === "WITHDRAWAL") {
      await sendWithdrawalDeclinedEmail(user.email, tx.amount, tx.asset);
    }
  }

  await createAuditLog({
    adminId: admin.id,
    action:
      validated.status === "APPROVED"
        ? AuditActions.TRANSACTION_APPROVED
        : AuditActions.TRANSACTION_DECLINED,
    entityType: "Transaction",
    entityId: tx._id.toString(),
    details: {
      previousStatus: tx.status,
      newStatus: validated.status,
    },
  });

  revalidatePath("/admin/transactions");
  revalidatePath(`/admin/users/${tx.userId.toString()}`);
  return { id: validated.transactionId, status: validated.status };
}

// Helper function to reconcile user balance after transaction
async function reconcileUserBalance(
  userId: string,
  type: string,
  asset: string,
  amount: number
) {
  const balanceField = asset === "BTC" ? "bitcoinBalance" : "fiatBalance";

  switch (type) {
    case "DEPOSIT":
      await collections.users().updateOne(
        { _id: toObjectId(userId) },
        { $inc: { [balanceField]: amount, totalDeposited: amount } }
      );
      break;
    case "WITHDRAWAL":
      // For user-initiated withdrawals, balance is already deducted when request is made
      // Only update totalWithdrawn here (balance was deducted in requestWithdrawal)
      await collections.users().updateOne(
        { _id: toObjectId(userId) },
        { $inc: { totalWithdrawn: amount } }
      );
      break;
    case "PROFIT":
      // Add profit to both profitBalance and fiatBalance
      await collections.users().updateOne(
        { _id: toObjectId(userId) },
        { $inc: { profitBalance: amount, fiatBalance: amount } }
      );
      break;
    case "BONUS":
      await collections.users().updateOne(
        { _id: toObjectId(userId) },
        { $inc: { totalBonus: amount } }
      );
      break;
  }
}

export async function deleteTransaction(transactionId: string) {
  const admin = await requireAdmin();

  const tx = await collections.transactions().findOne({ _id: toObjectId(transactionId) }) as Transaction | null;
  if (!tx) {
    throw new Error("Transaction not found");
  }

  // If the transaction was approved, we need to reverse the balance changes
  if (tx.status === "APPROVED") {
    const userId = tx.userId.toString();
    const balanceField = tx.asset === "BTC" ? "bitcoinBalance" : "fiatBalance";

    switch (tx.type) {
      case "DEPOSIT":
        // Reverse deposit: subtract from balance and totalDeposited
        await collections.users().updateOne(
          { _id: tx.userId },
          { $inc: { [balanceField]: -tx.amount, totalDeposited: -tx.amount } }
        );
        break;
      case "WITHDRAWAL":
        // Reverse withdrawal: add back to balance and subtract from totalWithdrawn
        await collections.users().updateOne(
          { _id: tx.userId },
          { $inc: { [balanceField]: tx.amount, totalWithdrawn: -tx.amount } }
        );
        break;
      case "PROFIT":
        // Reverse profit: subtract from profitBalance and fiatBalance
        await collections.users().updateOne(
          { _id: tx.userId },
          { $inc: { profitBalance: -tx.amount, fiatBalance: -tx.amount } }
        );
        break;
      case "BONUS":
        // Reverse bonus: subtract from totalBonus
        await collections.users().updateOne(
          { _id: tx.userId },
          { $inc: { totalBonus: -tx.amount } }
        );
        break;
    }
  } else if (tx.status === "PENDING" && tx.type === "WITHDRAWAL") {
    // For pending withdrawals, the balance was already deducted - refund it
    const balanceField = tx.asset === "BTC" ? "bitcoinBalance" : "fiatBalance";
    await collections.users().updateOne(
      { _id: tx.userId },
      { $inc: { [balanceField]: tx.amount } }
    );
  }

  // Delete the transaction
  await collections.transactions().deleteOne({ _id: toObjectId(transactionId) });

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.TRANSACTION_DELETED,
    entityType: "Transaction",
    entityId: transactionId,
    details: {
      userId: tx.userId.toString(),
      type: tx.type,
      asset: tx.asset,
      amount: tx.amount,
      status: tx.status,
      reference: tx.reference,
    },
  });

  revalidatePath("/admin/transactions");
  revalidatePath(`/admin/users/${tx.userId.toString()}`);
  return { success: true };
}

export async function getPendingTransactionsCount() {
  await requireAdmin();
  return collections.transactions().countDocuments({ status: "PENDING" });
}

export async function getTransactionStats() {
  await requireAdmin();

  const [depositAgg, withdrawalAgg, pending] = await Promise.all([
    collections.transactions().aggregate([
      { $match: { type: "DEPOSIT", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).toArray(),
    collections.transactions().aggregate([
      { $match: { type: "WITHDRAWAL", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]).toArray(),
    collections.transactions().countDocuments({ status: "PENDING" }),
  ]);

  return {
    totalDeposits: depositAgg[0]?.total || 0,
    depositCount: depositAgg[0]?.count || 0,
    totalWithdrawals: withdrawalAgg[0]?.total || 0,
    withdrawalCount: withdrawalAgg[0]?.count || 0,
    pendingCount: pending,
  };
}

// User-facing: Get current user's recent transactions
export interface UserTransaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS";
  asset: "FIAT" | "BTC";
  amount: number;
  status: "PENDING" | "APPROVED" | "DECLINED";
  description?: string;
  reference?: string;
  withdrawalMethod?: string;
  withdrawalDetails?: Record<string, string>;
  createdAt: Date;
  approvedAt?: Date;
}

export async function getUserRecentTransactions(limit: number = 5): Promise<UserTransaction[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const transactions = await collections.transactions()
    .find({ userId: toObjectId(session.userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Transaction[];

  return transactions.map(tx => ({
    id: tx._id.toString(),
    type: tx.type as UserTransaction["type"],
    asset: tx.asset as UserTransaction["asset"],
    amount: tx.amount,
    status: tx.status as UserTransaction["status"],
    description: tx.description,
    createdAt: tx.createdAt,
  }));
}

// User-facing: Get all user transactions with optional filtering
export interface UserTransactionsFilter {
  type?: "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS" | "ALL";
  page?: number;
  limit?: number;
}

export interface UserTransactionsResult {
  transactions: UserTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getUserTransactions(
  filter: UserTransactionsFilter = {}
): Promise<UserTransactionsResult> {
  const session = await getUserSession();
  
  if (!session) {
    return {
      transactions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }

  const page = filter.page || 1;
  const limit = filter.limit || 10;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { userId: toObjectId(session.userId) };
  
  if (filter.type && filter.type !== "ALL") {
    query.type = filter.type;
  }

  const [transactionsRaw, total] = await Promise.all([
    collections.transactions()
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as Promise<Transaction[]>,
    collections.transactions().countDocuments(query),
  ]);

  const transactions = transactionsRaw.map(tx => ({
    id: tx._id.toString(),
    type: tx.type as UserTransaction["type"],
    asset: tx.asset as UserTransaction["asset"],
    amount: tx.amount,
    status: tx.status as UserTransaction["status"],
    description: tx.description,
    reference: tx.reference,
    withdrawalMethod: tx.withdrawalMethod,
    withdrawalDetails: tx.withdrawalDetails,
    createdAt: tx.createdAt,
    approvedAt: tx.approvedAt,
  }));

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// User-facing: Get user transaction stats
export interface UserTransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfits: number;
  totalBonuses: number;
  pendingCount: number;
}

export async function getUserTransactionStats(): Promise<UserTransactionStats> {
  const session = await getUserSession();
  
  if (!session) {
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalProfits: 0,
      totalBonuses: 0,
      pendingCount: 0,
    };
  }

  const userId = toObjectId(session.userId);

  const [depositAgg, withdrawalAgg, profitAgg, bonusAgg, pendingCount] = await Promise.all([
    collections.transactions().aggregate([
      { $match: { userId, type: "DEPOSIT", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().aggregate([
      { $match: { userId, type: "WITHDRAWAL", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().aggregate([
      { $match: { userId, type: "PROFIT", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().aggregate([
      { $match: { userId, type: "BONUS", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().countDocuments({ userId, status: "PENDING" }),
  ]);

  return {
    totalDeposits: depositAgg[0]?.total || 0,
    totalWithdrawals: withdrawalAgg[0]?.total || 0,
    totalProfits: profitAgg[0]?.total || 0,
    totalBonuses: bonusAgg[0]?.total || 0,
    pendingCount,
  };
}
