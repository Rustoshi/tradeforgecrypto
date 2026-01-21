import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserTradesPaginated } from "@/lib/actions/swap";
import { Button } from "@/components/ui/button";
import {
  ArrowDownUp,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trades | Dashboard",
  description: "View your swap trade history",
};

interface TradesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TradesPage({ searchParams }: TradesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { trades, pagination } = await getUserTradesPaginated(page, 15);

  const formatCurrency = (amount: number, currency: string, isBTC = false) => {
    if (isBTC) {
      return `${amount.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
            Trade History
          </h1>
          <p className="mt-1 text-text-secondary">
            View all your BTC swap transactions
          </p>
        </div>
        <Link href="/dashboard/swap">
          <Button className="gap-2">
            <ArrowDownUp className="h-4 w-4" />
            New Swap
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ArrowDownUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Trades</p>
              <p className="text-xl font-bold text-text-primary">
                {pagination.total}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-muted">BTC Bought</p>
              <p className="text-xl font-bold text-text-primary">
                {trades.filter(t => t.type === "BUY").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-muted">BTC Sold</p>
              <p className="text-xl font-bold text-text-primary">
                {trades.filter(t => t.type === "SELL").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trades List */}
      {trades.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
            <ArrowDownUp className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text-primary">
            No trades yet
          </h3>
          <p className="mt-2 text-text-muted">
            Start swapping between BTC and {user.currency} to see your trade history here.
          </p>
          <Link href="/dashboard/swap">
            <Button className="mt-6">
              Make Your First Swap
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                    From
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-text-muted">
                    
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                    To
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-muted">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          trade.type === "BUY" ? "bg-success/10" : "bg-warning/10"
                        }`}>
                          {trade.type === "BUY" ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {trade.type === "BUY" ? "Buy BTC" : "Sell BTC"}
                          </p>
                          <p className="text-xs text-text-muted">
                            {trade.type === "BUY" ? "Fiat → Bitcoin" : "Bitcoin → Fiat"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          trade.fromAsset === "BTC" ? "bg-warning/10" : "bg-primary/10"
                        }`}>
                          {trade.fromAsset === "BTC" ? (
                            <Bitcoin className="h-4 w-4 text-warning" />
                          ) : (
                            <Wallet className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium text-text-primary">
                          {formatCurrency(trade.fromAmount, trade.userCurrency, trade.fromAsset === "BTC")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ArrowRight className="h-4 w-4 text-text-muted mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          trade.toAsset === "BTC" ? "bg-warning/10" : "bg-primary/10"
                        }`}>
                          {trade.toAsset === "BTC" ? (
                            <Bitcoin className="h-4 w-4 text-warning" />
                          ) : (
                            <Wallet className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          trade.type === "BUY" ? "text-success" : "text-warning"
                        }`}>
                          {formatCurrency(trade.toAmount, trade.userCurrency, trade.toAsset === "BTC")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        1 BTC = {formatCurrency(trade.rate, trade.userCurrency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-text-primary">
                          {format(new Date(trade.createdAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-text-muted">
                          {format(new Date(trade.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {trades.map((trade) => (
              <div key={trade.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      trade.type === "BUY" ? "bg-success/10" : "bg-warning/10"
                    }`}>
                      {trade.type === "BUY" ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {trade.type === "BUY" ? "Buy BTC" : "Sell BTC"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(trade.createdAt), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-surface-muted/50 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-xs text-text-muted mb-1">From</p>
                    <p className="font-medium text-text-primary text-sm">
                      {formatCurrency(trade.fromAmount, trade.userCurrency, trade.fromAsset === "BTC")}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                  <div className="text-center">
                    <p className="text-xs text-text-muted mb-1">To</p>
                    <p className={`font-medium text-sm ${
                      trade.type === "BUY" ? "text-success" : "text-warning"
                    }`}>
                      {formatCurrency(trade.toAmount, trade.userCurrency, trade.toAsset === "BTC")}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-text-muted text-center">
                  Rate: 1 BTC = {formatCurrency(trade.rate, trade.userCurrency)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} trades)
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/trades?page=${pagination.page - 1}`}
                  className={pagination.page <= 1 ? "pointer-events-none" : ""}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/trades?page=${pagination.page + 1}`}
                  className={pagination.page >= pagination.totalPages ? "pointer-events-none" : ""}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
