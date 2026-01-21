"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Gift,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import type { UserTransaction, UserTransactionStats } from "@/lib/actions/transactions";

interface TransactionsContentProps {
  initialTransactions: UserTransaction[];
  stats: UserTransactionStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  userCurrency: string;
}

type FilterType = "ALL" | "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS";

const filterTabs: { value: FilterType; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DEPOSIT", label: "Deposits" },
  { value: "WITHDRAWAL", label: "Withdrawals" },
  { value: "PROFIT", label: "Profits" },
  { value: "BONUS", label: "Bonuses" },
];

const typeConfig = {
  DEPOSIT: {
    icon: ArrowDownToLine,
    label: "Deposit",
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  WITHDRAWAL: {
    icon: ArrowUpFromLine,
    label: "Withdrawal",
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  PROFIT: {
    icon: TrendingUp,
    label: "Profit",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  BONUS: {
    icon: Gift,
    label: "Bonus",
    colorClass: "text-info",
    bgClass: "bg-info/10",
  },
};

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Pending",
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
  },
  APPROVED: {
    icon: CheckCircle2,
    label: "Completed",
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  DECLINED: {
    icon: XCircle,
    label: "Declined",
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
};

export function TransactionsContent({
  initialTransactions,
  stats,
  pagination: initialPagination,
  userCurrency,
}: TransactionsContentProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<UserTransaction | null>(null);
  const [copied, setCopied] = useState(false);

  // Format currency
  const formatCurrency = (amount: number, isBTC = false) => {
    if (isBTC) {
      return `${amount.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
    }).format(amount);
  };

  // Handle filter change
  const handleFilterChange = async (filter: FilterType) => {
    setActiveFilter(filter);
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("type", filter);
      params.set("page", "1");
      
      const response = await fetch(`/api/user/transactions?${params.toString()}`);
      const data = await response.json();
      
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "ALL") params.set("type", activeFilter);
      params.set("page", newPage.toString());
      
      const response = await fetch(`/api/user/transactions?${params.toString()}`);
      const data = await response.json();
      
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy reference to clipboard
  const copyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Transaction Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-muted">Total Deposits</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {formatCurrency(stats.totalDeposits)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-muted">Total Withdrawals</p>
          <p className="mt-2 text-2xl font-bold text-text-primary">
            {formatCurrency(stats.totalWithdrawals)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-muted">Total Profits</p>
          <p className="mt-2 text-2xl font-bold text-success">
            {formatCurrency(stats.totalProfits)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium text-text-muted">Bonuses</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatCurrency(stats.totalBonuses)}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            disabled={isLoading}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              activeFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-surface text-text-secondary hover:bg-surface-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Transaction History</h2>
          {stats.pendingCount > 0 && (
            <p className="text-sm text-warning mt-1">
              {stats.pendingCount} pending transaction{stats.pendingCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <ArrowLeftRight className="h-6 w-6 text-text-muted" />
            </div>
            <p className="mt-4 text-text-muted">No transactions yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Your transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const typeConf = typeConfig[tx.type];
              const statusConf = statusConfig[tx.status];
              const TypeIcon = typeConf.icon;
              const StatusIcon = statusConf.icon;

              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-surface-muted/50 transition-colors text-left"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full shrink-0", typeConf.bgClass)}>
                    <TypeIcon className={cn("h-5 w-5", typeConf.colorClass)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{typeConf.label}</p>
                      <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", statusConf.bgClass, statusConf.colorClass)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConf.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">
                      {tx.description || `${typeConf.label} transaction`}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "font-semibold",
                      tx.type === "WITHDRAWAL" ? "text-warning" : "text-success"
                    )}>
                      {tx.type === "WITHDRAWAL" ? "-" : "+"}
                      {formatCurrency(tx.amount, tx.asset === "BTC")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          {selectedTransaction && (() => {
            const typeConf = typeConfig[selectedTransaction.type];
            const statusConf = statusConfig[selectedTransaction.status];
            const TypeIcon = typeConf.icon;
            const StatusIcon = statusConf.icon;

            return (
              <>
                <DialogHeader className="text-center sm:text-center">
                  <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full", typeConf.bgClass)}>
                    <TypeIcon className={cn("h-7 w-7", typeConf.colorClass)} />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-text-primary">
                    {typeConf.label} Details
                  </DialogTitle>
                  <DialogDescription className="text-text-secondary">
                    Transaction information
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Amount */}
                  <div className="rounded-xl bg-surface-muted p-4 text-center">
                    <p className="text-sm text-text-muted mb-1">Amount</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      selectedTransaction.type === "WITHDRAWAL" ? "text-warning" : "text-success"
                    )}>
                      {selectedTransaction.type === "WITHDRAWAL" ? "-" : "+"}
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.asset === "BTC")}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-muted">Status</span>
                      <span className={cn("flex items-center gap-1.5 text-sm font-medium", statusConf.colorClass)}>
                        <StatusIcon className="h-4 w-4" />
                        {statusConf.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-muted">Type</span>
                      <span className="text-sm font-medium text-text-primary">{typeConf.label}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-muted">Asset</span>
                      <span className="text-sm font-medium text-text-primary">
                        {selectedTransaction.asset === "BTC" ? "Bitcoin" : "Fiat"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-text-muted">Date</span>
                      <span className="text-sm font-medium text-text-primary">
                        {format(new Date(selectedTransaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>

                    {selectedTransaction.approvedAt && (
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-text-muted">Processed</span>
                        <span className="text-sm font-medium text-text-primary">
                          {format(new Date(selectedTransaction.approvedAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    )}

                    {selectedTransaction.reference && (
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-text-muted">Reference</span>
                        <button
                          onClick={() => copyReference(selectedTransaction.reference!)}
                          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
                        >
                          <span className="font-mono text-xs">
                            {selectedTransaction.reference.slice(0, 8)}...
                          </span>
                          {copied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {selectedTransaction.withdrawalMethod && (
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-text-muted">Method</span>
                        <span className="text-sm font-medium text-text-primary">
                          {selectedTransaction.withdrawalMethod.replace("_", " ")}
                        </span>
                      </div>
                    )}

                    {selectedTransaction.description && (
                      <div className="py-2">
                        <span className="text-sm text-text-muted block mb-1">Description</span>
                        <span className="text-sm text-text-primary">
                          {selectedTransaction.description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button onClick={() => setSelectedTransaction(null)} className="min-w-[120px]">
                    Close
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
