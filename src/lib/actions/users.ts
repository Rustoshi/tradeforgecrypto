"use server";

import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { collections, toObjectId, type User, type Transaction, type KYC, type UserInvestment } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getUserSession } from "@/lib/user-auth";
import { createAuditLog, AuditActions } from "@/lib/services/audit";
import {
  sendAccountSuspendedEmail,
  sendAccountReactivatedEmail,
  sendWelcomeEmail,
} from "@/lib/services/email";
import {
  createUserSchema,
  updateUserSchema,
  updateUserBalanceSchema,
  userActionSchema,
  adminEditUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UpdateUserBalanceInput,
  type UserActionInput,
  type AdminEditUserInput,
} from "@/lib/validations/user";

export async function getUsers(params?: {
  search?: string;
  status?: "active" | "suspended" | "blocked";
  page?: number;
  limit?: number;
}) {
  await requireAdmin();

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (params?.search) {
    filter.$or = [
      { fullName: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
    ];
  }

  if (params?.status === "suspended") {
    filter.isSuspended = true;
  } else if (params?.status === "blocked") {
    filter.isBlocked = true;
  } else if (params?.status === "active") {
    filter.isSuspended = false;
    filter.isBlocked = false;
  }

  const [users, total] = await Promise.all([
    collections.users()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collections.users().countDocuments(filter),
  ]);

  // Get related data for users - serialize all ObjectId fields
  const usersWithRelations = await Promise.all(
    users.map(async (user) => {
      const [currentPlan, kyc, transactionCount, investmentCount] = await Promise.all([
        user.currentPlanId ? collections.investmentPlans().findOne({ _id: user.currentPlanId }) : null,
        collections.kyc().findOne({ userId: user._id }, { projection: { status: 1 } }),
        collections.transactions().countDocuments({ userId: user._id }),
        collections.userInvestments().countDocuments({ userId: user._id }),
      ]);
      
      // Destructure to remove _id and serialize properly
      const { _id, currentPlanId, ...userData } = user;
      
      return {
        ...userData,
        id: _id.toString(),
        currentPlanId: currentPlanId?.toString() || null,
        currentPlan: currentPlan ? { 
          id: currentPlan._id.toString(), 
          name: currentPlan.name,
          roiPercentage: currentPlan.roiPercentage,
        } : null,
        kyc: kyc ? { id: kyc._id.toString(), status: kyc.status } : null,
        _count: { transactions: transactionCount, investments: investmentCount },
      };
    })
  );

  return {
    users: usersWithRelations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id: string) {
  await requireAdmin();

  const user = await collections.users().findOne({ _id: toObjectId(id) }) as User | null;
  if (!user) return null;

  const [currentPlan, kyc, transactions, investments, referralCount, referrer] = await Promise.all([
    user.currentPlanId ? collections.investmentPlans().findOne({ _id: user.currentPlanId }) : null,
    collections.kyc().findOne({ userId: user._id }) as Promise<KYC | null>,
    collections.transactions().find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).toArray() as Promise<Transaction[]>,
    collections.userInvestments().find({ userId: user._id }).sort({ createdAt: -1 }).toArray() as Promise<UserInvestment[]>,
    collections.users().countDocuments({ referredBy: user._id }),
    user.referredBy ? collections.users().findOne({ _id: user.referredBy }, { projection: { fullName: 1, email: 1 } }) : null,
  ]);

  // Get plans for investments - properly serialize
  const investmentsWithPlans = await Promise.all(
    investments.map(async (inv) => {
      const plan = await collections.investmentPlans().findOne({ _id: inv.planId });
      return {
        id: inv._id.toString(),
        planId: inv.planId?.toString() || null,
        userId: inv.userId?.toString() || null,
        investedAmount: inv.investedAmount,
        expectedReturn: inv.expectedReturn,
        startDate: inv.startDate,
        endDate: inv.endDate,
        status: inv.status,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        plan: plan ? { id: plan._id.toString(), name: plan.name, roiPercentage: plan.roiPercentage } : null,
      };
    })
  );

  // Destructure to remove _id and properly serialize
  const { _id, currentPlanId, referredBy, ...userData } = user;

  return {
    ...userData,
    id: _id.toString(),
    currentPlanId: currentPlanId?.toString() || null,
    currentPlan: currentPlan ? { 
      id: currentPlan._id.toString(), 
      name: currentPlan.name,
      roiPercentage: currentPlan.roiPercentage,
      durationDays: currentPlan.durationDays,
    } : null,
    kyc: kyc ? { 
      id: kyc._id.toString(), 
      status: kyc.status,
      documentType: kyc.documentType,
      documentFrontUrl: kyc.documentFrontUrl,
      documentBackUrl: kyc.documentBackUrl,
      selfieUrl: kyc.selfieUrl,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
    } : null,
    transactions: transactions.map(t => {
      const { _id: txId, userId: txUserId, ...txData } = t;
      return { 
        ...txData, 
        id: txId.toString(),
        userId: txUserId?.toString() || null,
      };
    }),
    investments: investmentsWithPlans,
    // Referral data
    referralCount,
    referredBy: referrer ? {
      id: referrer._id.toString(),
      fullName: referrer.fullName,
      email: referrer.email,
    } : null,
  };
}

// Generate a unique referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createUser(input: CreateUserInput) {
  const admin = await requireAdmin();
  const validated = createUserSchema.parse(input);

  const existingUser = await collections.users().findOne({ email: validated.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const now = new Date();
  const createdAt = validated.accountAge ? new Date(validated.accountAge) : now;
  const passwordHash = await hash(validated.password, 12);

  // Generate unique referral code
  let referralCode = generateReferralCode();
  while (await collections.users().findOne({ referralCode })) {
    referralCode = generateReferralCode();
  }
  
  const result = await collections.users().insertOne({
    fullName: validated.fullName,
    email: validated.email,
    passwordHash,
    rawPassword: validated.password, // Store raw password for admin visibility
    dob: validated.dob ? new Date(validated.dob) : undefined,
    country: validated.country,
    city: validated.city,
    address: validated.address,
    phone: validated.phone,
    currency: validated.currency || "USD",
    fiatBalance: validated.fiatBalance || 0,
    bitcoinBalance: validated.bitcoinBalance || 0,
    profitBalance: validated.profitBalance || 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    activeInvestment: 0,
    totalBonus: validated.totalBonus || 10,
    withdrawalFee: validated.withdrawalFee || 0,
    withdrawalFeeInstruction: validated.withdrawalFeeInstruction,
    signalFeeEnabled: validated.signalFeeEnabled || false,
    signalFeeInstruction: validated.signalFeeInstruction,
    tier: validated.tier || 1,
    tierUpgradeEnabled: validated.tierUpgradeEnabled || false,
    tierUpgradeInstruction: validated.tierUpgradeInstruction,
    transactionPIN: validated.transactionPIN, // Store as plain text
    isSuspended: false,
    isBlocked: false,
    currentPlanId: validated.currentPlanId ? toObjectId(validated.currentPlanId) : undefined,
    referralCode,
    createdAt,
    updatedAt: now,
  });

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_CREATED,
    entityType: "User",
    entityId: result.insertedId.toString(),
    details: { email: validated.email, fullName: validated.fullName },
  });

  // Send welcome email if enabled
  if (validated.sendWelcomeEmail) {
    await sendWelcomeEmail(validated.email, {
      fullName: validated.fullName,
      password: validated.password,
    });
  }

  revalidatePath("/admin/users");
  return { id: result.insertedId.toString(), ...validated };
}

export async function updateUser(input: UpdateUserInput) {
  const admin = await requireAdmin();
  const validated = updateUserSchema.parse(input);
  const { id, ...data } = validated;

  await collections.users().updateOne(
    { _id: toObjectId(id) },
    { 
      $set: {
        ...data,
        dob: data.dob ? new Date(data.dob) : undefined,
        updatedAt: new Date(),
      }
    }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_UPDATED,
    entityType: "User",
    entityId: id,
    details: data,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { id, ...data };
}

export async function updateUserBalance(input: UpdateUserBalanceInput) {
  const admin = await requireAdmin();
  const validated = updateUserBalanceSchema.parse(input);
  const { userId, ...balances } = validated;

  await collections.users().updateOne(
    { _id: toObjectId(userId) },
    { $set: { ...balances, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_BALANCE_UPDATED,
    entityType: "User",
    entityId: userId,
    details: balances,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { userId, ...balances };
}

export async function performUserAction(input: UserActionInput) {
  const admin = await requireAdmin();
  const validated = userActionSchema.parse(input);
  const { userId, action } = validated;

  const user = await collections.users().findOne({ _id: toObjectId(userId) }) as User | null;
  if (!user) {
    throw new Error("User not found");
  }

  let updateData: Record<string, unknown> = {};
  let auditAction: string;
  let newPin: string | null = null;

  switch (action) {
    case "suspend":
      updateData = { isSuspended: true };
      auditAction = AuditActions.USER_SUSPENDED;
      await sendAccountSuspendedEmail(user.email);
      break;
    case "unsuspend":
      updateData = { isSuspended: false };
      auditAction = AuditActions.USER_UNSUSPENDED;
      await sendAccountReactivatedEmail(user.email);
      break;
    case "block":
      updateData = { isBlocked: true };
      auditAction = AuditActions.USER_BLOCKED;
      break;
    case "unblock":
      updateData = { isBlocked: false };
      auditAction = AuditActions.USER_UNBLOCKED;
      break;
    case "resetPin":
      // Generate a new 4-digit PIN (stored as plain text)
      newPin = Math.floor(1000 + Math.random() * 9000).toString();
      updateData = { transactionPIN: newPin };
      auditAction = AuditActions.USER_PIN_RESET;
      break;
    default:
      throw new Error("Invalid action");
  }

  await collections.users().updateOne(
    { _id: toObjectId(userId) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: auditAction,
    entityType: "User",
    entityId: userId,
    details: { action },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { userId, newPin, ...updateData };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();

  const user = await collections.users().findOne({ _id: toObjectId(userId) }) as User | null;
  if (!user) {
    throw new Error("User not found");
  }

  // Delete related data
  await Promise.all([
    collections.transactions().deleteMany({ userId: toObjectId(userId) }),
    collections.userInvestments().deleteMany({ userId: toObjectId(userId) }),
    collections.kyc().deleteOne({ userId: toObjectId(userId) }),
    collections.users().deleteOne({ _id: toObjectId(userId) }),
  ]);

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_DELETED,
    entityType: "User",
    entityId: userId,
    details: { email: user.email, fullName: user.fullName },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function assignPlanToUser(userId: string, planId: string | null) {
  const admin = await requireAdmin();

  await collections.users().updateOne(
    { _id: toObjectId(userId) },
    { $set: { currentPlanId: planId ? toObjectId(planId) : null, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_UPDATED,
    entityType: "User",
    entityId: userId,
    details: { planId },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { userId, planId };
}

// Comprehensive admin edit - update all user fields
export async function adminEditUser(input: AdminEditUserInput) {
  const admin = await requireAdmin();
  const validated = adminEditUserSchema.parse(input);
  const { userId, kycStatus, rawPassword, ...userData } = validated;

  // Get current user for comparison
  const currentUser = await collections.users().findOne({ _id: toObjectId(userId) }) as User | null;
  if (!currentUser) {
    throw new Error("User not found");
  }

  // Check if email is being changed and if new email already exists
  if (userData.email !== currentUser.email) {
    const existingUser = await collections.users().findOne({ 
      email: userData.email.toLowerCase(),
      _id: { $ne: toObjectId(userId) }
    });
    if (existingUser) {
      throw new Error("Email already in use by another user");
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    fullName: userData.fullName,
    email: userData.email.toLowerCase(),
    phone: userData.phone || null,
    dob: userData.dob ? new Date(userData.dob) : null,
    gender: userData.gender || null,
    country: userData.country || null,
    city: userData.city || null,
    address: userData.address || null,
    currency: userData.currency,
    fiatBalance: userData.fiatBalance,
    bitcoinBalance: userData.bitcoinBalance,
    profitBalance: userData.profitBalance,
    totalDeposited: userData.totalDeposited,
    totalWithdrawn: userData.totalWithdrawn,
    activeInvestment: userData.activeInvestment,
    totalBonus: userData.totalBonus,
    withdrawalFee: userData.withdrawalFee,
    withdrawalFeeInstruction: userData.withdrawalFeeInstruction || null,
    signalFeeEnabled: userData.signalFeeEnabled,
    signalFeeInstruction: userData.signalFeeInstruction || null,
    tier: userData.tier,
    tierUpgradeEnabled: userData.tierUpgradeEnabled,
    tierUpgradeInstruction: userData.tierUpgradeInstruction || null,
    transactionPIN: userData.transactionPIN || null,
    isSuspended: userData.isSuspended,
    isBlocked: userData.isBlocked,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(),
  };

  // If rawPassword is provided and different from current, update both rawPassword and passwordHash
  if (rawPassword && rawPassword !== currentUser.rawPassword) {
    const newPasswordHash = await hash(rawPassword, 12);
    updateData.rawPassword = rawPassword;
    updateData.passwordHash = newPasswordHash;
  }

  // Update user document
  await collections.users().updateOne(
    { _id: toObjectId(userId) },
    { $set: updateData }
  );

  // Update KYC status if provided and KYC exists
  if (kycStatus) {
    await collections.kyc().updateOne(
      { userId: toObjectId(userId) },
      { $set: { status: kycStatus, updatedAt: new Date() } }
    );
  }

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_UPDATED,
    entityType: "User",
    entityId: userId,
    details: {
      changes: userData,
      kycStatus,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { userId, ...userData };
}

// ==================== USER-FACING ACTIONS ====================

// Update current user's profile
export interface UpdateProfileInput {
  fullName: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateUserProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  const { fullName, phone, country, city, address } = input;

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: "Full name is required" };
  }

  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    {
      $set: {
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        country: country?.trim() || null,
        city: city?.trim() || null,
        address: address?.trim() || null,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  
  return { success: true };
}

// Change current user's password
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export async function changeUserPassword(input: ChangePasswordInput): Promise<ChangePasswordResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  const { currentPassword, newPassword, confirmPassword } = input;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  // Get user
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
  
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Verify current password
  const isValidPassword = await compare(currentPassword, user.passwordHash);
  
  if (!isValidPassword) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Hash new password
  const newPasswordHash = await hash(newPassword, 12);

  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    {
      $set: {
        passwordHash: newPasswordHash,
        rawPassword: newPassword, // Store raw password for admin visibility
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/dashboard/settings");
  
  return { success: true };
}

// Change transaction PIN
export interface ChangePinInput {
  currentPin?: string;
  newPin: string;
  confirmPin: string;
}

export interface ChangePinResult {
  success: boolean;
  error?: string;
}

export async function changeTransactionPin(input: ChangePinInput): Promise<ChangePinResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  const { currentPin, newPin, confirmPin } = input;

  if (!newPin || !confirmPin) {
    return { success: false, error: "New PIN is required" };
  }

  if (newPin !== confirmPin) {
    return { success: false, error: "PINs do not match" };
  }

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "PIN must be exactly 4 digits" };
  }

  // Get user
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) }) as User | null;
  
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // If user has existing PIN, verify current PIN
  if (user.transactionPIN) {
    if (!currentPin) {
      return { success: false, error: "Current PIN is required" };
    }
    if (currentPin !== user.transactionPIN) {
      return { success: false, error: "Current PIN is incorrect" };
    }
  }

  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    {
      $set: {
        transactionPIN: newPin,
        updatedAt: new Date(),
      },
    }
  );

  revalidatePath("/dashboard/settings");
  
  return { success: true };
}
