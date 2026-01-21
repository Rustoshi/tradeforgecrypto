import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getKYCById } from "@/lib/actions/kyc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import { format } from "date-fns";
import { KYCReviewActions } from "./kyc-review-actions";

export default async function KYCDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kyc = await getKYCById(id);

  if (!kyc) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/kyc">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">KYC Review</h1>
            <p className="text-text-muted">{kyc.user?.fullName} - {kyc.user?.email}</p>
          </div>
        </div>
        {kyc.status === "PENDING" && <KYCReviewActions kycId={kyc.id} />}
      </div>

      <div className="flex gap-2">
        <StatusBadge status={kyc.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Full Name</span>
              <span className="text-text-primary">{kyc.user?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Email</span>
              <span className="text-text-primary">{kyc.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Country</span>
              <span className="text-text-primary">{kyc.user?.country || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Phone</span>
              <span className="text-text-primary">{kyc.user?.phone || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-muted">Document Type</span>
              <span className="text-text-primary">{kyc.documentType.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Submitted</span>
              <span className="text-text-primary">
                {format(kyc.submittedAt, "MMM d, yyyy HH:mm")}
              </span>
            </div>
            {kyc.reviewedAt && (
              <div className="flex justify-between">
                <span className="text-text-muted">Reviewed</span>
                <span className="text-text-primary">
                  {format(kyc.reviewedAt, "MMM d, yyyy HH:mm")}
                </span>
              </div>
            )}
            {kyc.rejectionReason && (
              <div className="rounded-md bg-error/10 p-3">
                <p className="text-sm text-error">
                  <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">Document Front</p>
              <a href={kyc.documentFrontUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={kyc.documentFrontUrl}
                  alt="Document Front"
                  className="rounded-md border border-border-default transition-opacity hover:opacity-80"
                />
              </a>
            </div>
            {kyc.documentBackUrl && (
              <div>
                <p className="mb-2 text-sm font-medium text-text-secondary">Document Back</p>
                <a href={kyc.documentBackUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={kyc.documentBackUrl}
                    alt="Document Back"
                    className="rounded-md border border-border-default transition-opacity hover:opacity-80"
                  />
                </a>
              </div>
            )}
            <div>
              <p className="mb-2 text-sm font-medium text-text-secondary">Selfie</p>
              <a href={kyc.selfieUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={kyc.selfieUrl}
                  alt="Selfie"
                  className="rounded-md border border-border-default transition-opacity hover:opacity-80"
                />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
