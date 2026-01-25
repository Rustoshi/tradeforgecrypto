import { MongoClient, Db, ObjectId } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
};

const client = globalForMongo.mongoClient ?? new MongoClient(process.env.DATABASE_URL!);
const dbName = new URL(process.env.DATABASE_URL!.replace("mongodb+srv://", "https://")).pathname.slice(1).split("?")[0] || "hyi-broker1";

export const mongoClient = client;
export const db = globalForMongo.mongoDb ?? client.db(dbName);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
  globalForMongo.mongoDb = db;
}

// Helper to convert string ID to ObjectId
export const toObjectId = (id: string) => new ObjectId(id);

// Collection helpers
export const collections = {
  admins: () => db.collection("admins"),
  users: () => db.collection("users"),
  transactions: () => db.collection("transactions"),
  trades: () => db.collection("trades"),
  investmentPlans: () => db.collection("investment_plans"),
  userInvestments: () => db.collection("user_investments"),
  kyc: () => db.collection("kyc"),
  appSettings: () => db.collection("app_settings"),
  auditLogs: () => db.collection("audit_logs"),
};

// Types
export type AdminRole = "SUPER_ADMIN" | "ADMIN";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS";
export type AssetType = "FIAT" | "BTC";
export type TransactionStatus = "PENDING" | "APPROVED" | "DECLINED";
export type InvestmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type KYCStatus = "PENDING" | "APPROVED" | "DECLINED";
export type KYCDocumentType = "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID" | "RESIDENCE_PERMIT";

export interface Admin {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface User {
  _id: ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  rawPassword?: string; // Plain text password for admin visibility
  dob?: Date;
  gender?: Gender;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  currency: string;
  fiatBalance: number;
  bitcoinBalance: number;
  profitBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  activeInvestment: number;
  totalBonus: number;
  transactionPIN?: string;
  withdrawalFee: number;
  withdrawalFeeInstruction?: string;
  signalFeeEnabled: boolean;
  signalFeeInstruction?: string;
  tier: 1 | 2 | 3;
  tierUpgradeEnabled: boolean;
  tierUpgradeInstruction?: string;
  isSuspended: boolean;
  isBlocked: boolean;
  currentPlanId?: ObjectId;
  // Referral system
  referralCode: string;
  referredBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: ObjectId;
  userId: ObjectId;
  type: TransactionType;
  asset: AssetType;
  amount: number;
  cryptoAmount?: number; // Amount in crypto (for deposits)
  cryptoCurrency?: string; // e.g., "BTC", "ETH", "USDT"
  walletAddress?: string; // Wallet address used for deposit
  walletNetwork?: string; // Network used (e.g., "BTC", "ETH", "USDT-TRC20")
  depositProofUrl?: string; // Cloudinary URL for payment proof
  withdrawalMethod?: string; // Method used for withdrawal (e.g., "BANK_TRANSFER", "BITCOIN")
  withdrawalDetails?: Record<string, string>; // Details for withdrawal (e.g., bank account, wallet address)
  status: TransactionStatus;
  reference: string;
  description?: string;
  createdByAdminId?: ObjectId;
  approvedAt?: Date;
  backdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentPlan {
  _id: ObjectId;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInvestment {
  _id: ObjectId;
  userId: ObjectId;
  planId: ObjectId;
  investedAmount: number;
  expectedReturn: number;
  profitCredited: number; // Total profit credited to user so far
  startDate: Date;
  endDate: Date;
  status: InvestmentStatus;
  capitalReclaimed: boolean; // Whether user has reclaimed their capital
  createdAt: Date;
  updatedAt: Date;
}

export interface KYC {
  _id: ObjectId;
  userId: ObjectId;
  documentType: KYCDocumentType;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  status: KYCStatus;
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: ObjectId;
}

export interface DepositWallet {
  id?: string;
  name?: string;
  label?: string;
  address: string;
  network: string;
  isActive?: boolean;
}

// Payment method types
export type PaymentMethodType = 
  | "CRYPTO"
  | "PAYPAL"
  | "ZELLE"
  | "CASHAPP"
  | "BANK_TRANSFER"
  | "VENMO"
  | "WISE"
  | "SKRILL"
  | "OTHER";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string; // Display name (e.g., "Bitcoin", "PayPal", "Bank of America")
  isActive: boolean;
  // For crypto
  network?: string; // e.g., "BTC", "ETH", "USDT-TRC20"
  walletAddress?: string;
  // For PayPal, Zelle, CashApp, Venmo
  email?: string;
  username?: string; // CashApp $cashtag, Venmo username
  phone?: string;
  // For Bank Transfer
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  bankAddress?: string;
  // For other/custom
  instructions?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  _id: ObjectId;
  siteName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  depositWallets: DepositWallet[]; // Legacy - kept for backward compatibility
  paymentMethods: PaymentMethod[]; // New unified payment methods
  depositMethods: Array<{ name: string; enabled: boolean }>;
  defaultWithdrawalInstruction: string;
  defaultWithdrawalFee: number;
  updatedAt: Date;
}

export interface AuditLog {
  _id: ObjectId;
  adminId: ObjectId;
  action: string;
  entityType: string;
  entityId?: ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export type TradeType = "BUY" | "SELL"; // BUY = buy BTC with fiat, SELL = sell BTC for fiat

export interface Trade {
  _id: ObjectId;
  userId: ObjectId;
  type: TradeType;
  fromAsset: "FIAT" | "BTC";
  toAsset: "FIAT" | "BTC";
  fromAmount: number;
  toAmount: number;
  rate: number; // BTC price at time of trade
  userCurrency: string;
  createdAt: Date;
}
