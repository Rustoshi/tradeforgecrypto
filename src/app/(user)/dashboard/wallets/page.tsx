import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getBtcPrice } from "@/lib/actions/crypto";
import { Wallet, Plus, Bitcoin, DollarSign, TrendingUp, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Wallets | Dashboard",
  description: "Manage your deposit wallets and balances",
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatBitcoin(amount: number): string {
  return `${amount.toFixed(8)} BTC`;
}

export default async function WalletsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const btcPrice = await getBtcPrice(user.currency);
  const btcValueInFiat = user.bitcoinBalance * btcPrice;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
            Wallets
          </h1>
          <p className="mt-1 text-text-secondary">
            Manage your deposit wallets and view balances
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          Deposit
        </button>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Fiat Balance</p>
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">
            {formatCurrency(user.fiatBalance, user.currency)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Available for investment</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Bitcoin Balance</p>
            <Bitcoin className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-3 text-2xl font-bold text-text-primary">
            {formatBitcoin(user.bitcoinBalance)}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            ≈ {formatCurrency(btcValueInFiat, user.currency)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Profit Balance</p>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="mt-3 text-2xl font-bold text-success">
            {formatCurrency(user.profitBalance, user.currency)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Earnings available</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">Bonus Balance</p>
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-bold text-primary">
            {formatCurrency(user.totalBonus, user.currency)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Promotional rewards</p>
        </div>
      </div>

      {/* Deposit Wallets */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Deposit Wallets</h2>
          <p className="mt-1 text-sm text-text-muted">
            Use these addresses to deposit funds to your account
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <Wallet className="h-6 w-6 text-text-muted" />
          </div>
          <p className="mt-4 text-text-muted">No deposit wallets</p>
          <p className="mt-1 text-sm text-text-muted">
            Contact support to get your deposit addresses
          </p>
        </div>
      </div>
    </div>
  );
}
