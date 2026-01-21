import { collections, toObjectId } from "@/lib/db";

interface AuditLogParams {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog({
  adminId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  try {
    await collections.auditLogs().insertOne({
      adminId: toObjectId(adminId),
      action,
      entityType,
      entityId: entityId ? toObjectId(entityId) : undefined,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break main operations
  }
}

// Audit action types
export const AuditActions = {
  // User actions
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_UNSUSPENDED: "USER_UNSUSPENDED",
  USER_BLOCKED: "USER_BLOCKED",
  USER_UNBLOCKED: "USER_UNBLOCKED",
  USER_PIN_RESET: "USER_PIN_RESET",
  USER_BALANCE_UPDATED: "USER_BALANCE_UPDATED",

  // Transaction actions
  TRANSACTION_CREATED: "TRANSACTION_CREATED",
  TRANSACTION_APPROVED: "TRANSACTION_APPROVED",
  TRANSACTION_DECLINED: "TRANSACTION_DECLINED",
  TRANSACTION_BACKDATED: "TRANSACTION_BACKDATED",
  TRANSACTION_DELETED: "TRANSACTION_DELETED",

  // KYC actions
  KYC_APPROVED: "KYC_APPROVED",
  KYC_DECLINED: "KYC_DECLINED",

  // Settings actions
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  WALLET_ADDED: "WALLET_ADDED",
  WALLET_REMOVED: "WALLET_REMOVED",
  DEPOSIT_METHOD_ADDED: "DEPOSIT_METHOD_ADDED",
  DEPOSIT_METHOD_REMOVED: "DEPOSIT_METHOD_REMOVED",

  // Investment plan actions
  PLAN_CREATED: "PLAN_CREATED",
  PLAN_UPDATED: "PLAN_UPDATED",
  PLAN_DELETED: "PLAN_DELETED",

  // Admin actions
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ADMIN_CREATED: "ADMIN_CREATED",
  ADMIN_PASSWORD_CHANGED: "ADMIN_PASSWORD_CHANGED",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
