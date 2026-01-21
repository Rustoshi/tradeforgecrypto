"use client";

import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Withdrawal {
  id: string;
  amount: number;
  asset: string;
  status: string;
  reference: string;
  description?: string;
  createdAt: Date;
  approvedAt?: Date;
}

interface WithdrawHistoryProps {
  withdrawals: Withdrawal[];
  userCurrency: string;
}

export function WithdrawHistory({ withdrawals, userCurrency }: WithdrawHistoryProps) {
  const formatAmount = (amount: number, asset: string) => {
    if (asset === "BTC") {
      return `${amount.toFixed(8)} BTC`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userCurrency,
    }).format(amount);
  };

  if (withdrawals.length === 0) {
    return null;
  }

  return (
    <Card className="border-border bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">Recent Withdrawals</CardTitle>
        <CardDescription>Your withdrawal history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-mono text-sm">
                    {withdrawal.reference}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatAmount(withdrawal.amount, withdrawal.asset)}
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {withdrawal.description || "Withdrawal"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={withdrawal.status.toLowerCase()} />
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
