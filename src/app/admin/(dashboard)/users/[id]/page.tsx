import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserById } from "@/lib/actions/users";
import { getAdminUserInvestments } from "@/lib/actions/investments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { UserActions } from "./user-actions";
import { UserEditForm } from "./user-edit-form";
import { UserTransactions } from "./user-transactions";
import { UserInvestments } from "./user-investments";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, investments] = await Promise.all([
    getUserById(id),
    getAdminUserInvestments(id),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/users" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">{user.fullName}</h1>
            <p className="text-text-muted text-sm truncate">{user.email}</p>
          </div>
        </div>
        <UserActions user={user} />
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {user.isBlocked && <StatusBadge status="blocked" />}
        {user.isSuspended && !user.isBlocked && <StatusBadge status="suspended" />}
        {!user.isBlocked && !user.isSuspended && <StatusBadge status="active" />}
        <StatusBadge status={user.kyc?.status || "pending"} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-surface-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit User</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border-default bg-surface">
              <CardHeader>
                <CardTitle className="text-text-primary">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Full Name</span>
                  <span className="text-text-primary">{user.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email</span>
                  <span className="text-text-primary">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Phone</span>
                  <span className="text-text-primary">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Country</span>
                  <span className="text-text-primary">{user.country || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">City</span>
                  <span className="text-text-primary">{user.city || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Currency</span>
                  <span className="text-text-primary">{user.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Joined</span>
                  <span className="text-text-primary">
                    {format(user.createdAt, "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border-default bg-surface">
              <CardHeader>
                <CardTitle className="text-text-primary">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Fiat Balance</span>
                  <span className="font-medium text-text-primary">
                    {formatCurrency(user.fiatBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Bitcoin Balance</span>
                  <span className="font-medium text-text-primary">
                    {user.bitcoinBalance.toFixed(8)} BTC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Profit Balance</span>
                  <span className="font-medium text-success">
                    {formatCurrency(user.profitBalance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Deposited</span>
                  <span className="text-text-primary">
                    {formatCurrency(user.totalDeposited)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Withdrawn</span>
                  <span className="text-text-primary">
                    {formatCurrency(user.totalWithdrawn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Bonus</span>
                  <span className="text-text-primary">
                    {formatCurrency(user.totalBonus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Current Plan</span>
                  <span className="text-text-primary">
                    {user.currentPlan?.name || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Transaction PIN</span>
                  <span className="font-mono text-text-primary">
                    {user.transactionPIN || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Referral Code</span>
                  <span className="font-mono text-text-primary">
                    {user.referralCode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Referrals</span>
                  <span className="text-text-primary">
                    {user.referralCount || 0} users
                  </span>
                </div>
                {user.referredBy && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Referred By</span>
                    <span className="text-text-primary">
                      {user.referredBy.fullName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <UserEditForm user={user} />
        </TabsContent>

        <TabsContent value="transactions">
          <UserTransactions transactions={user.transactions} userId={user.id} />
        </TabsContent>

        <TabsContent value="investments">
          <UserInvestments 
            investments={investments} 
            userId={user.id} 
            userCurrency={user.currency}
          />
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="border-border-default bg-surface">
            <CardHeader>
              <CardTitle className="text-text-primary">KYC Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {!user.kyc ? (
                <p className="text-center text-text-muted">No KYC submission</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status</span>
                    <StatusBadge status={user.kyc.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Document Type</span>
                    <span className="text-text-primary">{user.kyc.documentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Submitted</span>
                    <span className="text-text-primary">
                      {formatDistanceToNow(user.kyc.submittedAt, { addSuffix: true })}
                    </span>
                  </div>
                  {user.kyc.rejectionReason && (
                    <div className="rounded-md bg-error/10 p-3">
                      <p className="text-sm text-error">
                        Rejection Reason: {user.kyc.rejectionReason}
                      </p>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-2 text-sm text-text-muted">Document Front</p>
                      <img
                        src={user.kyc.documentFrontUrl}
                        alt="Document Front"
                        className="rounded-md border border-border-default"
                      />
                    </div>
                    {user.kyc.documentBackUrl && (
                      <div>
                        <p className="mb-2 text-sm text-text-muted">Document Back</p>
                        <img
                          src={user.kyc.documentBackUrl}
                          alt="Document Back"
                          className="rounded-md border border-border-default"
                        />
                      </div>
                    )}
                    <div>
                      <p className="mb-2 text-sm text-text-muted">Selfie</p>
                      <img
                        src={user.kyc.selfieUrl}
                        alt="Selfie"
                        className="rounded-md border border-border-default"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
