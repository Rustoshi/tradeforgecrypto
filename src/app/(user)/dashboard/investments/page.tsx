import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Percent,
  ArrowRight,
  PiggyBank
} from "lucide-react";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserInvestments, getUserInvestmentStats } from "@/lib/actions/investments";
import { cn } from "@/lib/utils";
import { InvestmentCard } from "./investment-card";

export const metadata: Metadata = {
  title: "Investments | Dashboard",
  description: "View and manage your active and past investments",
};

// Format currency with user's preferred currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Status badge component
function StatusBadge({ status }: { status: "ACTIVE" | "COMPLETED" | "CANCELLED" }) {
  const config = {
    ACTIVE: {
      label: "Active",
      className: "bg-primary/10 text-primary border-primary/20",
      icon: Clock,
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
      className
    )}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

export default async function InvestmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch investments and stats in parallel
  const [investments, stats] = await Promise.all([
    getUserInvestments(),
    getUserInvestmentStats(),
  ]);

  const activeInvestments = investments.filter(inv => inv.status === "ACTIVE");
  const completedInvestments = investments.filter(inv => inv.status === "COMPLETED");
  const cancelledInvestments = investments.filter(inv => inv.status === "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          Investments
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage your active and past investments
        </p>
      </div>

      {/* Investment Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Active Investments</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">{stats.activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Total Invested</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <PiggyBank className="h-4 w-4 text-warning" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">
            {formatCurrency(stats.totalInvested, user.currency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Total Returns</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-success">
            {formatCurrency(stats.totalReturns, user.currency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Completed</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
              <Calendar className="h-4 w-4 text-text-muted" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">{stats.completedCount}</p>
        </div>
      </div>

      {/* Investment Plans CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Start Investing</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Choose from our investment plans and start earning returns
            </p>
          </div>
          <Link 
            href="/dashboard/plans"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <TrendingUp className="h-4 w-4" />
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Active Investments */}
      {activeInvestments.length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Active Investments ({activeInvestments.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {activeInvestments.map((investment) => (
              <InvestmentCard 
                key={investment.id} 
                investment={investment} 
                userCurrency={user.currency} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed & Cancelled Investments */}
      {(completedInvestments.length > 0 || cancelledInvestments.length > 0) && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Past Investments ({completedInvestments.length + cancelledInvestments.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...completedInvestments, ...cancelledInvestments].map((investment) => (
                  <tr key={investment.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-text-primary">{investment.planName}</p>
                      <p className="text-xs text-text-muted">{formatDate(investment.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-text-primary">
                        {formatCurrency(investment.investedAmount, user.currency)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={cn(
                        "font-medium",
                        investment.status === "COMPLETED" ? "text-success" : "text-text-muted"
                      )}>
                        {investment.status === "COMPLETED" 
                          ? formatCurrency(investment.expectedReturn, user.currency)
                          : "-"
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={investment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {investments.length === 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">Your Investments</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
              <TrendingUp className="h-6 w-6 text-text-muted" />
            </div>
            <p className="mt-4 text-text-muted">No investments yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Your active and completed investments will appear here
            </p>
            <Link 
              href="/dashboard/plans"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <TrendingUp className="h-4 w-4" />
              Browse Investment Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
