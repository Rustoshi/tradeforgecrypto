"use server";

import { collections, type Transaction, type User } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function getDashboardStats() {
  await requireAdmin();

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    pendingTransactions,
    pendingKYC,
    depositAgg,
    withdrawalAgg,
    recentTransactionsRaw,
    recentUsersRaw,
  ] = await Promise.all([
    collections.users().countDocuments(),
    collections.users().countDocuments({ isSuspended: false, isBlocked: false }),
    collections.users().countDocuments({ $or: [{ isSuspended: true }, { isBlocked: true }] }),
    collections.transactions().countDocuments({ status: "PENDING" }),
    collections.kyc().countDocuments({ status: "PENDING" }),
    collections.transactions().aggregate([
      { $match: { type: "DEPOSIT", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().aggregate([
      { $match: { type: "WITHDRAWAL", status: "APPROVED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray(),
    collections.transactions().find().sort({ createdAt: -1 }).limit(5).toArray() as Promise<Transaction[]>,
    collections.users().find().sort({ createdAt: -1 }).limit(5).toArray() as Promise<User[]>,
  ]);

  // Get user info for recent transactions
  const recentTransactions = await Promise.all(
    recentTransactionsRaw.map(async (tx) => {
      const user = await collections.users().findOne(
        { _id: tx.userId },
        { projection: { fullName: 1, email: 1 } }
      );
      const { _id, userId, createdByAdminId, ...txData } = tx;
      return {
        ...txData,
        id: _id.toString(),
        userId: userId?.toString() || null,
        createdByAdminId: createdByAdminId?.toString() || null,
        user: user ? { fullName: user.fullName, email: user.email } : null,
      };
    })
  );

  const recentUsers = recentUsersRaw.map((u) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    createdAt: u.createdAt,
    fiatBalance: u.fiatBalance,
  }));

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
    },
    transactions: {
      pending: pendingTransactions,
      totalDeposits: depositAgg[0]?.total || 0,
      totalWithdrawals: withdrawalAgg[0]?.total || 0,
    },
    kyc: {
      pending: pendingKYC,
    },
    recentTransactions,
    recentUsers,
  };
}

export async function getChartData() {
  await requireAdmin();

  // Get last 30 days of transaction data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await collections.transactions()
    .find({
      createdAt: { $gte: thirtyDaysAgo },
      status: "APPROVED",
    })
    .sort({ createdAt: 1 })
    .toArray();

  // Group by date
  const dailyData: Record<string, { deposits: number; withdrawals: number }> = {};

  for (const tx of transactions) {
    const date = tx.createdAt.toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = { deposits: 0, withdrawals: 0 };
    }
    if (tx.type === "DEPOSIT") {
      dailyData[date].deposits += tx.amount;
    } else if (tx.type === "WITHDRAWAL") {
      dailyData[date].withdrawals += tx.amount;
    }
  }

  const chartData = Object.entries(dailyData).map(([date, data]) => ({
    date,
    deposits: data.deposits,
    withdrawals: data.withdrawals,
  }));

  return chartData;
}

export async function getUserGrowthData() {
  await requireAdmin();

  // Get last 30 days of user registrations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await collections.users()
    .find({ createdAt: { $gte: thirtyDaysAgo } })
    .sort({ createdAt: 1 })
    .toArray();

  // Group by date
  const dailyData: Record<string, number> = {};

  for (const user of users) {
    const date = user.createdAt.toISOString().split("T")[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  }

  const chartData = Object.entries(dailyData).map(([date, count]) => ({
    date,
    users: count,
  }));

  return chartData;
}
