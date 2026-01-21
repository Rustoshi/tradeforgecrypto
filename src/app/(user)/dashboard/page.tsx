import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getBtcPriceData } from "@/lib/actions/crypto";
import { getUserRecentTransactions } from "@/lib/actions/transactions";

export const metadata: Metadata = {
  title: "Dashboard | Portfolio Overview",
  description: "View your investment portfolio and account summary",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch BTC price data and recent transactions in parallel
  const [btcPriceData, recentTransactions] = await Promise.all([
    getBtcPriceData(user.currency),
    getUserRecentTransactions(5),
  ]);

  return (
    <DashboardContent 
      user={user} 
      btcPriceData={btcPriceData} 
      recentTransactions={recentTransactions}
    />
  );
}
