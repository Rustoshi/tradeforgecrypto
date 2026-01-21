import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserTransactions, getUserTransactionStats } from "@/lib/actions/transactions";
import { TransactionsContent } from "./transactions-content";

export const metadata: Metadata = {
  title: "Transactions | Dashboard",
  description: "View your deposits, withdrawals, and transaction history",
};

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [transactionsResult, stats] = await Promise.all([
    getUserTransactions({ page: 1, limit: 10 }),
    getUserTransactionStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-text-secondary">
          View your deposits, withdrawals, and profits
        </p>
      </div>

      <TransactionsContent
        initialTransactions={transactionsResult.transactions}
        stats={stats}
        pagination={transactionsResult.pagination}
        userCurrency={user.currency}
      />
    </div>
  );
}
