import { Suspense } from "react";
import { Users, ArrowLeftRight, FileCheck, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { getDashboardStats, getChartData, getUserGrowthData } from "@/lib/actions/dashboard";
import { StatsCard } from "@/components/admin/stats-card";
import { TransactionChart } from "@/components/admin/charts/transaction-chart";
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

async function DashboardContent() {
  const [stats, chartData, userGrowthData] = await Promise.all([
    getDashboardStats(),
    getChartData(),
    getUserGrowthData(),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.users.total}
          description={`${stats.users.active} active`}
          icon={Users}
        />
        <StatsCard
          title="Pending Transactions"
          value={stats.transactions.pending}
          description="Awaiting review"
          icon={ArrowLeftRight}
        />
        <StatsCard
          title="Pending KYC"
          value={stats.kyc.pending}
          description="Awaiting verification"
          icon={FileCheck}
        />
        <StatsCard
          title="Total Deposits"
          value={formatCurrency(stats.transactions.totalDeposits)}
          icon={DollarSign}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <StatsCard
          title="Total Withdrawals"
          value={formatCurrency(stats.transactions.totalWithdrawals)}
          icon={TrendingDown}
        />
        <StatsCard
          title="Active Users"
          value={stats.users.active}
          description="Not suspended or blocked"
          icon={TrendingUp}
        />
        <StatsCard
          title="Suspended Users"
          value={stats.users.suspended}
          description="Suspended or blocked"
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TransactionChart data={chartData} />
        <UserGrowthChart data={userGrowthData} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-center text-sm text-text-muted">No transactions yet</p>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border-default pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {tx.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-text-muted">
                        {tx.type} • {formatDistanceToNow(tx.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">
                        {formatCurrency(tx.amount)}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.length === 0 ? (
                <p className="text-center text-sm text-text-muted">No users yet</p>
              ) : (
                stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b border-border-default pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">
                        {formatCurrency(user.fiatBalance)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border-default bg-surface">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted">Overview of your platform metrics</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
