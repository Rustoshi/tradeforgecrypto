import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { collections } from "@/lib/db";
import { ObjectId } from "mongodb";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-key"
);

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  fullName: string;
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
  isEmailVerified: boolean;
  kycStatus?: string;
  // Withdrawal-related fields
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
  // Referral
  referralCode: string;
  // Plan
  currentPlanName?: string;
}

// Get current user session from JWT token
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user-token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

// Get full user data from database
export async function getCurrentUser(): Promise<UserData | null> {
  const session = await getUserSession();
  
  if (!session) {
    return null;
  }

  try {
    const userId = new ObjectId(session.userId);
    
    // Fetch user and KYC status in parallel
    const [user, kyc] = await Promise.all([
      collections.users().findOne({ _id: userId }),
      collections.kyc().findOne({ userId }),
    ]);

    if (!user) {
      return null;
    }

    // Fetch current plan name if user has a plan
    let currentPlanName: string | undefined;
    if (user.currentPlanId) {
      const plan = await collections.investmentPlans().findOne({ _id: user.currentPlanId });
      currentPlanName = plan?.name;
    }

    // Determine KYC status from kyc collection
    let kycStatus: string | undefined;
    if (kyc) {
      // Map KYC status to dashboard display format
      if (kyc.status === "APPROVED") {
        kycStatus = "verified";
      } else if (kyc.status === "PENDING") {
        kycStatus = "pending";
      } else if (kyc.status === "DECLINED") {
        kycStatus = "rejected";
      }
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      country: user.country,
      city: user.city,
      address: user.address,
      phone: user.phone,
      currency: user.currency || "USD",
      fiatBalance: user.fiatBalance || 0,
      bitcoinBalance: user.bitcoinBalance || 0,
      profitBalance: user.profitBalance || 0,
      totalDeposited: user.totalDeposited || 0,
      totalWithdrawn: user.totalWithdrawn || 0,
      activeInvestment: user.activeInvestment || 0,
      totalBonus: user.totalBonus || 0,
      isEmailVerified: user.isEmailVerified || false,
      kycStatus,
      // Withdrawal-related fields
      transactionPIN: user.transactionPIN,
      withdrawalFee: user.withdrawalFee || 0,
      withdrawalFeeInstruction: user.withdrawalFeeInstruction,
      signalFeeEnabled: user.signalFeeEnabled || false,
      signalFeeInstruction: user.signalFeeInstruction,
      tier: user.tier || 1,
      tierUpgradeEnabled: user.tierUpgradeEnabled || false,
      tierUpgradeInstruction: user.tierUpgradeInstruction,
      isSuspended: user.isSuspended || false,
      isBlocked: user.isBlocked || false,
      // Referral
      referralCode: user.referralCode || "",
      // Plan
      currentPlanName,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Require user authentication - throws if not authenticated
export async function requireUser(): Promise<UserSession> {
  const session = await getUserSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  return session;
}
