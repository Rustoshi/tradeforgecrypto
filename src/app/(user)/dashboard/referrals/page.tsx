import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/user-auth";
import { getReferralStats, getReferredUsers } from "@/lib/actions/referrals";
import { ReferralContent } from "./referral-content";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function ReferralData() {
  const [stats, referredUsers] = await Promise.all([
    getReferralStats(),
    getReferredUsers(),
  ]);

  return <ReferralContent stats={stats} referredUsers={referredUsers} />;
}

function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ReferralsPage() {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Referrals</h1>
        <p className="text-text-muted">
          Share your referral code and earn rewards when friends join
        </p>
      </div>

      <Suspense fallback={<ReferralSkeleton />}>
        <ReferralData />
      </Suspense>
    </div>
  );
}
