import { Suspense } from "react";
import Link from "next/link";
import { getKYCSubmissions } from "@/lib/actions/kyc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { KYCTable } from "./kyc-table";

interface KYCContentProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

async function KYCContent({ searchParams }: KYCContentProps) {
  const params = await searchParams;
  const { submissions, pagination } = await getKYCSubmissions({
    status: params.status as "PENDING" | "APPROVED" | "DECLINED" | undefined,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text-primary">KYC Submissions</CardTitle>
        <div className="flex gap-2">
          <Link href="/admin/kyc?status=PENDING">
            <Button variant={params.status === "PENDING" ? "default" : "outline"} size="sm">
              Pending
            </Button>
          </Link>
          <Link href="/admin/kyc">
            <Button variant={!params.status ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <KYCTable submissions={submissions} />

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} submissions
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link href={`/admin/kyc?page=${pagination.page - 1}`}>
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link href={`/admin/kyc?page=${pagination.page + 1}`}>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KYCSkeleton() {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function KYCPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">KYC Review</h1>
        <p className="text-text-muted">Review and approve user identity verification</p>
      </div>

      <Suspense fallback={<KYCSkeleton />}>
        <KYCContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
