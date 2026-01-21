import { z } from "zod";

export const withdrawalMethods = [
  { id: "BANK_TRANSFER", name: "Bank Transfer", icon: "Building2" },
  { id: "BITCOIN", name: "Bitcoin", icon: "Bitcoin" },
  { id: "ETHEREUM", name: "Ethereum", icon: "Coins" },
  { id: "CASHAPP", name: "Cash App", icon: "DollarSign" },
  { id: "PAYPAL", name: "PayPal", icon: "Wallet" },
  { id: "ZELLE", name: "Zelle", icon: "CreditCard" },
] as const;

export type WithdrawalMethod = typeof withdrawalMethods[number]["id"];

// Bank transfer details schema
const bankTransferDetailsSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountName: z.string().min(2, "Account holder name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  routingNumber: z.string().optional(),
  swiftCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
});

// Crypto wallet details schema
const cryptoWalletDetailsSchema = z.object({
  walletAddress: z.string().min(10, "Wallet address is required"),
  network: z.string().optional(),
});

// Cash App details schema
const cashAppDetailsSchema = z.object({
  cashtag: z.string().min(2, "Cash App tag is required").startsWith("$", "Cash App tag must start with $"),
});

// PayPal details schema
const paypalDetailsSchema = z.object({
  paypalEmail: z.string().email("Valid PayPal email is required"),
});

// Zelle details schema
const zelleDetailsSchema = z.object({
  zelleEmail: z.string().email("Valid email is required").optional(),
  zellePhone: z.string().optional(),
}).refine(data => data.zelleEmail || data.zellePhone, {
  message: "Either email or phone number is required for Zelle",
});

// Main withdrawal request schema
export const withdrawalRequestSchema = z.object({
  balanceType: z.enum(["FIAT", "BTC"]),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["BANK_TRANSFER", "BITCOIN", "ETHEREUM", "CASHAPP", "PAYPAL", "ZELLE"]),
  withdrawalDetails: z.record(z.string(), z.string()).optional(),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

// Verify PIN schema
export const verifyPinSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
});

// Set/Update PIN schema
export const setPinSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
  confirmPin: z.string().length(4, "PIN must be 4 digits"),
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"],
});

export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type VerifyPinInput = z.infer<typeof verifyPinSchema>;
export type SetPinInput = z.infer<typeof setPinSchema>;

// Helper to get required fields for each withdrawal method
export function getRequiredFieldsForMethod(method: WithdrawalMethod): string[] {
  switch (method) {
    case "BANK_TRANSFER":
      return ["bankName", "accountName", "accountNumber", "country"];
    case "BITCOIN":
    case "ETHEREUM":
      return ["walletAddress"];
    case "CASHAPP":
      return ["cashtag"];
    case "PAYPAL":
      return ["paypalEmail"];
    case "ZELLE":
      return ["zelleEmail"]; // or zellePhone
    default:
      return [];
  }
}

// Validate withdrawal details based on method
export function validateWithdrawalDetails(
  method: WithdrawalMethod,
  details: Record<string, string>
): { valid: boolean; error?: string } {
  try {
    switch (method) {
      case "BANK_TRANSFER":
        bankTransferDetailsSchema.parse(details);
        break;
      case "BITCOIN":
      case "ETHEREUM":
        cryptoWalletDetailsSchema.parse(details);
        break;
      case "CASHAPP":
        cashAppDetailsSchema.parse(details);
        break;
      case "PAYPAL":
        paypalDetailsSchema.parse(details);
        break;
      case "ZELLE":
        zelleDetailsSchema.parse(details);
        break;
    }
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      return { valid: false, error: issues[0]?.message || "Invalid details" };
    }
    return { valid: false, error: "Invalid withdrawal details" };
  }
}
