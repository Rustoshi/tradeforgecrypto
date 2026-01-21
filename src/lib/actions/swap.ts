"use server";

import { revalidatePath } from "next/cache";
import { collections, toObjectId, type Trade } from "@/lib/db";
import { getUserSession } from "@/lib/user-auth";
import { getBtcPrice } from "@/lib/actions/crypto";

// Swap input
export interface SwapInput {
  fromAsset: "FIAT" | "BTC";
  fromAmount: number;
}

// Swap result
export interface SwapResult {
  success: boolean;
  error?: string;
  trade?: {
    id: string;
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    rate: number;
  };
}

// Execute swap between BTC and Fiat
export async function executeSwap(input: SwapInput): Promise<SwapResult> {
  const session = await getUserSession();
  
  if (!session) {
    return { success: false, error: "User not authenticated" };
  }

  const { fromAsset, fromAmount } = input;

  if (fromAmount <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  // Get user
  const user = await collections.users().findOne({ _id: toObjectId(session.userId) });
  
  if (!user) {
    return { success: false, error: "User not found" };
  }

  const userCurrency = user.currency || "USD";
  const toAsset = fromAsset === "FIAT" ? "BTC" : "FIAT";

  // Get current BTC price
  const btcPrice = await getBtcPrice(userCurrency);
  
  if (btcPrice <= 0) {
    return { success: false, error: "Unable to fetch current BTC price. Please try again." };
  }

  // Calculate conversion
  let toAmount: number;
  let fromBalance: number;
  
  if (fromAsset === "FIAT") {
    // Buying BTC with fiat
    fromBalance = user.fiatBalance || 0;
    toAmount = fromAmount / btcPrice;
  } else {
    // Selling BTC for fiat
    fromBalance = user.bitcoinBalance || 0;
    toAmount = fromAmount * btcPrice;
  }

  // Check sufficient balance
  if (fromBalance < fromAmount) {
    return { 
      success: false, 
      error: `Insufficient ${fromAsset === "FIAT" ? userCurrency : "BTC"} balance` 
    };
  }

  const now = new Date();
  const tradeType = fromAsset === "FIAT" ? "BUY" : "SELL";

  // Create trade record
  const tradeResult = await collections.trades().insertOne({
    userId: toObjectId(session.userId),
    type: tradeType,
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    rate: btcPrice,
    userCurrency,
    createdAt: now,
  });

  // Update user balances
  if (fromAsset === "FIAT") {
    // Buying BTC: deduct fiat, add BTC
    await collections.users().updateOne(
      { _id: toObjectId(session.userId) },
      {
        $inc: {
          fiatBalance: -fromAmount,
          bitcoinBalance: toAmount,
        },
        $set: { updatedAt: now },
      }
    );
  } else {
    // Selling BTC: deduct BTC, add fiat
    await collections.users().updateOne(
      { _id: toObjectId(session.userId) },
      {
        $inc: {
          bitcoinBalance: -fromAmount,
          fiatBalance: toAmount,
        },
        $set: { updatedAt: now },
      }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/swap");
  revalidatePath("/dashboard/wallets");

  return {
    success: true,
    trade: {
      id: tradeResult.insertedId.toString(),
      fromAsset,
      toAsset,
      fromAmount,
      toAmount,
      rate: btcPrice,
    },
  };
}

// Get user's trade history
export interface UserTrade {
  id: string;
  type: "BUY" | "SELL";
  fromAsset: "FIAT" | "BTC";
  toAsset: "FIAT" | "BTC";
  fromAmount: number;
  toAmount: number;
  rate: number;
  userCurrency: string;
  createdAt: Date;
}

export async function getUserTrades(limit: number = 10): Promise<UserTrade[]> {
  const session = await getUserSession();
  
  if (!session) {
    return [];
  }

  const trades = await collections.trades()
    .find({ userId: toObjectId(session.userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Trade[];

  return trades.map(trade => ({
    id: trade._id.toString(),
    type: trade.type,
    fromAsset: trade.fromAsset,
    toAsset: trade.toAsset,
    fromAmount: trade.fromAmount,
    toAmount: trade.toAmount,
    rate: trade.rate,
    userCurrency: trade.userCurrency,
    createdAt: trade.createdAt,
  }));
}

// Get paginated user trades
export interface PaginatedTradesResult {
  trades: UserTrade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getUserTradesPaginated(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTradesResult> {
  const session = await getUserSession();
  
  if (!session) {
    return {
      trades: [],
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
    };
  }

  const skip = (page - 1) * limit;
  const filter = { userId: toObjectId(session.userId) };

  const [trades, total] = await Promise.all([
    collections.trades()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray() as Promise<Trade[]>,
    collections.trades().countDocuments(filter),
  ]);

  return {
    trades: trades.map(trade => ({
      id: trade._id.toString(),
      type: trade.type,
      fromAsset: trade.fromAsset,
      toAsset: trade.toAsset,
      fromAmount: trade.fromAmount,
      toAmount: trade.toAmount,
      rate: trade.rate,
      userCurrency: trade.userCurrency,
      createdAt: trade.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get swap quote (preview without executing)
export interface SwapQuote {
  fromAsset: "FIAT" | "BTC";
  toAsset: "FIAT" | "BTC";
  fromAmount: number;
  toAmount: number;
  rate: number;
  userCurrency: string;
}

export async function getSwapQuote(
  fromAsset: "FIAT" | "BTC",
  fromAmount: number,
  userCurrency: string
): Promise<SwapQuote | null> {
  if (fromAmount <= 0) return null;

  const btcPrice = await getBtcPrice(userCurrency);
  
  if (btcPrice <= 0) return null;

  const toAsset = fromAsset === "FIAT" ? "BTC" : "FIAT";
  const toAmount = fromAsset === "FIAT" 
    ? fromAmount / btcPrice 
    : fromAmount * btcPrice;

  return {
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    rate: btcPrice,
    userCurrency,
  };
}
