"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Percent,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { creditInvestmentProfit, type AdminUserInvestment } from "@/lib/actions/investments";

interface UserInvestmentsProps {
  investments: AdminUserInvestment[];
  userId: string;
  userCurrency: string;
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function UserInvestments({ investments, userId, userCurrency }: UserInvestmentsProps) {
  const router = useRouter();
  const [selectedInvestment, setSelectedInvestment] = useState<AdminUserInvestment | null>(null);
  const [profitAmount, setProfitAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open profit modal with daily profit pre-filled
  const openProfitModal = (investment: AdminUserInvestment) => {
    setSelectedInvestment(investment);
    setProfitAmount(investment.dailyProfit.toFixed(2));
  };

  // Handle profit credit
  const handleCreditProfit = async () => {
    if (!selectedInvestment) return;

    const amount = parseFloat(profitAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await creditInvestmentProfit({
        investmentId: selectedInvestment.id,
        amount,
      });

      if (result.success) {
        toast.success(`Successfully credited ${formatCurrency(amount, userCurrency)} profit`);
        setSelectedInvestment(null);
        setProfitAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to credit profit");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (investment: AdminUserInvestment) => {
    const expectedProfit = investment.expectedReturn - investment.investedAmount;
    if (expectedProfit <= 0) return 0;
    return Math.min(100, (investment.profitCredited / expectedProfit) * 100);
  };

  if (investments.length === 0) {
    return (
      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-text-muted">No investments yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">Investments ({investments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {investments.map((investment) => {
            const progress = getProgressPercentage(investment);
            const expectedProfit = investment.expectedReturn - investment.investedAmount;
            const remainingProfit = expectedProfit - investment.profitCredited;

            return (
              <div
                key={investment.id}
                className="rounded-xl border border-border p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">{investment.planName}</h3>
                      <StatusBadge status={investment.status} />
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {format(investment.startDate, "MMM d, yyyy")} - {format(investment.endDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  {investment.status === "ACTIVE" && (
                    <Button
                      size="sm"
                      onClick={() => openProfitModal(investment)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Profit
                    </Button>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Invested
                    </p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(investment.investedAmount, userCurrency)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Expected Return
                    </p>
                    <p className="font-semibold text-success">
                      {formatCurrency(investment.expectedReturn, userCurrency)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      ROI
                    </p>
                    <p className="font-semibold text-text-primary">
                      {investment.roiPercentage}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Duration
                    </p>
                    <p className="font-semibold text-text-primary">
                      {investment.durationDays} days
                    </p>
                  </div>
                </div>

                {/* Profit Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Profit Progress</span>
                    <span className="text-text-primary font-medium">
                      {formatCurrency(investment.profitCredited, userCurrency)} / {formatCurrency(expectedProfit, userCurrency)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{progress.toFixed(1)}% complete</span>
                    <span>Remaining: {formatCurrency(Math.max(0, remainingProfit), userCurrency)}</span>
                  </div>
                </div>

                {/* Daily Profit Info */}
                <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-muted">Ideal Daily Profit</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(investment.dailyProfit, userCurrency)}
                  </span>
                </div>

                {/* Status Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-text-muted">
                    <span>Days Elapsed:</span>
                    <span className="font-medium text-text-primary">{investment.daysElapsed}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted">
                    <span>Days Remaining:</span>
                    <span className="font-medium text-text-primary">{investment.daysRemaining}</span>
                  </div>
                  {investment.capitalReclaimed && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Capital Reclaimed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Credit Profit Modal */}
      <Dialog open={!!selectedInvestment} onOpenChange={() => setSelectedInvestment(null)}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <TrendingUp className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary text-center">
              Credit Profit
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-center">
              Add profit to {selectedInvestment?.planName}
            </DialogDescription>
          </DialogHeader>

          {selectedInvestment && (
            <div className="space-y-6 py-4">
              {/* Investment Summary */}
              <div className="rounded-xl bg-surface-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Invested Amount</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(selectedInvestment.investedAmount, userCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Expected Profit</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(selectedInvestment.expectedReturn - selectedInvestment.investedAmount, userCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Profit Credited</span>
                  <span className="font-medium text-success">
                    {formatCurrency(selectedInvestment.profitCredited, userCurrency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                  <span className="text-text-muted">Remaining</span>
                  <span className="font-medium text-warning">
                    {formatCurrency(
                      Math.max(0, selectedInvestment.expectedReturn - selectedInvestment.investedAmount - selectedInvestment.profitCredited),
                      userCurrency
                    )}
                  </span>
                </div>
              </div>

              {/* Profit Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="profitAmount">Profit Amount</Label>
                <div className="relative">
                  <Input
                    id="profitAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={profitAmount}
                    onChange={(e) => setProfitAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-12 text-lg pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    {userCurrency}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Suggested daily profit: {formatCurrency(selectedInvestment.dailyProfit, userCurrency)}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfitAmount(selectedInvestment.dailyProfit.toFixed(2))}
                  className="flex-1"
                >
                  1 Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfitAmount((selectedInvestment.dailyProfit * 7).toFixed(2))}
                  className="flex-1"
                >
                  7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfitAmount((selectedInvestment.dailyProfit * 30).toFixed(2))}
                  className="flex-1"
                >
                  30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const remaining = selectedInvestment.expectedReturn - selectedInvestment.investedAmount - selectedInvestment.profitCredited;
                    setProfitAmount(Math.max(0, remaining).toFixed(2));
                  }}
                  className="flex-1"
                >
                  All
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedInvestment(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreditProfit}
              disabled={isSubmitting || !profitAmount || parseFloat(profitAmount) <= 0}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : "Credit Profit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
