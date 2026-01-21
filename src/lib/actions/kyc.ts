"use server";

import { revalidatePath } from "next/cache";
import { collections, toObjectId, type KYC, type User } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getUserSession } from "@/lib/user-auth";
import { createAuditLog, AuditActions } from "@/lib/services/audit";
import { sendKYCApprovedEmail, sendKYCDeclinedEmail, sendKYCSubmittedEmail } from "@/lib/services/email";
import {
  reviewKYCSchema,
  kycFilterSchema,
  submitKYCSchema,
  type ReviewKYCInput,
  type KYCFilterInput,
  type SubmitKYCInput,
} from "@/lib/validations/kyc";

export async function getKYCSubmissions(params?: Partial<KYCFilterInput>) {
  await requireAdmin();

  const validated = kycFilterSchema.parse(params || {});
  const { page, limit, status } = validated;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [submissionsRaw, total] = await Promise.all([
    collections.kyc().find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).toArray() as Promise<KYC[]>,
    collections.kyc().countDocuments(filter),
  ]);

  const submissions = await Promise.all(
    submissionsRaw.map(async (kyc) => {
      const user = await collections.users().findOne(
        { _id: kyc.userId },
        { projection: { fullName: 1, email: 1, country: 1 } }
      );
      const { _id, userId, reviewedBy, ...kycData } = kyc;
      return {
        ...kycData,
        id: _id.toString(),
        userId: userId?.toString() || null,
        reviewedBy: reviewedBy?.toString() || null,
        user: user ? { id: user._id.toString(), fullName: user.fullName, email: user.email, country: user.country } : null,
      };
    })
  );

  return {
    submissions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getKYCById(id: string) {
  await requireAdmin();

  const kyc = await collections.kyc().findOne({ _id: toObjectId(id) }) as KYC | null;
  if (!kyc) return null;

  const user = await collections.users().findOne({ _id: kyc.userId }) as User | null;

  return {
    ...kyc,
    id: kyc._id.toString(),
    user: user ? { ...user, id: user._id.toString() } : null,
  };
}

export async function reviewKYC(input: ReviewKYCInput) {
  const admin = await requireAdmin();
  const validated = reviewKYCSchema.parse(input);

  const kyc = await collections.kyc().findOne({ _id: toObjectId(validated.kycId) }) as KYC | null;
  if (!kyc) {
    throw new Error("KYC submission not found");
  }

  if (kyc.status !== "PENDING") {
    throw new Error("KYC has already been reviewed");
  }

  const user = await collections.users().findOne({ _id: kyc.userId }) as User | null;
  if (!user) {
    throw new Error("User not found");
  }

  await collections.kyc().updateOne(
    { _id: toObjectId(validated.kycId) },
    {
      $set: {
        status: validated.status,
        rejectionReason: validated.status === "DECLINED" ? validated.rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: toObjectId(admin.id),
      },
    }
  );

  // Send email notification
  if (validated.status === "APPROVED") {
    await sendKYCApprovedEmail(user.email);
  } else {
    await sendKYCDeclinedEmail(user.email, validated.rejectionReason);
  }

  await createAuditLog({
    adminId: admin.id,
    action: validated.status === "APPROVED" ? AuditActions.KYC_APPROVED : AuditActions.KYC_DECLINED,
    entityType: "KYC",
    entityId: kyc._id.toString(),
    details: {
      userId: kyc.userId.toString(),
      status: validated.status,
      rejectionReason: validated.rejectionReason,
    },
  });

  revalidatePath("/admin/kyc");
  revalidatePath(`/admin/users/${kyc.userId.toString()}`);
  return { id: validated.kycId, status: validated.status };
}

export async function getPendingKYCCount() {
  await requireAdmin();
  return collections.kyc().countDocuments({ status: "PENDING" });
}

export async function getKYCStats() {
  await requireAdmin();

  const [pending, approved, declined] = await Promise.all([
    collections.kyc().countDocuments({ status: "PENDING" }),
    collections.kyc().countDocuments({ status: "APPROVED" }),
    collections.kyc().countDocuments({ status: "DECLINED" }),
  ]);

  return { pending, approved, declined, total: pending + approved + declined };
}

// ============================================
// USER-FACING KYC ACTIONS
// ============================================

export interface UserKYCStatus {
  hasSubmitted: boolean;
  status?: "PENDING" | "APPROVED" | "DECLINED";
  documentType?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

// Get current user's KYC status
export async function getUserKYCStatus(): Promise<UserKYCStatus> {
  const session = await getUserSession();
  
  if (!session) {
    return { hasSubmitted: false };
  }

  const kyc = await collections.kyc().findOne({ userId: toObjectId(session.userId) }) as KYC | null;
  
  if (!kyc) {
    return { hasSubmitted: false };
  }

  return {
    hasSubmitted: true,
    status: kyc.status,
    documentType: kyc.documentType,
    submittedAt: kyc.submittedAt,
    reviewedAt: kyc.reviewedAt,
    rejectionReason: kyc.rejectionReason,
  };
}

// Submit KYC application
export async function submitKYC(input: SubmitKYCInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  // Validate input
  const validated = submitKYCSchema.safeParse(input);
  if (!validated.success) {
    const issues = validated.error.issues || [];
    return { success: false, error: issues[0]?.message || "Invalid input" };
  }

  const { documentType, documentFrontUrl, documentBackUrl, selfieUrl } = validated.data;

  // Check if user already has a pending or approved KYC
  const existingKYC = await collections.kyc().findOne({ 
    userId: toObjectId(session.userId),
    status: { $in: ["PENDING", "APPROVED"] },
  }) as KYC | null;

  if (existingKYC) {
    if (existingKYC.status === "APPROVED") {
      return { success: false, error: "Your KYC has already been approved" };
    }
    return { success: false, error: "You already have a pending KYC application" };
  }

  // Get user for email
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Delete any previously declined KYC
  await collections.kyc().deleteMany({ 
    userId: toObjectId(session.userId),
    status: "DECLINED",
  });

  // Create new KYC submission
  const now = new Date();
  await collections.kyc().insertOne({
    userId: toObjectId(session.userId),
    documentType,
    documentFrontUrl,
    documentBackUrl: documentBackUrl || undefined,
    selfieUrl,
    status: "PENDING",
    submittedAt: now,
  });

  // Send confirmation email
  await sendKYCSubmittedEmail(user.email, user.fullName);

  revalidatePath("/dashboard/kyc");
  revalidatePath("/dashboard");

  return { success: true };
}

// Resubmit KYC after rejection
export async function resubmitKYC(input: SubmitKYCInput): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  // Check if user has a declined KYC
  const existingKYC = await collections.kyc().findOne({ 
    userId: toObjectId(session.userId),
  }) as KYC | null;

  if (!existingKYC) {
    return submitKYC(input);
  }

  if (existingKYC.status === "APPROVED") {
    return { success: false, error: "Your KYC has already been approved" };
  }

  if (existingKYC.status === "PENDING") {
    return { success: false, error: "You already have a pending KYC application" };
  }

  // Delete the declined KYC and submit new one
  await collections.kyc().deleteOne({ _id: existingKYC._id });
  
  return submitKYC(input);
}
