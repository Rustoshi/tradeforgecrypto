"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";

interface User {
  id: string;
  fullName?: string;
  email?: string;
  fiatBalance?: number;
  bitcoinBalance?: number;
  isSuspended?: boolean;
  isBlocked?: boolean;
  createdAt?: Date;
  currentPlanId?: string | null;
  currentPlan?: { id: string; name: string; roiPercentage: number } | null;
  kyc?: { id?: string; status: string } | null;
  _count?: { transactions: number; investments: number };
}

interface UsersTableProps {
  users: User[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function UsersTable({ users }: UsersTableProps) {
  const columns = [
    {
      key: "user",
      header: "User",
      cell: (user: User) => (
        <div>
          <Link
            href={`/admin/users/${user.id}`}
            className="font-medium text-text-primary hover:text-primary"
          >
            {user.fullName}
          </Link>
          <p className="text-xs text-text-muted">{user.email}</p>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Fiat Balance",
      cell: (user: User) => (
        <span className="font-medium text-text-primary">
          {formatCurrency(user.fiatBalance || 0)}
        </span>
      ),
    },
    {
      key: "btc",
      header: "BTC Balance",
      cell: (user: User) => (
        <span className="text-text-secondary">
          {(user.bitcoinBalance || 0).toFixed(8)} BTC
        </span>
      ),
    },
    {
      key: "kyc",
      header: "KYC",
      cell: (user: User) => (
        <StatusBadge status={user.kyc?.status || "pending"} />
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user: User) => {
        if (user.isBlocked) return <StatusBadge status="blocked" />;
        if (user.isSuspended) return <StatusBadge status="suspended" />;
        return <StatusBadge status="active" />;
      },
    },
    {
      key: "joined",
      header: "Joined",
      cell: (user: User) => (
        <span className="text-text-muted">
          {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (user: User) => (
        <Link href={`/admin/users/${user.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      ),
      className: "text-right",
    },
  ];

  return <DataTable columns={columns} data={users} emptyMessage="No users found" />;
}
