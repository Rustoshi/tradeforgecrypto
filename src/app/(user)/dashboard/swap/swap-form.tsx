"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownUp,
  Bitcoin,
  Wallet,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { executeSwap, getSwapQuote, type UserTrade } from "@/lib/actions/swap";
import { formatDistanceToNow } from "date-fns";

interface SwapFormProps {
  fiatBalance: number;
  btcBalance: number;
  userCurrency: string;
  initialBtcPrice: number;
  recentTrades: UserTrade[];
}

export function SwapForm({
  fiatBalance,
  btcBalance,
  userCurrency,
  initialBtcPrice,
  recentTrades,
}: SwapFormProps) {
  const router = useRouter();
  const [fromAsset, setFromAsset] = useState<"FIAT" | "BTC">("FIAT");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [btcPrice, setBtcPrice] = useState(initialBtcPrice);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toAsset = fromAsset === "FIAT" ? "BTC" : "FIAT";

  // Format currency
  const formatCurrency = useCallback((amount: number, isBTC = false) => {
    if (isBTC) {
      return `${amount.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
    }).format(amount);
  }, [userCurrency]);

  // Get available balance
  const getFromBalance = () => {
    return fromAsset === "FIAT" ? fiatBalance : btcBalance;
  };

  const getToBalance = () => {
    return fromAsset === "FIAT" ? btcBalance : fiatBalance;
  };

  // Calculate conversion
  const calculateToAmount = useCallback((amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || btcPrice <= 0) {
      setToAmount("");
      return;
    }

    if (fromAsset === "FIAT") {
      setToAmount((numAmount / btcPrice).toFixed(8));
    } else {
      setToAmount((numAmount * btcPrice).toFixed(2));
    }
  }, [fromAsset, btcPrice]);

  // Update toAmount when fromAmount changes
  useEffect(() => {
    calculateToAmount(fromAmount);
  }, [fromAmount, calculateToAmount]);

  // Refresh BTC price
  const refreshPrice = async () => {
    setIsRefreshing(true);
    try {
      const quote = await getSwapQuote(fromAsset, 1, userCurrency);
      if (quote) {
        setBtcPrice(quote.rate);
        calculateToAmount(fromAmount);
      }
    } catch (error) {
      console.error("Failed to refresh price:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Swap direction
  const handleSwapDirection = () => {
    setFromAsset(fromAsset === "FIAT" ? "BTC" : "FIAT");
    setFromAmount("");
    setToAmount("");
  };

  // Handle swap
  const handleSwap = async () => {
    const numAmount = parseFloat(fromAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (numAmount > getFromBalance()) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const result = await executeSwap({
        fromAsset,
        fromAmount: numAmount,
      });

      if (result.success && result.trade) {
        toast.success(
          <div className="space-y-1">
            <p className="font-medium">Swap Successful!</p>
            <p className="text-sm">
              {fromAsset === "FIAT" 
                ? `Bought ${formatCurrency(result.trade.toAmount, true)}`
                : `Sold ${formatCurrency(result.trade.fromAmount, true)}`
              }
            </p>
          </div>
        );
        setFromAmount("");
        setToAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "Swap failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Set percentage of balance
  const setPercentage = (percent: number) => {
    const balance = getFromBalance();
    const amount = (balance * percent) / 100;
    setFromAmount(fromAsset === "BTC" ? amount.toFixed(8) : amount.toFixed(2));
  };

  const isValidSwap = () => {
    const numAmount = parseFloat(fromAmount);
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= getFromBalance();
  };

  return (
    <div className="space-y-6">
      {/* Swap Card */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        {/* Price Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Bitcoin className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-text-muted">BTC Price</p>
              <p className="font-semibold text-text-primary">
                {formatCurrency(btcPrice)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPrice}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* From Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">From</span>
            <span className="text-sm text-text-muted">
              Balance: {fromAsset === "FIAT" 
                ? formatCurrency(fiatBalance) 
                : formatCurrency(btcBalance, true)
              }
            </span>
          </div>
          
          <div className="rounded-xl bg-surface-muted p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  fromAsset === "FIAT" ? "bg-primary/10" : "bg-warning/10"
                )}>
                  {fromAsset === "FIAT" ? (
                    <Wallet className="h-5 w-5 text-primary" />
                  ) : (
                    <Bitcoin className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {fromAsset === "FIAT" ? userCurrency : "BTC"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {fromAsset === "FIAT" ? "Fiat" : "Bitcoin"}
                  </p>
                </div>
              </div>
              
              <Input
                type="number"
                step={fromAsset === "BTC" ? "0.00000001" : "0.01"}
                min="0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="text-right text-xl font-semibold border-0 bg-transparent focus-visible:ring-0 h-auto py-0"
              />
            </div>
            
            {/* Quick Percentage Buttons */}
            <div className="flex gap-2 mt-3">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => setPercentage(percent)}
                  className="flex-1 text-xs h-7"
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapDirection}
            className="rounded-full h-12 w-12 bg-surface border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ArrowDownUp className="h-5 w-5" />
          </Button>
        </div>

        {/* To Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">To</span>
            <span className="text-sm text-text-muted">
              Balance: {toAsset === "FIAT" 
                ? formatCurrency(fiatBalance) 
                : formatCurrency(btcBalance, true)
              }
            </span>
          </div>
          
          <div className="rounded-xl bg-surface-muted p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  toAsset === "FIAT" ? "bg-primary/10" : "bg-warning/10"
                )}>
                  {toAsset === "FIAT" ? (
                    <Wallet className="h-5 w-5 text-primary" />
                  ) : (
                    <Bitcoin className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {toAsset === "FIAT" ? userCurrency : "BTC"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {toAsset === "FIAT" ? "Fiat" : "Bitcoin"}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 text-right">
                <p className="text-xl font-semibold text-text-primary">
                  {toAmount || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Info */}
        {fromAmount && toAmount && (
          <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Rate</span>
              <span className="text-text-primary font-medium">
                1 BTC = {formatCurrency(btcPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!isValidSwap() || isLoading}
          className="w-full mt-6 h-14 text-lg font-semibold"
        >
          {isLoading ? (
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <ArrowDownUp className="h-5 w-5 mr-2" />
          )}
          {isLoading 
            ? "Swapping..." 
            : fromAsset === "FIAT" 
              ? "Buy Bitcoin" 
              : "Sell Bitcoin"
          }
        </Button>

        {/* Insufficient Balance Warning */}
        {parseFloat(fromAmount) > getFromBalance() && (
          <p className="text-sm text-destructive text-center mt-3">
            Insufficient balance
          </p>
        )}
      </div>

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">Recent Trades</h2>
          </div>
          <div className="divide-y divide-border">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    trade.type === "BUY" ? "bg-success/10" : "bg-warning/10"
                  )}>
                    {trade.type === "BUY" ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {trade.type === "BUY" ? "Bought BTC" : "Sold BTC"}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-semibold",
                    trade.type === "BUY" ? "text-success" : "text-warning"
                  )}>
                    {trade.type === "BUY" 
                      ? `+${formatCurrency(trade.toAmount, true)}`
                      : `-${formatCurrency(trade.fromAmount, true)}`
                    }
                  </p>
                  <p className="text-xs text-text-muted">
                    @ {formatCurrency(trade.rate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
