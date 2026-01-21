"use server";

import { collections, toObjectId, type User } from "@/lib/db";
import { getUserSession } from "@/lib/user-auth";

// Referred user info
export interface ReferredUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
}

// Referral stats
export interface ReferralStats {
  totalReferrals: number;
  referralCode: string;
}

// Get current user's referral code
export async function getReferralCode(): Promise<string | null> {
  const session = await getUserSession();
  
  if (!session) {
    return null;
  }

  const user = await collections.users().findOne(
    { _id: toObjectId(session.userId) },
    { projection: { referralCode: 1 } }
  );

  return user?.referralCode || null;
}

// Get users referred by current user
export async function getReferredUsers(): Promise<ReferredUser[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const referredUsers = await collections.users()
    .find(
      { referredBy: toObjectId(session.userId) },
      { projection: { fullName: 1, email: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray() as Pick<User, "_id" | "fullName" | "email" | "createdAt">[];

  return referredUsers.map(user => ({
    id: user._id.toString(),
    fullName: user.fullName,
    email: maskEmail(user.email),
    createdAt: user.createdAt,
  }));
}

// Get referral statistics
export async function getReferralStats(): Promise<ReferralStats> {
  const session = await getUserSession();
  
  if (!session) {
    return { totalReferrals: 0, referralCode: "" };
  }

  const [user, totalReferrals] = await Promise.all([
    collections.users().findOne(
      { _id: toObjectId(session.userId) },
      { projection: { referralCode: 1 } }
    ),
    collections.users().countDocuments({ referredBy: toObjectId(session.userId) }),
  ]);

  return {
    totalReferrals,
    referralCode: user?.referralCode || "",
  };
}

// Helper to mask email for privacy
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***@${domain}`;
}
