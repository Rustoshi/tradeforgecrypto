"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  Clock,
  Percent,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Calendar,
} from "lucide-react";
import { subscribeToPlan, type PlanWithStatus } from "@/lib/actions/investments";

interface PlansContentProps {
  plans: PlanWithStatus[];
  userCurrency: string;
  fiatBalance: number;
}

export function PlansContent({ plans, userCurrency, fiatBalance }: PlansContentProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanWithStatus | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format currency
  const formatCurrency = (value: number, isBTC = false) => {
    if (isBTC) {
      return `${value.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
    }).format(value);
  };

  // Get available balance
  const getAvailableBalance = () => {
    return fiatBalance;
  };

  // Validate amount
  const isAmountValid = () => {
    if (!selectedPlan) return false;
    const numAmount = parseFloat(amount);
    return (
      !isNaN(numAmount) &&
      numAmount >= selectedPlan.minAmount &&
      numAmount <= selectedPlan.maxAmount &&
      numAmount <= getAvailableBalance()
    );
  };

  // Calculate expected return
  const calculateReturn = () => {
    if (!selectedPlan || !amount) return 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return numAmount + (numAmount * selectedPlan.roiPercentage / 100);
  };

  // Handle subscription
  const handleSubscribe = async () => {
    if (!selectedPlan || !isAmountValid()) return;

    setIsSubmitting(true);
    try {
      const result = await subscribeToPlan({
        planId: selectedPlan.id,
        amount: parseFloat(amount),
        balanceType: "FIAT",
      });

      if (result.success) {
        toast.success("Successfully subscribed to plan!");
        setSelectedPlan(null);
        setAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to subscribe");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open subscription modal
  const openSubscribeModal = (plan: PlanWithStatus) => {
    setSelectedPlan(plan);
    setAmount(plan.minAmount.toString());
  };

  return (
    <div className="space-y-6">
      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const isPopular = index === 1; // Middle plan is "popular"
          
          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border bg-surface p-6 transition-all duration-300",
                isPopular 
                  ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" 
                  : "border-border hover:border-primary/50",
                plan.isSubscribed && "ring-2 ring-success/50"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Subscribed Badge */}
              {plan.isSubscribed && (
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-semibold text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">{plan.roiPercentage}%</span>
                  <span className="text-text-muted">ROI</span>
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <Wallet className="h-4 w-4" />
                    Min Investment
                  </span>
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(plan.minAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <TrendingUp className="h-4 w-4" />
                    Max Investment
                  </span>
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(plan.maxAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-semibold text-text-primary">
                    {plan.durationDays} days
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-sm text-text-muted">
                    <Percent className="h-4 w-4" />
                    Daily Return
                  </span>
                  <span className="font-semibold text-success">
                    {(plan.roiPercentage / plan.durationDays).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {plan.isSubscribed ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Already Subscribed
                </Button>
              ) : (
                <Button
                  className={cn(
                    "w-full",
                    isPopular && "bg-primary hover:bg-primary-hover"
                  )}
                  onClick={() => openSubscribeModal(plan)}
                >
                  Subscribe Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <TrendingUp className="h-6 w-6 text-text-muted" />
          </div>
          <p className="mt-4 text-text-muted">No investment plans available</p>
          <p className="mt-1 text-sm text-text-muted">
            Check back later for new investment opportunities
          </p>
        </div>
      )}

      {/* Features Section */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Why Invest With Us?</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Secure</p>
              <p className="text-sm text-text-muted">Bank-grade security</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Profitable</p>
              <p className="text-sm text-text-muted">Competitive returns</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Flexible</p>
              <p className="text-sm text-text-muted">Multiple durations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10">
              <CheckCircle2 className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Transparent</p>
              <p className="text-sm text-text-muted">No hidden fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Subscribe to {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {selectedPlan?.roiPercentage}% ROI over {selectedPlan?.durationDays} days
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-6 py-4">
              {/* Available Balance */}
              <div className="flex items-center justify-between rounded-xl bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Available Balance</p>
                    <p className="font-semibold text-text-primary">
                      {formatCurrency(fiatBalance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={selectedPlan.minAmount}
                    max={Math.min(selectedPlan.maxAmount, getAvailableBalance())}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-12 text-lg pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                    {userCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Min: {formatCurrency(selectedPlan.minAmount)}</span>
                  <span>Max: {formatCurrency(selectedPlan.maxAmount)}</span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((percent) => {
                  const maxAllowed = Math.min(selectedPlan.maxAmount, getAvailableBalance());
                  const value = Math.min(maxAllowed, (maxAllowed * percent) / 100);
                  return (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(value.toFixed(2))}
                      className="flex-1"
                    >
                      {percent}%
                    </Button>
                  );
                })}
              </div>

              {/* Expected Return */}
              {parseFloat(amount) > 0 && (
                <div className="rounded-xl bg-success/10 p-4 text-center">
                  <p className="text-sm text-text-muted mb-1">Expected Return</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(calculateReturn())}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    After {selectedPlan.durationDays} days
                  </p>
                </div>
              )}

              {/* Validation Messages */}
              {parseFloat(amount) > getAvailableBalance() && (
                <p className="text-sm text-destructive text-center">
                  Insufficient balance
                </p>
              )}
              {parseFloat(amount) < selectedPlan.minAmount && parseFloat(amount) > 0 && (
                <p className="text-sm text-destructive text-center">
                  Minimum investment is {formatCurrency(selectedPlan.minAmount)}
                </p>
              )}
              {parseFloat(amount) > selectedPlan.maxAmount && (
                <p className="text-sm text-destructive text-center">
                  Maximum investment is {formatCurrency(selectedPlan.maxAmount)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedPlan(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={!isAmountValid() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : "Confirm Investment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
