import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getActivePaymentMethods } from "@/lib/actions/public";
import { getUserDeposits } from "@/lib/actions/deposit";
import { DepositFormNew } from "./deposit-form-new";
import { DepositHistory } from "./deposit-history";

export const metadata: Metadata = {
  title: "Deposit | Dashboard",
  description: "Fund your account",
};

export default async function DepositPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [paymentMethods, deposits] = await Promise.all([
    getActivePaymentMethods(),
    getUserDeposits(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Deposit Funds</h1>
        <p className="mt-1 text-text-secondary">
          Fund your account using your preferred payment method
        </p>
      </div>

      {/* Deposit Form */}
      <DepositFormNew 
        paymentMethods={paymentMethods} 
        userCurrency={user.currency || "USD"} 
      />

      {/* Deposit History */}
      {deposits.length > 0 && (
        <DepositHistory 
          deposits={deposits} 
          userCurrency={user.currency || "USD"} 
        />
      )}
    </div>
  );
}
