"use server";

import { collections, type AppSettings, type InvestmentPlan, type DepositWallet, type PaymentMethod, type PaymentMethodType } from "@/lib/db";

// Public interface for investment plans (no sensitive data)
export interface PublicInvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
}

// Fetch active investment plans (public, no auth required)
export async function getPublicInvestmentPlans(): Promise<PublicInvestmentPlan[]> {
  const plans = await collections.investmentPlans()
    .find({ isActive: true })
    .sort({ minAmount: 1 })
    .toArray() as InvestmentPlan[];

  return plans.map(plan => ({
    id: plan._id.toString(),
    name: plan.name,
    minAmount: plan.minAmount,
    maxAmount: plan.maxAmount,
    roiPercentage: plan.roiPercentage,
    durationDays: plan.durationDays,
  }));
}

export async function getPublicAppSettings() {
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;

  const defaults = {
    siteName: "Standard Broker",
    supportEmail: "support@standardbroker.com",
    supportPhone: "+1 (888) 555-0123",
    address: "123 Financial District, New York, NY 10004",
  };

  if (!settings) {
    return defaults;
  }

  return {
    siteName: settings.siteName || defaults.siteName,
    supportEmail: settings.companyEmail || defaults.supportEmail,
    supportPhone: settings.companyPhone || defaults.supportPhone,
    address: settings.companyAddress || defaults.address,
  };
}

// Public interface for deposit wallets
export interface PublicDepositWallet {
  id: string;
  name: string;
  address: string;
  network: string;
}

// Fetch active deposit wallets (for authenticated users) - Legacy
export async function getActiveDepositWallets(): Promise<PublicDepositWallet[]> {
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;

  if (!settings || !settings.depositWallets) {
    return [];
  }

  // Filter only active wallets and map to public interface
  return settings.depositWallets
    .filter((w: DepositWallet) => w.isActive !== false)
    .map((w: DepositWallet, index: number) => ({
      id: w.id || `wallet-${index}`,
      name: w.label || w.name || w.network,
      address: w.address,
      network: w.network,
    }));
}

// Public interface for payment methods
export interface PublicPaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  // Crypto
  network?: string;
  walletAddress?: string;
  // PayPal, Zelle, CashApp, Venmo
  email?: string;
  username?: string;
  phone?: string;
  // Bank Transfer
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankAddress?: string;
  // Instructions
  instructions?: string;
}

// Fetch active payment methods (for authenticated users)
export async function getActivePaymentMethods(): Promise<PublicPaymentMethod[]> {
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;

  if (!settings) {
    return [];
  }

  // Get from new paymentMethods array
  const paymentMethods = settings.paymentMethods || [];
  const activePaymentMethods = paymentMethods
    .filter((pm: PaymentMethod) => pm.isActive)
    .map((pm: PaymentMethod) => ({
      id: pm.id,
      type: pm.type,
      name: pm.name,
      network: pm.network,
      walletAddress: pm.walletAddress,
      email: pm.email,
      username: pm.username,
      phone: pm.phone,
      bankName: pm.bankName,
      accountName: pm.accountName,
      accountNumber: pm.accountNumber,
      routingNumber: pm.routingNumber,
      swiftCode: pm.swiftCode,
      iban: pm.iban,
      bankAddress: pm.bankAddress,
      instructions: pm.instructions,
    }));

  // Also include legacy deposit wallets as crypto methods for backward compatibility
  if (settings.depositWallets && settings.depositWallets.length > 0) {
    const legacyWallets = settings.depositWallets
      .filter((w: DepositWallet) => w.isActive !== false)
      .map((w: DepositWallet, index: number) => ({
        id: w.id || `legacy-wallet-${index}`,
        type: "CRYPTO" as PaymentMethodType,
        name: w.label || w.name || w.network,
        network: w.network,
        walletAddress: w.address,
      }));
    
    // Only add legacy wallets if no new crypto methods exist
    const hasCryptoMethods = activePaymentMethods.some(pm => pm.type === "CRYPTO");
    if (!hasCryptoMethods) {
      return [...legacyWallets, ...activePaymentMethods];
    }
  }

  return activePaymentMethods;
}

// Get payment methods grouped by type
export async function getPaymentMethodsByType(): Promise<Record<PaymentMethodType, PublicPaymentMethod[]>> {
  const methods = await getActivePaymentMethods();
  
  const grouped: Record<PaymentMethodType, PublicPaymentMethod[]> = {
    CRYPTO: [],
    PAYPAL: [],
    ZELLE: [],
    CASHAPP: [],
    BANK_TRANSFER: [],
    VENMO: [],
    WISE: [],
    SKRILL: [],
    OTHER: [],
  };

  methods.forEach(method => {
    if (grouped[method.type]) {
      grouped[method.type].push(method);
    }
  });

  return grouped;
}
