import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { checkWithdrawalEligibility, getUserWithdrawals } from "@/lib/actions/withdrawal";
import { getBtcPrice } from "@/lib/actions/crypto";
import { WithdrawForm } from "./withdraw-form";
import { WithdrawHistory } from "./withdraw-history";

export const metadata: Metadata = {
  title: "Withdraw | Dashboard",
  description: "Withdraw funds from your account",
};

export default async function WithdrawPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [eligibility, withdrawals, btcPrice] = await Promise.all([
    checkWithdrawalEligibility(),
    getUserWithdrawals(),
    getBtcPrice(user.currency || "USD"),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Withdraw Funds</h1>
        <p className="mt-1 text-text-secondary">
          Withdraw your funds to your preferred payment method
        </p>
      </div>

      {/* Withdrawal Form */}
      <WithdrawForm 
        eligibility={eligibility} 
        userCurrency={user.currency || "USD"}
        btcPrice={btcPrice}
      />

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <WithdrawHistory 
          withdrawals={withdrawals} 
          userCurrency={user.currency || "USD"} 
        />
      )}
    </div>
  );
}
