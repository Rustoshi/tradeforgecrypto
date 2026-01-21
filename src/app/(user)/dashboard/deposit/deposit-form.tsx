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
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { submitDeposit } from "@/lib/actions/deposit";
import type { PublicDepositWallet } from "@/lib/actions/public";

interface DepositFormProps {
  wallets: PublicDepositWallet[];
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
  MATIC: "Polygon",
  ADA: "Cardano",
  DOT: "Polkadot",
  AVAX: "Avalanche",
  TRX: "Tron",
};

// Exchange rates type
interface ExchangeRates {
  [network: string]: number;
}

export function DepositForm({ wallets, userCurrency }: DepositFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedWallet, setSelectedWallet] = useState<PublicDepositWallet | null>(null);
  const [amount, setAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  
  // Exchange rates from CoinGecko
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState(false);

  // Fetch exchange rates on mount and when currency changes
  useEffect(() => {
    fetchExchangeRates();
  }, [userCurrency]);

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    setRatesError(false);
    
    try {
      const response = await fetch(`/api/exchange-rates?currency=${userCurrency}`);
      const data = await response.json();
      
      if (data.success && data.rates) {
        setExchangeRates(data.rates);
      } else {
        setRatesError(true);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      setRatesError(true);
    } finally {
      setIsLoadingRates(false);
    }
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Calculate crypto amount when fiat amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (selectedWallet && value) {
      const rate = exchangeRates[selectedWallet.network] || 1;
      const crypto = parseFloat(value) / rate;
      setCryptoAmount(crypto.toFixed(8));
    } else {
      setCryptoAmount("");
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (selectedWallet) {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle Cloudinary upload
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file
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
      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "deposit_proofs");
      formData.append("folder", "deposit-proofs");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Cloudinary error:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      setProofUrl(data.secure_url);
      toast.success("Proof uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, [handleImageUpload]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Submit deposit
  const handleSubmit = async () => {
    if (!selectedWallet || !amount || !cryptoAmount || !proofUrl) {
      toast.error("Please complete all steps");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitDeposit({
        amount: parseFloat(amount),
        cryptoAmount: parseFloat(cryptoAmount),
        cryptoCurrency: selectedWallet.network,
        walletAddress: selectedWallet.address,
        walletNetwork: selectedWallet.network,
        depositProofUrl: proofUrl,
      });

      if (result.success) {
        toast.success("Deposit submitted successfully!", {
          description: `Reference: ${result.reference}`,
        });
        router.refresh();
        // Reset form
        setStep(1);
        setSelectedWallet(null);
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

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (wallets.length === 0) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <Wallet className="h-6 w-6 text-text-muted" />
          </div>
          <p className="mt-4 text-text-muted">No deposit wallets available</p>
          <p className="mt-1 text-sm text-text-muted">
            Please contact support for assistance
          </p>
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
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-muted text-text-muted"
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "h-0.5 w-12 transition-colors",
                  step > s ? "bg-primary" : "bg-surface-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Wallet & Amount */}
      {step === 1 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-text-primary">Select Payment Method</CardTitle>
                <CardDescription>
                  Choose a cryptocurrency and enter the amount you want to deposit
                </CardDescription>
              </div>
              {/* Refresh rates button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchExchangeRates}
                disabled={isLoadingRates}
                className="text-text-muted hover:text-text-primary"
              >
                <RefreshCw className={cn("h-4 w-4", isLoadingRates && "animate-spin")} />
              </Button>
            </div>
            {/* Rates status */}
            {isLoadingRates && (
              <p className="text-xs text-text-muted mt-2">Loading live rates...</p>
            )}
            {ratesError && (
              <p className="text-xs text-warning mt-2">Using fallback rates. Click refresh to try again.</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Selection */}
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <Select
                value={selectedWallet?.id || ""}
                onValueChange={(value) => {
                  const wallet = wallets.find((w) => w.id === value);
                  setSelectedWallet(wallet || null);
                  // Recalculate crypto amount
                  if (wallet && amount) {
                    const rate = exchangeRates[wallet.network] || 1;
                    const crypto = parseFloat(amount) / rate;
                    setCryptoAmount(crypto.toFixed(8));
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{wallet.name}</span>
                        <span className="text-text-muted">
                          ({NETWORK_NAMES[wallet.network] || wallet.network})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
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
            {selectedWallet && amount && parseFloat(amount) > 0 && (
              <div className="rounded-lg bg-surface-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">You will send</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {cryptoAmount} {selectedWallet.network.replace("-TRC20", "").replace("-ERC20", "")}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-text-muted">
                    Rate: 1 {selectedWallet.network.replace("-TRC20", "").replace("-ERC20", "")} = {formatCurrency(exchangeRates[selectedWallet.network] || 1)}
                  </p>
                  <span className="text-xs text-text-muted">
                    Powered by CoinGecko
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full h-12"
              disabled={!selectedWallet || !amount || parseFloat(amount) <= 0}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment Details & QR Code */}
      {step === 2 && selectedWallet && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Send Payment</CardTitle>
            <CardDescription>
              Send exactly {cryptoAmount} {selectedWallet.network.replace("-TRC20", "").replace("-ERC20", "")} to the address below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="rounded-xl bg-white p-4">
                <QRCode
                  value={selectedWallet.address}
                  size={180}
                  level="H"
                />
              </div>
            </div>

            {/* Amount to Send */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-sm text-text-secondary">Amount to send</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {cryptoAmount} {selectedWallet.network.replace("-TRC20", "").replace("-ERC20", "")}
              </p>
              <p className="text-sm text-text-muted mt-1">
                ≈ {formatCurrency(parseFloat(amount))}
              </p>
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  value={selectedWallet.address}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Network Info */}
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Important</p>
                <p className="text-text-secondary mt-1">
                  Only send {NETWORK_NAMES[selectedWallet.network] || selectedWallet.network} to this address. 
                  Sending any other cryptocurrency may result in permanent loss.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(3)}
              >
                I&apos;ve Sent Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upload Proof */}
      {step === 3 && selectedWallet && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Upload Payment Proof</CardTitle>
            <CardDescription>
              Upload a screenshot of your transaction as proof of payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Summary */}
            <div className="rounded-lg bg-surface-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Amount</span>
                <span className="text-text-primary font-medium">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Crypto Amount</span>
                <span className="text-text-primary font-medium">
                  {cryptoAmount} {selectedWallet.network.replace("-TRC20", "").replace("-ERC20", "")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Network</span>
                <span className="text-text-primary font-medium">
                  {NETWORK_NAMES[selectedWallet.network] || selectedWallet.network}
                </span>
              </div>
            </div>

            {/* Upload Area */}
            {!proofUrl ? (
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  isUploading
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-surface-muted"
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
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted mx-auto">
                      <Upload className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">
                        Drop your screenshot here
                      </p>
                      <p className="text-sm text-text-muted mt-1">
                        or click to browse (PNG, JPG up to 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={proofUrl}
                  alt="Payment proof"
                  className="w-full max-h-64 object-contain bg-surface-muted"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setProofUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-success/90 text-white px-2 py-1 rounded text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Uploaded
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!proofUrl || isSubmitting}
              >
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
