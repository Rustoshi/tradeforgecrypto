import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getBtcPrice } from "@/lib/actions/crypto";
import { getUserTrades } from "@/lib/actions/swap";
import { SwapForm } from "./swap-form";

export const metadata: Metadata = {
  title: "Swap | Dashboard",
  description: "Swap between BTC and fiat currency",
};

export default async function SwapPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [btcPrice, recentTrades] = await Promise.all([
    getBtcPrice(user.currency),
    getUserTrades(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          Swap
        </h1>
        <p className="mt-1 text-text-secondary">
          Instantly swap between BTC and {user.currency}
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-muted">{user.currency} Balance</p>
              <p className="text-xl font-bold text-text-primary">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: user.currency,
                }).format(user.fiatBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <svg
                className="h-6 w-6 text-warning"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z" />
                <path
                  fill="#fff"
                  d="M14.434 9.3c.2-1.333-.816-2.05-2.205-2.527l.45-1.807-1.1-.274-.44 1.76c-.29-.072-.587-.14-.883-.207l.442-1.772-1.1-.274-.45 1.806c-.24-.054-.475-.108-.702-.165l.001-.006-1.517-.379-.293 1.175s.816.187.8.199c.445.11.526.404.512.637l-.513 2.058c.03.008.07.02.114.037l-.116-.03-.72 2.884c-.054.135-.192.337-.503.26.011.016-.8-.2-.8-.2l-.547 1.26 1.432.357c.266.067.527.137.784.203l-.455 1.826 1.1.274.45-1.807c.3.082.592.157.877.227l-.448 1.797 1.1.274.455-1.823c1.875.355 3.285.212 3.878-1.484.478-1.366-.024-2.154-1.01-2.668.72-.166 1.26-.64 1.405-1.617zm-2.514 3.525c-.34 1.365-2.64.627-3.386.442l.604-2.422c.746.186 3.14.555 2.782 1.98zm.34-3.545c-.31 1.24-2.224.61-2.846.456l.548-2.197c.622.155 2.622.444 2.298 1.74z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-muted">Bitcoin Balance</p>
              <p className="text-xl font-bold text-text-primary">
                {user.bitcoinBalance.toFixed(8)} BTC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Form */}
      <div className="max-w-lg mx-auto">
        <SwapForm
          fiatBalance={user.fiatBalance}
          btcBalance={user.bitcoinBalance}
          userCurrency={user.currency}
          initialBtcPrice={btcPrice}
          recentTrades={recentTrades}
        />
      </div>
    </div>
  );
}
