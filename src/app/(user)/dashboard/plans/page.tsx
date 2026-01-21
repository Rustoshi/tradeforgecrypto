import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getPlansWithSubscriptionStatus } from "@/lib/actions/investments";
import { PlansContent } from "./plans-content";

export const metadata: Metadata = {
  title: "Investment Plans | Dashboard",
  description: "Browse and subscribe to investment plans",
};

export default async function PlansPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const plans = await getPlansWithSubscriptionStatus();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          Investment Plans
        </h1>
        <p className="mt-1 text-text-secondary">
          Choose a plan that fits your investment goals
        </p>
      </div>

      <PlansContent
        plans={plans}
        userCurrency={user.currency}
        fiatBalance={user.fiatBalance}
      />
    </div>
  );
}
