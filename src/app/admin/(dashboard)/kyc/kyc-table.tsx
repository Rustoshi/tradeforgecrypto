"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

interface KYCSubmission {
  id: string;
  documentType: string;
  status: string;
  submittedAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
    country?: string;
  } | null;
}

interface KYCTableProps {
  submissions: KYCSubmission[];
}

export function KYCTable({ submissions }: KYCTableProps) {
  const columns = [
    {
      key: "user",
      header: "User",
      cell: (kyc: KYCSubmission) => (
        <div>
          <Link
            href={`/admin/users/${kyc.user?.id}`}
            className="font-medium text-text-primary hover:text-primary"
          >
            {kyc.user?.fullName}
          </Link>
          <p className="text-xs text-text-muted">{kyc.user?.email}</p>
        </div>
      ),
    },
    {
      key: "country",
      header: "Country",
      cell: (kyc: KYCSubmission) => (
        <span className="text-text-secondary">{kyc.user?.country || "N/A"}</span>
      ),
    },
    {
      key: "documentType",
      header: "Document Type",
      cell: (kyc: KYCSubmission) => (
        <span className="text-text-secondary">{kyc.documentType.replace("_", " ")}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (kyc: KYCSubmission) => <StatusBadge status={kyc.status} />,
    },
    {
      key: "submitted",
      header: "Submitted",
      cell: (kyc: KYCSubmission) => (
        <span className="text-text-muted">
          {formatDistanceToNow(new Date(kyc.submittedAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (kyc: KYCSubmission) => (
        <Link href={`/admin/kyc/${kyc.id}`}>
          <Button variant="ghost" size="sm">
            Review
          </Button>
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <DataTable columns={columns} data={submissions} emptyMessage="No KYC submissions found" />
  );
}
