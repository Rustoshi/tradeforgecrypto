import { NextRequest, NextResponse } from "next/server";
import { getUserTransactions } from "@/lib/actions/transactions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as "DEPOSIT" | "WITHDRAWAL" | "PROFIT" | "BONUS" | "ALL" | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getUserTransactions({
      type: type || "ALL",
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
