import { Suspense } from "react";
import Link from "next/link";
import { getTransactions } from "@/lib/actions/transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "./transactions-table";

interface TransactionsContentProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    page?: string;
  }>;
}

async function TransactionsContent({ searchParams }: TransactionsContentProps) {
  const params = await searchParams;
  const { transactions, pagination } = await getTransactions({
    type: params.type as "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS" | undefined,
    status: params.status as "PENDING" | "APPROVED" | "DECLINED" | undefined,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-text-primary">All Transactions</CardTitle>
        <div className="flex gap-2">
          <Link href="/admin/transactions?status=PENDING">
            <Button variant={params.status === "PENDING" ? "default" : "outline"} size="sm">
              Pending
            </Button>
          </Link>
          <Link href="/admin/transactions">
            <Button variant={!params.status ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <TransactionsTable transactions={transactions as any} />

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} transactions
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link href={`/admin/transactions?page=${pagination.page - 1}`}>
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link href={`/admin/transactions?page=${pagination.page + 1}`}>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionsSkeleton() {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        <p className="text-text-muted">Manage deposits, withdrawals, and other transactions</p>
      </div>

      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
