"use server";

import { revalidatePath } from "next/cache";
import { collections, toObjectId, type UserInvestment, type InvestmentPlan, type User } from "@/lib/db";
import { getUserSession } from "@/lib/user-auth";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog, AuditActions } from "@/lib/services/audit";
import { sendProfitCreditedEmail } from "@/lib/services/email";

// User-facing investment with plan details
export interface UserInvestmentWithPlan {
  id: string;
  planId: string;
  planName: string;
  investedAmount: number;
  expectedReturn: number;
  profitCredited: number;
  roiPercentage: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  daysRemaining: number;
  progress: number; // 0-100
  capitalReclaimed: boolean;
  canReclaimCapital: boolean; // true if plan ended and capital not yet reclaimed
  createdAt: Date;
}

export interface InvestmentStats {
  activeCount: number;
  totalInvested: number;
  totalReturns: number;
  completedCount: number;
}

// Get current user's investments with plan details
export async function getUserInvestments(): Promise<UserInvestmentWithPlan[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const investments = await collections.userInvestments()
    .find({ userId: toObjectId(session.userId) })
    .sort({ createdAt: -1 })
    .toArray() as UserInvestment[];

  // Get all unique plan IDs
  const planIds = [...new Set(investments.map(inv => inv.planId.toString()))];
  
  // Fetch all plans in one query
  const plans = await collections.investmentPlans()
    .find({ _id: { $in: planIds.map(id => toObjectId(id)) } })
    .toArray() as InvestmentPlan[];
  
  const planMap = new Map(plans.map(p => [p._id.toString(), p]));

  const now = new Date();

  return investments.map(inv => {
    const plan = planMap.get(inv.planId.toString());
    const startDate = new Date(inv.startDate);
    const endDate = new Date(inv.endDate);
    
    // Calculate days remaining and progress
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate progress based on profit credited vs expected profit
    const expectedProfit = inv.expectedReturn - inv.investedAmount;
    const profitCredited = inv.profitCredited || 0;
    const progress = expectedProfit > 0 
      ? Math.min(100, Math.max(0, (profitCredited / expectedProfit) * 100))
      : 0;

    // Can reclaim capital if plan ended and not yet reclaimed
    const planEnded = now >= endDate;
    const capitalReclaimed = inv.capitalReclaimed || false;
    const canReclaimCapital = planEnded && !capitalReclaimed && inv.status === "ACTIVE";

    return {
      id: inv._id.toString(),
      planId: inv.planId.toString(),
      planName: plan?.name || "Unknown Plan",
      investedAmount: inv.investedAmount,
      expectedReturn: inv.expectedReturn,
      profitCredited,
      roiPercentage: plan?.roiPercentage || 0,
      startDate: inv.startDate,
      endDate: inv.endDate,
      status: inv.status,
      daysRemaining,
      progress,
      capitalReclaimed,
      canReclaimCapital,
      createdAt: inv.createdAt,
    };
  });
}

// Get investment statistics for current user
export async function getUserInvestmentStats(): Promise<InvestmentStats> {
  const session = await getUserSession();
  
  if (!session) {
    return {
      activeCount: 0,
      totalInvested: 0,
      totalReturns: 0,
      completedCount: 0,
    };
  }

  const userId = toObjectId(session.userId);

  const [activeAgg, completedAgg] = await Promise.all([
    collections.userInvestments().aggregate([
      { $match: { userId, status: "ACTIVE" } },
      { $group: { _id: null, total: { $sum: "$investedAmount" }, count: { $sum: 1 } } },
    ]).toArray(),
    collections.userInvestments().aggregate([
      { $match: { userId, status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$expectedReturn" }, count: { $sum: 1 } } },
    ]).toArray(),
  ]);

  return {
    activeCount: activeAgg[0]?.count || 0,
    totalInvested: activeAgg[0]?.total || 0,
    totalReturns: completedAgg[0]?.total || 0,
    completedCount: completedAgg[0]?.count || 0,
  };
}

// Get available investment plans for user
export interface AvailablePlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
}

export async function getAvailableInvestmentPlans(): Promise<AvailablePlan[]> {
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

// Get user's active subscription plan IDs
export async function getUserActiveSubscriptions(): Promise<string[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const activeInvestments = await collections.userInvestments()
    .find({ 
      userId: toObjectId(session.userId),
      status: "ACTIVE",
    })
    .toArray() as UserInvestment[];

  return activeInvestments.map(inv => inv.planId.toString());
}

// Subscribe to an investment plan
export interface SubscribeToPlanInput {
  planId: string;
  amount: number;
  balanceType: "FIAT" | "BTC";
}

export interface SubscribeToPlanResult {
  success: boolean;
  error?: string;
  investmentId?: string;
}

export async function subscribeToPlan(input: SubscribeToPlanInput): Promise<SubscribeToPlanResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  const { planId, amount, balanceType } = input;

  // Validate plan exists and is active
  const plan = await collections.investmentPlans().findOne({ 
    _id: toObjectId(planId),
    isActive: true,
  }) as InvestmentPlan | null;

  if (!plan) {
    return { success: false, error: "Investment plan not found or inactive" };
  }

  // Validate amount is within plan limits
  if (amount < plan.minAmount) {
    return { success: false, error: `Minimum investment is ${plan.minAmount}` };
  }

  if (amount > plan.maxAmount) {
    return { success: false, error: `Maximum investment is ${plan.maxAmount}` };
  }

  // Check if user already has an active subscription to this plan
  const existingSubscription = await collections.userInvestments().findOne({
    userId: toObjectId(session.userId),
    planId: toObjectId(planId),
    status: "ACTIVE",
  });

  if (existingSubscription) {
    return { success: false, error: "You already have an active subscription to this plan" };
  }

  // Get user and check balance
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) });
  
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const balanceField = balanceType === "BTC" ? "bitcoinBalance" : "fiatBalance";
  const currentBalance = user[balanceField] || 0;

  if (currentBalance < amount) {
    return { success: false, error: "Insufficient balance" };
  }

  // Calculate expected return and dates
  const expectedReturn = amount + (amount * plan.roiPercentage / 100);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const now = new Date();

  // Create the investment
  const result = await collections.userInvestments().insertOne({
    userId: toObjectId(session.userId),
    planId: toObjectId(planId),
    investedAmount: amount,
    expectedReturn,
    profitCredited: 0,
    startDate,
    endDate,
    status: "ACTIVE",
    capitalReclaimed: false,
    createdAt: now,
    updatedAt: now,
  });

  // Deduct from user balance and update activeInvestment
  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    { 
      $inc: { 
        [balanceField]: -amount,
        activeInvestment: amount,
      },
      $set: { updatedAt: now },
    }
  );

  return { 
    success: true, 
    investmentId: result.insertedId.toString(),
  };
}

// Get plan details with user's subscription status
export interface PlanWithStatus extends AvailablePlan {
  isSubscribed: boolean;
}

export async function getPlansWithSubscriptionStatus(): Promise<PlanWithStatus[]> {
  const session = await getUserSession();
  
  const plans = await collections.investmentPlans()
    .find({ isActive: true })
    .sort({ minAmount: 1 })
    .toArray() as InvestmentPlan[];

  if (!session) {
    return plans.map(plan => ({
      id: plan._id.toString(),
      name: plan.name,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      roiPercentage: plan.roiPercentage,
      durationDays: plan.durationDays,
      isSubscribed: false,
    }));
  }

  // Get user's active subscriptions
  const activeInvestments = await collections.userInvestments()
    .find({ 
      userId: toObjectId(session.userId),
      status: "ACTIVE",
    })
    .toArray() as UserInvestment[];

  const subscribedPlanIds = new Set(activeInvestments.map(inv => inv.planId.toString()));

  return plans.map(plan => ({
    id: plan._id.toString(),
    name: plan.name,
    minAmount: plan.minAmount,
    maxAmount: plan.maxAmount,
    roiPercentage: plan.roiPercentage,
    durationDays: plan.durationDays,
    isSubscribed: subscribedPlanIds.has(plan._id.toString()),
  }));
}

// ==================== ADMIN ACTIONS ====================

// Admin: Get user's investments with plan details
export interface AdminUserInvestment {
  id: string;
  planId: string;
  planName: string;
  investedAmount: number;
  expectedReturn: number;
  profitCredited: number;
  dailyProfit: number; // Ideal daily profit based on ROI
  roiPercentage: number;
  durationDays: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  daysElapsed: number;
  daysRemaining: number;
  capitalReclaimed: boolean;
}

export async function getAdminUserInvestments(userId: string): Promise<AdminUserInvestment[]> {
  await requireAdmin();

  const investments = await collections.userInvestments()
    .find({ userId: toObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray() as UserInvestment[];

  if (investments.length === 0) return [];

  // Get all unique plan IDs
  const planIds = [...new Set(investments.map(inv => inv.planId.toString()))];
  
  // Fetch all plans in one query
  const plans = await collections.investmentPlans()
    .find({ _id: { $in: planIds.map(id => toObjectId(id)) } })
    .toArray() as InvestmentPlan[];
  
  const planMap = new Map(plans.map(p => [p._id.toString(), p]));

  const now = new Date();

  return investments.map(inv => {
    const plan = planMap.get(inv.planId.toString());
    const startDate = new Date(inv.startDate);
    const endDate = new Date(inv.endDate);
    
    const totalDays = plan?.durationDays || Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate ideal daily profit
    const totalProfit = inv.expectedReturn - inv.investedAmount;
    const dailyProfit = totalDays > 0 ? totalProfit / totalDays : 0;

    return {
      id: inv._id.toString(),
      planId: inv.planId.toString(),
      planName: plan?.name || "Unknown Plan",
      investedAmount: inv.investedAmount,
      expectedReturn: inv.expectedReturn,
      profitCredited: inv.profitCredited || 0,
      dailyProfit,
      roiPercentage: plan?.roiPercentage || 0,
      durationDays: totalDays,
      startDate: inv.startDate,
      endDate: inv.endDate,
      status: inv.status,
      daysElapsed,
      daysRemaining,
      capitalReclaimed: inv.capitalReclaimed || false,
    };
  });
}

// Admin: Credit profit to user's investment
export interface CreditProfitInput {
  investmentId: string;
  amount: number;
}

export interface CreditProfitResult {
  success: boolean;
  error?: string;
}

export async function creditInvestmentProfit(input: CreditProfitInput): Promise<CreditProfitResult> {
  const admin = await requireAdmin();

  const { investmentId, amount } = input;

  if (amount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  // Get the investment
  const investment = await collections.userInvestments().findOne({
    _id: toObjectId(investmentId),
  }) as UserInvestment | null;

  if (!investment) {
    return { success: false, error: "Investment not found" };
  }

  if (investment.status !== "ACTIVE") {
    return { success: false, error: "Can only credit profit to active investments" };
  }

  const now = new Date();

  // Update investment profit credited
  await collections.userInvestments().updateOne(
    { _id: toObjectId(investmentId) },
    {
      $inc: { profitCredited: amount },
      $set: { updatedAt: now },
    }
  );

  // Add profit to user's profit balance AND fiat balance
  await collections.users().updateOne(
    { _id: investment.userId },
    {
      $inc: { 
        profitBalance: amount,
        fiatBalance: amount,
      },
      $set: { updatedAt: now },
    }
  );

  // Create audit log
  await createAuditLog({
    adminId: admin.id,
    action: AuditActions.USER_UPDATED,
    entityType: "Investment",
    entityId: investmentId,
    details: {
      action: "credit_profit",
      userId: investment.userId.toString(),
      amount,
      investmentId,
    },
  });

  // Send email notification
  const user = await collections.users().findOne({ _id: investment.userId }) as User | null;
  if (user) {
    try {
      await sendProfitCreditedEmail(user.email, {
        fullName: user.fullName,
        amount,
        currency: user.currency || "USD",
        description: "Investment profit",
      });
    } catch (emailError) {
      console.error("Failed to send profit email:", emailError);
    }
  }

  revalidatePath(`/admin/users/${investment.userId.toString()}`);
  
  return { success: true };
}

// ==================== USER ACTIONS ====================

// User: Reclaim investment capital after plan ends
export interface ReclaimCapitalResult {
  success: boolean;
  error?: string;
  amount?: number;
}

export async function reclaimInvestmentCapital(investmentId: string): Promise<ReclaimCapitalResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  // Get the investment
  const investment = await collections.userInvestments().findOne({
    _id: toObjectId(investmentId),
    userId: toObjectId(session.userId),
  }) as UserInvestment | null;

  if (!investment) {
    return { success: false, error: "Investment not found" };
  }

  if (investment.status !== "ACTIVE") {
    return { success: false, error: "Investment is not active" };
  }

  if (investment.capitalReclaimed) {
    return { success: false, error: "Capital has already been reclaimed" };
  }

  // Check if plan has ended
  const now = new Date();
  const endDate = new Date(investment.endDate);
  
  if (now < endDate) {
    return { success: false, error: "Plan duration has not ended yet" };
  }

  // Return capital to user's fiat balance
  await collections.users().updateOne(
    { _id: toObjectId(session.userId) },
    {
      $inc: { 
        fiatBalance: investment.investedAmount,
        activeInvestment: -investment.investedAmount,
      },
      $set: { updatedAt: now },
    }
  );

  // Mark investment as capital reclaimed and completed
  await collections.userInvestments().updateOne(
    { _id: toObjectId(investmentId) },
    {
      $set: { 
        capitalReclaimed: true,
        status: "COMPLETED",
        updatedAt: now,
      },
    }
  );

  revalidatePath("/dashboard/investments");
  
  return { 
    success: true, 
    amount: investment.investedAmount,
  };
}
