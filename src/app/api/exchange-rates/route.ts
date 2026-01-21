import { NextRequest, NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/services/coingecko";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currency = searchParams.get("currency") || "USD";

  try {
    const rates = await getExchangeRates(currency);
    
    return NextResponse.json({
      success: true,
      currency: currency.toUpperCase(),
      rates,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Exchange rates API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
