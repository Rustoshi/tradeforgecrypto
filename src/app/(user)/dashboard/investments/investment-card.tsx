"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Clock,
  CheckCircle2,
  XCircle,
  Percent,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { reclaimInvestmentCapital, type UserInvestmentWithPlan } from "@/lib/actions/investments";

interface InvestmentCardProps {
  investment: UserInvestmentWithPlan;
  userCurrency: string;
}

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

export function InvestmentCard({ investment, userCurrency }: InvestmentCardProps) {
  const router = useRouter();
  const [showReclaimModal, setShowReclaimModal] = useState(false);
  const [isReclaiming, setIsReclaiming] = useState(false);

  const handleReclaimCapital = async () => {
    setIsReclaiming(true);
    try {
      const result = await reclaimInvestmentCapital(investment.id);
      
      if (result.success) {
        toast.success(`Successfully reclaimed ${formatCurrency(result.amount!, userCurrency)}`);
        setShowReclaimModal(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reclaim capital");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsReclaiming(false);
    }
  };

  const expectedProfit = investment.expectedReturn - investment.investedAmount;

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-text-primary">{investment.planName}</h3>
              <StatusBadge status={investment.status} />
              {investment.canReclaimCapital && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                  <Wallet className="h-3 w-3" />
                  Ready to Reclaim
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-text-muted">Invested</p>
                <p className="font-semibold text-text-primary">
                  {formatCurrency(investment.investedAmount, userCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Expected Return</p>
                <p className="font-semibold text-success">
                  {formatCurrency(investment.expectedReturn, userCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Profit Credited</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(investment.profitCredited, userCurrency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">
                  {investment.daysRemaining > 0 ? "Days Remaining" : "Plan Ended"}
                </p>
                <p className="font-semibold text-text-primary">
                  {investment.daysRemaining > 0 ? `${investment.daysRemaining} days` : "Completed"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Profit Progress</span>
                <span className="text-text-secondary">
                  {formatCurrency(investment.profitCredited, userCurrency)} / {formatCurrency(expectedProfit, userCurrency)}
                </span>
              </div>
              <ProgressBar progress={investment.progress} />
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{formatDate(investment.startDate)}</span>
                <span>{formatDate(investment.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Reclaim Capital Button */}
          {investment.canReclaimCapital && (
            <Button
              onClick={() => setShowReclaimModal(true)}
              className="shrink-0"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Reclaim Capital
            </Button>
          )}
        </div>
      </div>

      {/* Reclaim Capital Modal */}
      <Dialog open={showReclaimModal} onOpenChange={setShowReclaimModal}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Wallet className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Reclaim Investment Capital
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Your investment plan has ended. You can now reclaim your capital.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-surface-muted p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Plan</span>
                <span className="font-medium text-text-primary">{investment.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Invested Amount</span>
                <span className="font-medium text-text-primary">
                  {formatCurrency(investment.investedAmount, userCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Profit Earned</span>
                <span className="font-medium text-success">
                  {formatCurrency(investment.profitCredited, userCurrency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-sm text-text-muted">Capital to Reclaim</span>
                <span className="font-bold text-lg text-primary">
                  {formatCurrency(investment.investedAmount, userCurrency)}
                </span>
              </div>
            </div>

            <p className="text-sm text-text-muted text-center">
              Your capital will be returned to your fiat balance.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowReclaimModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReclaimCapital}
              disabled={isReclaiming}
              className="flex-1"
            >
              {isReclaiming ? "Processing..." : "Confirm Reclaim"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
