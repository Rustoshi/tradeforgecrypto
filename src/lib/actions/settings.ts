"use server";

import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { collections, toObjectId, type AppSettings, type InvestmentPlan, type Admin, type PaymentMethod, type PaymentMethodType } from "@/lib/db";
import { randomUUID } from "crypto";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createAuditLog, AuditActions } from "@/lib/services/audit";
import {
  updateAppSettingsSchema,
  investmentPlanSchema,
  type UpdateAppSettingsInput,
  type InvestmentPlanInput,
} from "@/lib/validations/settings";

// App Settings
export async function getAppSettings() {
  await requireAdmin();

  let settings = await collections.appSettings().findOne({}) as AppSettings | null;

  if (!settings) {
    const result = await collections.appSettings().insertOne({
      siteName: "HYI Broker",
      depositWallets: [],
      paymentMethods: [],
      depositMethods: [],
      defaultWithdrawalInstruction: "",
      defaultWithdrawalFee: 0,
      updatedAt: new Date(),
    });
    settings = await collections.appSettings().findOne({ _id: result.insertedId }) as AppSettings;
  }

  // Ensure paymentMethods exists for backward compatibility
  if (!settings.paymentMethods) {
    settings.paymentMethods = [];
  }

  // Convert to plain object for Client Components (remove _id with toJSON)
  const { _id, ...rest } = settings;
  return { ...rest, id: _id.toString() };
}

export async function updateAppSettings(input: UpdateAppSettingsInput) {
  const admin = await requireSuperAdmin();
  const validated = updateAppSettingsSchema.parse(input);

  let settings = await collections.appSettings().findOne({}) as AppSettings | null;

  if (!settings) {
    const result = await collections.appSettings().insertOne({
      siteName: validated.siteName || "HYI Broker",
      companyEmail: validated.companyEmail || "",
      companyPhone: validated.companyPhone || "",
      companyAddress: validated.companyAddress || "",
      depositWallets: validated.depositWallets || [],
      paymentMethods: [],
      depositMethods: validated.depositMethods || [],
      defaultWithdrawalInstruction: validated.defaultWithdrawalInstruction || "",
      defaultWithdrawalFee: validated.defaultWithdrawalFee || 0,
      updatedAt: new Date(),
    });
    settings = await collections.appSettings().findOne({ _id: result.insertedId }) as AppSettings;
  } else {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (validated.siteName !== undefined) updateData.siteName = validated.siteName;
    if (validated.companyEmail !== undefined) updateData.companyEmail = validated.companyEmail;
    if (validated.companyPhone !== undefined) updateData.companyPhone = validated.companyPhone;
    if (validated.companyAddress !== undefined) updateData.companyAddress = validated.companyAddress;
    if (validated.depositWallets) updateData.depositWallets = validated.depositWallets;
    if (validated.depositMethods) updateData.depositMethods = validated.depositMethods;
    if (validated.defaultWithdrawalInstruction !== undefined) {
      updateData.defaultWithdrawalInstruction = validated.defaultWithdrawalInstruction;
    }
    if (validated.defaultWithdrawalFee !== undefined) {
      updateData.defaultWithdrawalFee = validated.defaultWithdrawalFee;
    }

    await collections.appSettings().updateOne({ _id: settings._id }, { $set: updateData });
    settings = await collections.appSettings().findOne({ _id: settings._id }) as AppSettings;
  }

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.SETTINGS_UPDATED,
    entityType: "AppSettings",
    entityId: settings._id.toString(),
    details: validated,
  });

  revalidatePath("/admin/settings");
  // Convert to plain object for Client Components (remove _id with toJSON)
  const { _id, ...rest } = settings;
  return { ...rest, id: _id.toString() };
}

// Investment Plans
export async function getInvestmentPlans() {
  await requireAdmin();

  const plansRaw = await collections.investmentPlans().find().sort({ minAmount: 1 }).toArray();

  const plans = await Promise.all(
    plansRaw.map(async (plan) => {
      const [usersCount, investmentsCount] = await Promise.all([
        collections.users().countDocuments({ currentPlanId: plan._id }),
        collections.userInvestments().countDocuments({ planId: plan._id }),
      ]);
      return {
        ...plan,
        id: plan._id.toString(),
        _count: { users: usersCount, investments: investmentsCount },
      };
    })
  );

  return plans;
}

export async function getInvestmentPlanById(id: string) {
  await requireAdmin();

  const plan = await collections.investmentPlans().findOne({ _id: toObjectId(id) }) as InvestmentPlan | null;
  if (!plan) return null;

  const [usersCount, investmentsCount] = await Promise.all([
    collections.users().countDocuments({ currentPlanId: plan._id }),
    collections.userInvestments().countDocuments({ planId: plan._id }),
  ]);

  return {
    ...plan,
    id: plan._id.toString(),
    _count: { users: usersCount, investments: investmentsCount },
  };
}

export async function createInvestmentPlan(input: InvestmentPlanInput) {
  const admin = await requireAdmin();
  const validated = investmentPlanSchema.parse(input);

  const now = new Date();
  const result = await collections.investmentPlans().insertOne({
    name: validated.name,
    minAmount: validated.minAmount,
    maxAmount: validated.maxAmount,
    roiPercentage: validated.roiPercentage,
    durationDays: validated.durationDays,
    isActive: validated.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  });

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.PLAN_CREATED,
    entityType: "InvestmentPlan",
    entityId: result.insertedId.toString(),
    details: validated,
  });

  revalidatePath("/admin/settings");
  return { id: result.insertedId.toString(), ...validated };
}

export async function updateInvestmentPlan(id: string, input: InvestmentPlanInput) {
  const admin = await requireAdmin();
  const validated = investmentPlanSchema.parse(input);

  await collections.investmentPlans().updateOne(
    { _id: toObjectId(id) },
    {
      $set: {
        name: validated.name,
        minAmount: validated.minAmount,
        maxAmount: validated.maxAmount,
        roiPercentage: validated.roiPercentage,
        durationDays: validated.durationDays,
        isActive: validated.isActive,
        updatedAt: new Date(),
      },
    }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.PLAN_UPDATED,
    entityType: "InvestmentPlan",
    entityId: id,
    details: validated,
  });

  revalidatePath("/admin/settings");
  return { id, ...validated };
}

export async function deleteInvestmentPlan(id: string) {
  const admin = await requireAdmin();

  const plan = await collections.investmentPlans().findOne({ _id: toObjectId(id) }) as InvestmentPlan | null;
  if (!plan) {
    throw new Error("Investment plan not found");
  }

  const [usersCount, investmentsCount] = await Promise.all([
    collections.users().countDocuments({ currentPlanId: toObjectId(id) }),
    collections.userInvestments().countDocuments({ planId: toObjectId(id) }),
  ]);

  if (usersCount > 0 || investmentsCount > 0) {
    throw new Error("Cannot delete plan with active users or investments");
  }

  await collections.investmentPlans().deleteOne({ _id: toObjectId(id) });

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.PLAN_DELETED,
    entityType: "InvestmentPlan",
    entityId: id,
    details: { name: plan.name },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

// ==================== ADMIN PASSWORD SETTINGS ====================

export interface ChangeAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeAdminPasswordResult {
  success: boolean;
  error?: string;
}

export async function changeAdminPassword(input: ChangeAdminPasswordInput): Promise<ChangeAdminPasswordResult> {
  const adminSession = await requireAdmin();

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

  // Get admin
  const admin = await collections.admins().findOne({ _id: toObjectId(adminSession.id) }) as Admin | null;
  
  if (!admin) {
    return { success: false, error: "Admin not found" };
  }

  // Verify current password
  const isValidPassword = await compare(currentPassword, admin.passwordHash);
  
  if (!isValidPassword) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Hash new password
  const newPasswordHash = await hash(newPassword, 12);

  await collections.admins().updateOne(
    { _id: toObjectId(adminSession.id) },
    {
      $set: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    }
  );

  await createAuditLog({
    adminId: adminSession.id,
    action: AuditActions.ADMIN_PASSWORD_CHANGED,
    entityType: "Admin",
    entityId: adminSession.id,
    details: { action: "password_changed" },
  });

  return { success: true };
}

// ==================== PAYMENT METHODS ====================

export interface PaymentMethodInput {
  type: PaymentMethodType;
  name: string;
  isActive?: boolean;
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
  // Other
  instructions?: string;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  await requireAdmin();
  
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;
  return settings?.paymentMethods || [];
}

export async function addPaymentMethod(input: PaymentMethodInput): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
  const admin = await requireAdmin();
  
  const now = new Date();
  const paymentMethod: PaymentMethod = {
    id: randomUUID(),
    type: input.type,
    name: input.name,
    isActive: input.isActive ?? true,
    network: input.network,
    walletAddress: input.walletAddress,
    email: input.email,
    username: input.username,
    phone: input.phone,
    bankName: input.bankName,
    accountName: input.accountName,
    accountNumber: input.accountNumber,
    routingNumber: input.routingNumber,
    swiftCode: input.swiftCode,
    iban: input.iban,
    bankAddress: input.bankAddress,
    instructions: input.instructions,
    createdAt: now,
    updatedAt: now,
  };

  let settings = await collections.appSettings().findOne({}) as AppSettings | null;
  
  if (!settings) {
    await collections.appSettings().insertOne({
      siteName: "HYI Broker",
      depositWallets: [],
      paymentMethods: [paymentMethod],
      depositMethods: [],
      defaultWithdrawalInstruction: "",
      defaultWithdrawalFee: 0,
      updatedAt: now,
    });
  } else {
    const paymentMethods = settings.paymentMethods || [];
    paymentMethods.push(paymentMethod);
    
    await collections.appSettings().updateOne(
      { _id: settings._id },
      { $set: { paymentMethods, updatedAt: now } }
    );
  }

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.SETTINGS_UPDATED,
    entityType: "PaymentMethod",
    entityId: paymentMethod.id,
    details: { action: "add_payment_method", type: input.type, name: input.name },
  });

  revalidatePath("/admin/settings");
  return { success: true, paymentMethod };
}

export async function updatePaymentMethod(
  id: string,
  input: Partial<PaymentMethodInput>
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;
  if (!settings || !settings.paymentMethods) {
    return { success: false, error: "Payment method not found" };
  }

  const index = settings.paymentMethods.findIndex(pm => pm.id === id);
  if (index === -1) {
    return { success: false, error: "Payment method not found" };
  }

  const updatedMethod = {
    ...settings.paymentMethods[index],
    ...input,
    updatedAt: new Date(),
  };
  
  settings.paymentMethods[index] = updatedMethod;

  await collections.appSettings().updateOne(
    { _id: settings._id },
    { $set: { paymentMethods: settings.paymentMethods, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.SETTINGS_UPDATED,
    entityType: "PaymentMethod",
    entityId: id,
    details: { action: "update_payment_method", ...input },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deletePaymentMethod(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;
  if (!settings || !settings.paymentMethods) {
    return { success: false, error: "Payment method not found" };
  }

  const method = settings.paymentMethods.find(pm => pm.id === id);
  if (!method) {
    return { success: false, error: "Payment method not found" };
  }

  const updatedMethods = settings.paymentMethods.filter(pm => pm.id !== id);

  await collections.appSettings().updateOne(
    { _id: settings._id },
    { $set: { paymentMethods: updatedMethods, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.SETTINGS_UPDATED,
    entityType: "PaymentMethod",
    entityId: id,
    details: { action: "delete_payment_method", type: method.type, name: method.name },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function togglePaymentMethodStatus(id: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
  const admin = await requireAdmin();
  
  const settings = await collections.appSettings().findOne({}) as AppSettings | null;
  if (!settings || !settings.paymentMethods) {
    return { success: false, error: "Payment method not found" };
  }

  const index = settings.paymentMethods.findIndex(pm => pm.id === id);
  if (index === -1) {
    return { success: false, error: "Payment method not found" };
  }

  const newStatus = !settings.paymentMethods[index].isActive;
  settings.paymentMethods[index].isActive = newStatus;
  settings.paymentMethods[index].updatedAt = new Date();

  await collections.appSettings().updateOne(
    { _id: settings._id },
    { $set: { paymentMethods: settings.paymentMethods, updatedAt: new Date() } }
  );

  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.SETTINGS_UPDATED,
    entityType: "PaymentMethod",
    entityId: id,
    details: { action: "toggle_payment_method", isActive: newStatus },
  });

  revalidatePath("/admin/settings");
  return { success: true, isActive: newStatus };
}
