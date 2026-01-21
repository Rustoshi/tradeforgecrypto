"use client";

import { Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserDeposit } from "@/lib/actions/deposit";

interface DepositHistoryProps {
  deposits: UserDeposit[];
  userCurrency: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function StatusBadge({ status }: { status: "PENDING" | "APPROVED" | "DECLINED" }) {
  const config = {
    PENDING: {
      icon: Clock,
      label: "Pending",
      className: "bg-warning/10 text-warning border-warning/20",
    },
    APPROVED: {
      icon: CheckCircle2,
      label: "Approved",
      className: "bg-success/10 text-success border-success/20",
    },
    DECLINED: {
      icon: XCircle,
      label: "Declined",
      className: "bg-error/10 text-error border-error/20",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function DepositHistory({ deposits, userCurrency }: DepositHistoryProps) {
  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">Recent Deposits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-surface-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">
                    {formatCurrency(deposit.amount, userCurrency)}
                  </span>
                  <StatusBadge status={deposit.status} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                  <span>{deposit.reference}</span>
                  {deposit.walletNetwork && (
                    <>
                      <span>•</span>
                      <span>{deposit.walletNetwork}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {formatDate(deposit.createdAt)}
                </p>
              </div>
              
              {deposit.cryptoAmount && (
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-text-primary">
                    {deposit.cryptoAmount.toFixed(8)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {deposit.cryptoCurrency?.replace("-TRC20", "").replace("-ERC20", "")}
                  </p>
                </div>
              )}

              {deposit.depositProofUrl && (
                <a
                  href={deposit.depositProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 p-2 rounded-lg hover:bg-surface-muted transition-colors"
                  title="View proof"
                >
                  <ExternalLink className="h-4 w-4 text-text-muted" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
