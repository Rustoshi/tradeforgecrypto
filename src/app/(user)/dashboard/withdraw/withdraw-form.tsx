"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PinNumpad } from "@/components/ui/pin-numpad";
import {
  ArrowLeft,
  ArrowRight,
  Wallet,
  Bitcoin,
  Building2,
  Coins,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Shield,
  X,
} from "lucide-react";
import {
  requestWithdrawal,
  verifyTransactionPIN,
  type WithdrawalEligibility,
} from "@/lib/actions/withdrawal";
import { withdrawalMethods, type WithdrawalMethod } from "@/lib/validations/withdrawal";

interface WithdrawFormProps {
  eligibility: WithdrawalEligibility;
  userCurrency: string;
  btcPrice: number;
}

type Step = 1 | 2 | 3 | 4 | 5;

const methodIcons: Record<string, React.ElementType> = {
  Building2,
  Bitcoin,
  Coins,
  DollarSign,
  Wallet,
  CreditCard,
};

export function WithdrawForm({ eligibility, userCurrency, btcPrice }: WithdrawFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [balanceType, setBalanceType] = useState<"FIAT" | "BTC" | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawalMethod | null>(null);
  const [withdrawalDetails, setWithdrawalDetails] = useState<Record<string, string>>({});
  const [pinError, setPinError] = useState("");
  
  // Fee modal state
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeModalData, setFeeModalData] = useState<{ amount: string; instruction: string } | null>(null);
  
  // Signal fee modal state
  const [signalFeeModalOpen, setSignalFeeModalOpen] = useState(false);
  const [signalFeeInstruction, setSignalFeeInstruction] = useState("");
  
  // Tier upgrade modal state
  const [tierUpgradeModalOpen, setTierUpgradeModalOpen] = useState(false);
  const [tierUpgradeData, setTierUpgradeData] = useState<{ tier: string; instruction: string } | null>(null);

  // Format currency
  const formatCurrency = useCallback((value: number, isBTC = false) => {
    if (isBTC) {
      return `${value.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
    }).format(value);
  }, [userCurrency]);

  // Get available balance based on selected type
  const getAvailableBalance = () => {
    if (balanceType === "BTC") return eligibility.btcBalance;
    return eligibility.fiatBalance;
  };

  // Validate amount
  const isAmountValid = () => {
    const numAmount = parseFloat(amount);
    return numAmount > 0 && numAmount <= getAvailableBalance();
  };

  // Handle balance type selection
  const handleBalanceSelect = (type: "FIAT" | "BTC") => {
    setBalanceType(type);
    setAmount("");
    setStep(2);
  };

  // Handle amount confirmation
  const handleAmountConfirm = () => {
    if (!isAmountValid()) {
      toast.error("Please enter a valid amount");
      return;
    }
    setStep(3);
  };

  // Handle method selection
  const handleMethodSelect = (selectedMethod: WithdrawalMethod) => {
    setMethod(selectedMethod);
    setWithdrawalDetails({});
    setStep(4);
  };

  // Handle details confirmation
  const handleDetailsConfirm = () => {
    // Validate required fields based on method
    const requiredFields = getRequiredFields();
    const missingFields = requiredFields.filter(field => !withdrawalDetails[field.key]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }
    
    // Go to PIN verification step
    setStep(5);
  };

  // Handle PIN verification and withdrawal
  const handlePINVerify = async (pin: string) => {
    setIsSubmitting(true);
    setPinError("");
    
    try {
      // First verify PIN
      const verifyResult = await verifyTransactionPIN(pin);
      if (!verifyResult.valid) {
        setPinError(verifyResult.error || "Invalid PIN");
        setIsSubmitting(false);
        return;
      }

      // Process withdrawal
      const result = await requestWithdrawal({
        balanceType: balanceType!,
        amount: parseFloat(amount),
        method: method!,
        withdrawalDetails,
        pin,
      });

      if (result.success) {
        toast.success("Withdrawal request submitted successfully!");
        router.push("/dashboard/transactions");
      } else {
        // Check if it's a withdrawal fee error
        if (result.error?.startsWith("WITHDRAWAL_FEE_REQUIRED:")) {
          const parts = result.error.split(":");
          const feeAmount = parts[1];
          const instruction = parts.slice(2).join(":");
          
          setFeeModalData({ amount: feeAmount, instruction });
          setFeeModalOpen(true);
          setStep(4); // Go back to details step
        } else if (result.error?.startsWith("SIGNAL_FEE_REQUIRED:")) {
          // Signal fee error - shown after withdrawal fee is cleared
          const instruction = result.error.replace("SIGNAL_FEE_REQUIRED:", "");
          setSignalFeeInstruction(instruction);
          setSignalFeeModalOpen(true);
          setStep(4); // Go back to details step
        } else if (result.error?.startsWith("TIER_UPGRADE_REQUIRED:")) {
          // Tier upgrade error - shown after signal fee is cleared
          const parts = result.error.split(":");
          const tier = parts[1];
          const instruction = parts.slice(2).join(":");
          setTierUpgradeData({ tier, instruction });
          setTierUpgradeModalOpen(true);
          setStep(4); // Go back to details step
        } else {
          setPinError(result.error || "Withdrawal failed");
        }
      }
    } catch {
      setPinError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get required fields for selected method
  const getRequiredFields = (): Array<{ key: string; label: string; placeholder: string; type?: string }> => {
    switch (method) {
      case "BANK_TRANSFER":
        return [
          { key: "bankName", label: "Bank Name", placeholder: "Enter bank name" },
          { key: "accountName", label: "Account Holder Name", placeholder: "Enter account holder name" },
          { key: "accountNumber", label: "Account Number", placeholder: "Enter account number" },
          { key: "routingNumber", label: "Routing Number (Optional)", placeholder: "Enter routing number" },
          { key: "swiftCode", label: "SWIFT Code (Optional)", placeholder: "Enter SWIFT code" },
          { key: "country", label: "Country", placeholder: "Enter country" },
        ];
      case "BITCOIN":
        return [
          { key: "walletAddress", label: "Bitcoin Wallet Address", placeholder: "Enter BTC wallet address" },
        ];
      case "ETHEREUM":
        return [
          { key: "walletAddress", label: "Ethereum Wallet Address", placeholder: "Enter ETH wallet address" },
        ];
      case "CASHAPP":
        return [
          { key: "cashtag", label: "Cash App Tag", placeholder: "$username" },
        ];
      case "PAYPAL":
        return [
          { key: "paypalEmail", label: "PayPal Email", placeholder: "Enter PayPal email", type: "email" },
        ];
      case "ZELLE":
        return [
          { key: "zelleEmail", label: "Zelle Email", placeholder: "Enter Zelle email", type: "email" },
          { key: "zellePhone", label: "Or Phone Number", placeholder: "Enter phone number (optional)" },
        ];
      default:
        return [];
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step > 1) {
      setPinError("");
      setStep((step - 1) as Step);
    }
  };

  // If not eligible, show error
  if (!eligibility.eligible) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Withdrawal Not Available
            </h3>
            <p className="text-text-muted max-w-md">
              {eligibility.reason}
            </p>
            {eligibility.kycStatus !== "APPROVED" && (
              <Button
                className="mt-4"
                onClick={() => router.push("/dashboard/kyc")}
              >
                Complete KYC Verification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              s === step ? "w-8 bg-primary" : s < step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      {/* Step 1: Select Balance Type */}
      {step === 1 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Select Balance</CardTitle>
            <CardDescription>
              Choose which balance you want to withdraw from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => handleBalanceSelect("FIAT")}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all text-left",
                "hover:border-primary hover:bg-primary/5",
                "border-border bg-surface-muted"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Fiat Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(eligibility.fiatBalance)}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </div>
            </button>

            <button
              onClick={() => handleBalanceSelect("BTC")}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all text-left",
                "hover:border-primary hover:bg-primary/5",
                "border-border bg-surface-muted"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">Bitcoin Balance</p>
                  <p className="text-2xl font-bold text-warning">
                    {formatCurrency(eligibility.btcBalance, true)}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted" />
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Enter Amount */}
      {step === 2 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Enter Amount</CardTitle>
                <CardDescription>
                  Available: {formatCurrency(getAvailableBalance(), balanceType === "BTC")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step={balanceType === "BTC" ? "0.00000001" : "0.01"}
                  min="0"
                  max={getAvailableBalance()}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl h-14 pr-20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-medium">
                  {balanceType === "BTC" ? "BTC" : userCurrency}
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const value = (getAvailableBalance() * percent) / 100;
                    setAmount(balanceType === "BTC" ? value.toFixed(8) : value.toFixed(2));
                  }}
                  className="flex-1"
                >
                  {percent}%
                </Button>
              ))}
            </div>

            {/* BTC to Fiat Conversion */}
            {balanceType === "BTC" && amount && parseFloat(amount) > 0 && btcPrice > 0 && (
              <div className="rounded-lg bg-surface-muted p-3">
                <p className="text-sm text-text-muted">
                  Estimated value:{" "}
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(parseFloat(amount) * btcPrice)}
                  </span>
                </p>
              </div>
            )}

            {/* Validation Messages */}
            {parseFloat(amount) > getAvailableBalance() && (
              <p className="text-sm text-destructive">
                Amount exceeds available balance
              </p>
            )}

            <Button
              onClick={handleAmountConfirm}
              disabled={!isAmountValid()}
              className="w-full"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select Withdrawal Method */}
      {step === 3 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Withdrawal Method</CardTitle>
                <CardDescription>
                  Select how you want to receive your funds
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {withdrawalMethods.map((m) => {
              const Icon = methodIcons[m.icon] || Wallet;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMethodSelect(m.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    "hover:border-primary hover:bg-primary/5",
                    "border-border bg-surface-muted"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-text-primary">{m.name}</span>
                    <ArrowRight className="w-4 h-4 text-text-muted ml-auto" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Enter Withdrawal Details */}
      {step === 4 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Receiving Details</CardTitle>
                <CardDescription>
                  Enter your {withdrawalMethods.find(m => m.id === method)?.name} details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {getRequiredFields().map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={withdrawalDetails[field.key] || ""}
                  onChange={(e) => setWithdrawalDetails(prev => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))}
                />
              </div>
            ))}

            {/* Summary */}
            <div className="rounded-lg bg-surface-muted p-4 mt-6">
              <h4 className="font-medium text-text-primary mb-3">Withdrawal Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Amount</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(parseFloat(amount), balanceType === "BTC")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Method</span>
                  <span className="font-medium text-text-primary">
                    {withdrawalMethods.find(m => m.id === method)?.name}
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleDetailsConfirm} className="w-full">
              Continue to Verification
              <Shield className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Verify PIN */}
      {step === 5 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-text-primary">Verify Transaction</CardTitle>
                <CardDescription>
                  Enter your PIN to confirm the withdrawal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PinNumpad
              onComplete={handlePINVerify}
              onCancel={goBack}
              title="Enter PIN"
              subtitle="Enter your 4-digit transaction PIN"
              error={pinError}
              loading={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Fee Modal */}
      <Dialog open={feeModalOpen} onOpenChange={setFeeModalOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-7 w-7 text-warning" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Withdrawal Fee Required
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              A processing fee is required to complete your withdrawal
            </DialogDescription>
          </DialogHeader>
          
          {feeModalData && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl bg-surface-muted p-4 text-center">
                <p className="text-sm text-text-muted mb-1">Fee Amount</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(parseFloat(feeModalData.amount))}
                </p>
              </div>
              
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feeModalData.instruction}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => setFeeModalOpen(false)}
              className="min-w-[120px]"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signal Fee Modal */}
      <Dialog open={signalFeeModalOpen} onOpenChange={setSignalFeeModalOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Signal Fee Required
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              A signal fee is required to process your withdrawal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {signalFeeInstruction}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => setSignalFeeModalOpen(false)}
              className="min-w-[120px]"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tier Upgrade Modal */}
      <Dialog open={tierUpgradeModalOpen} onOpenChange={setTierUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-7 w-7 text-warning" />
            </div>
            <DialogTitle className="text-xl font-semibold text-text-primary">
              Tier Upgrade Required
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              You need to upgrade your account tier to make withdrawals
            </DialogDescription>
          </DialogHeader>
          
          {tierUpgradeData && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl bg-surface-muted p-4 text-center">
                <p className="text-sm text-text-muted mb-1">Current Tier</p>
                <p className="text-2xl font-bold text-warning">
                  Tier {tierUpgradeData.tier}
                </p>
              </div>
              
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {tierUpgradeData.instruction}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center pt-2">
            <Button 
              onClick={() => setTierUpgradeModalOpen(false)}
              className="min-w-[120px]"
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
