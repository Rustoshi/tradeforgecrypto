"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { 
  Wallet, 
  Copy, 
  Check, 
  Upload, 
  X, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Bitcoin,
  Building2,
  CreditCard,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { submitDeposit } from "@/lib/actions/deposit";
import type { PublicPaymentMethod } from "@/lib/actions/public";
import type { PaymentMethodType } from "@/lib/db";

interface DepositFormNewProps {
  paymentMethods: PublicPaymentMethod[];
  userCurrency: string;
}

// Network display names
const NETWORK_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  "USDT-TRC20": "USDT (TRC20)",
  "USDT-ERC20": "USDT (ERC20)",
  USDT: "Tether",
  USDC: "USD Coin",
  BNB: "BNB Chain",
  LTC: "Litecoin",
  XRP: "Ripple",
  SOL: "Solana",
  DOGE: "Dogecoin",
};

const PAYMENT_TYPE_INFO: Record<PaymentMethodType, { label: string; icon: React.ReactNode; color: string }> = {
  CRYPTO: { label: "Cryptocurrency", icon: <Bitcoin className="h-5 w-5" />, color: "bg-warning/10 text-warning" },
  PAYPAL: { label: "PayPal", icon: <Wallet className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-500" },
  ZELLE: { label: "Zelle", icon: <DollarSign className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-500" },
  CASHAPP: { label: "Cash App", icon: <DollarSign className="h-5 w-5" />, color: "bg-green-500/10 text-green-500" },
  VENMO: { label: "Venmo", icon: <Wallet className="h-5 w-5" />, color: "bg-blue-400/10 text-blue-400" },
  BANK_TRANSFER: { label: "Bank Transfer", icon: <Building2 className="h-5 w-5" />, color: "bg-slate-500/10 text-slate-400" },
  WISE: { label: "Wise", icon: <CreditCard className="h-5 w-5" />, color: "bg-green-600/10 text-green-600" },
  SKRILL: { label: "Skrill", icon: <CreditCard className="h-5 w-5" />, color: "bg-purple-600/10 text-purple-600" },
  OTHER: { label: "Other", icon: <CreditCard className="h-5 w-5" />, color: "bg-gray-500/10 text-gray-400" },
};

interface ExchangeRates {
  [network: string]: number;
}

export function DepositFormNew({ paymentMethods, userCurrency }: DepositFormNewProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMethod, setSelectedMethod] = useState<PublicPaymentMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  
  // Exchange rates
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Group payment methods by type
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) acc[method.type] = [];
    acc[method.type].push(method);
    return acc;
  }, {} as Record<PaymentMethodType, PublicPaymentMethod[]>);

  const availableTypes = Object.keys(groupedMethods) as PaymentMethodType[];

  useEffect(() => {
    fetchExchangeRates();
  }, [userCurrency]);

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      const response = await fetch(`/api/exchange-rates?currency=${userCurrency}`);
      const data = await response.json();
      if (data.success && data.rates) {
        setExchangeRates(data.rates);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedMethod?.type === "CRYPTO" && selectedMethod.network && value) {
      const rate = exchangeRates[selectedMethod.network] || 1;
      const crypto = parseFloat(value) / rate;
      setCryptoAmount(crypto.toFixed(8));
    } else {
      setCryptoAmount("");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "deposit_proofs");
      formData.append("folder", "deposit-proofs");

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");

      setProofUrl(data.secure_url);
      toast.success("Proof uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !amount || !proofUrl) {
      toast.error("Please complete all steps");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitDeposit({
        amount: parseFloat(amount),
        cryptoAmount: selectedMethod.type === "CRYPTO" ? parseFloat(cryptoAmount) : undefined,
        cryptoCurrency: selectedMethod.type === "CRYPTO" ? selectedMethod.network : undefined,
        walletAddress: selectedMethod.walletAddress,
        walletNetwork: selectedMethod.network,
        depositProofUrl: proofUrl,
        paymentMethodId: selectedMethod.id,
        paymentMethodType: selectedMethod.type,
        paymentMethodName: selectedMethod.name,
      });

      if (result.success) {
        toast.success("Deposit submitted successfully!", {
          description: `Reference: ${result.reference}`,
        });
        router.refresh();
        setStep(1);
        setSelectedMethod(null);
        setAmount("");
        setCryptoAmount("");
        setProofUrl("");
      } else {
        toast.error(result.error || "Failed to submit deposit");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (paymentMethods.length === 0) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <Wallet className="h-6 w-6 text-text-muted" />
          </div>
          <p className="mt-4 text-text-muted">No payment methods available</p>
          <p className="mt-1 text-sm text-text-muted">Please contact support for assistance</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-surface-muted text-text-muted"
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={cn("h-0.5 w-12 transition-colors", step > s ? "bg-primary" : "bg-surface-muted")} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Payment Method & Amount */}
      {step === 1 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Select Payment Method</CardTitle>
            <CardDescription>Choose how you want to fund your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Method Categories */}
            <div className="space-y-4">
              {availableTypes.map((type) => {
                const typeInfo = PAYMENT_TYPE_INFO[type];
                const methods = groupedMethods[type];
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                      <div className={cn("flex h-6 w-6 items-center justify-center rounded", typeInfo.color)}>
                        {typeInfo.icon}
                      </div>
                      {typeInfo.label}
                    </div>
                    <div className="grid gap-2">
                      {methods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => {
                            setSelectedMethod(method);
                            if (method.type === "CRYPTO" && method.network && amount) {
                              const rate = exchangeRates[method.network] || 1;
                              const crypto = parseFloat(amount) / rate;
                              setCryptoAmount(crypto.toFixed(8));
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border transition-all text-left",
                            selectedMethod?.id === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-surface-muted"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeInfo.color)}>
                              {typeInfo.icon}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{method.name}</p>
                              <p className="text-xs text-text-muted">
                                {method.type === "CRYPTO" && method.network
                                  ? NETWORK_NAMES[method.network] || method.network
                                  : method.email || method.username || method.bankName || ""}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            "h-5 w-5 transition-colors",
                            selectedMethod?.id === method.id ? "text-primary" : "text-text-muted"
                          )} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Amount Input */}
            {selectedMethod && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Amount ({userCurrency})</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="h-12 text-lg pr-16"
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                      {userCurrency}
                    </span>
                  </div>
                </div>

                {/* Crypto Equivalent */}
                {selectedMethod.type === "CRYPTO" && amount && parseFloat(amount) > 0 && (
                  <div className="rounded-lg bg-surface-muted p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">You will send</span>
                      <span className="text-lg font-semibold text-text-primary">
                        {cryptoAmount} {selectedMethod.network?.replace("-TRC20", "").replace("-ERC20", "")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-text-muted">
                        Rate: 1 {selectedMethod.network?.replace("-TRC20", "").replace("-ERC20", "")} = {formatCurrency(exchangeRates[selectedMethod.network || ""] || 1)}
                      </p>
                      <Button variant="ghost" size="sm" onClick={fetchExchangeRates} disabled={isLoadingRates}>
                        <RefreshCw className={cn("h-3 w-3", isLoadingRates && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-12"
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && selectedMethod && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Send Payment</CardTitle>
            <CardDescription>
              {selectedMethod.type === "CRYPTO"
                ? `Send exactly ${cryptoAmount} ${selectedMethod.network?.replace("-TRC20", "").replace("-ERC20", "")} to the address below`
                : `Send ${formatCurrency(parseFloat(amount))} using ${selectedMethod.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crypto Payment Details */}
            {selectedMethod.type === "CRYPTO" && selectedMethod.walletAddress && (
              <>
                <div className="flex justify-center">
                  <div className="rounded-xl bg-white p-4">
                    <QRCode value={selectedMethod.walletAddress} size={180} level="H" />
                  </div>
                </div>

                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-text-secondary">Amount to send</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {cryptoAmount} {selectedMethod.network?.replace("-TRC20", "").replace("-ERC20", "")}
                  </p>
                  <p className="text-sm text-text-muted mt-1">≈ {formatCurrency(parseFloat(amount))}</p>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input value={selectedMethod.walletAddress} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(selectedMethod.walletAddress!)}>
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* PayPal, Zelle, Venmo, etc. */}
            {["PAYPAL", "ZELLE", "VENMO", "WISE", "SKRILL"].includes(selectedMethod.type) && (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-text-secondary">Amount to send</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(parseFloat(amount))}</p>
                </div>

                <div className="rounded-lg bg-surface-muted p-4 space-y-3">
                  <p className="font-medium text-text-primary">Payment Details</p>
                  {selectedMethod.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Email:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{selectedMethod.email}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.email!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.username && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{selectedMethod.username}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.username!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Phone:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{selectedMethod.phone}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.phone!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cash App */}
            {selectedMethod.type === "CASHAPP" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-text-secondary">Amount to send</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(parseFloat(amount))}</p>
                </div>

                <div className="rounded-lg bg-surface-muted p-4 space-y-3">
                  <p className="font-medium text-text-primary">Cash App Details</p>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">$Cashtag:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-lg">{selectedMethod.username}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.username!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {selectedMethod.type === "BANK_TRANSFER" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-text-secondary">Amount to send</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(parseFloat(amount))}</p>
                </div>

                <div className="rounded-lg bg-surface-muted p-4 space-y-3">
                  <p className="font-medium text-text-primary">Bank Details</p>
                  {selectedMethod.bankName && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Bank:</span>
                      <span className="font-medium text-text-primary">{selectedMethod.bankName}</span>
                    </div>
                  )}
                  {selectedMethod.accountName && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Account Name:</span>
                      <span className="font-medium text-text-primary">{selectedMethod.accountName}</span>
                    </div>
                  )}
                  {selectedMethod.accountNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{selectedMethod.accountNumber}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.accountNumber!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.routingNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Routing Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{selectedMethod.routingNumber}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.routingNumber!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedMethod.swiftCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">SWIFT:</span>
                      <span className="font-medium text-text-primary">{selectedMethod.swiftCode}</span>
                    </div>
                  )}
                  {selectedMethod.iban && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">IBAN:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary text-sm">{selectedMethod.iban}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedMethod.iban!)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            {selectedMethod.instructions && (
              <div className="rounded-lg bg-surface-muted p-4">
                <p className="font-medium text-text-primary mb-2">Instructions</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{selectedMethod.instructions}</p>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Important</p>
                <p className="text-text-secondary mt-1">
                  Please ensure you send the exact amount. After sending, proceed to upload your payment proof.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                I&apos;ve Sent Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upload Proof */}
      {step === 3 && selectedMethod && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Upload Payment Proof</CardTitle>
            <CardDescription>Upload a screenshot of your transaction as proof of payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Summary */}
            <div className="rounded-lg bg-surface-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Amount</span>
                <span className="text-text-primary font-medium">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Payment Method</span>
                <span className="text-text-primary font-medium">{selectedMethod.name}</span>
              </div>
              {selectedMethod.type === "CRYPTO" && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Crypto Amount</span>
                  <span className="text-text-primary font-medium">
                    {cryptoAmount} {selectedMethod.network?.replace("-TRC20", "").replace("-ERC20", "")}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Area */}
            {!proofUrl ? (
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  isUploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface-muted"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                    <p className="text-text-secondary">Uploading... {uploadProgress}%</p>
                    <div className="w-full bg-surface-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted mx-auto">
                      <Upload className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">Drop your screenshot here</p>
                      <p className="text-sm text-text-muted mt-1">or click to browse (PNG, JPG up to 10MB)</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={proofUrl} alt="Payment proof" className="w-full max-h-64 object-contain bg-surface-muted" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setProofUrl("")}>
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-success/90 text-white px-2 py-1 rounded text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Uploaded
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={isSubmitting}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={!proofUrl || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Deposit
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
