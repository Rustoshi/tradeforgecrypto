"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ImageIcon, X } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { TransactionActions } from "./transaction-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

interface Transaction {
  id: string;
  type: string;
  asset: string;
  amount: number;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  walletNetwork?: string;
  depositProofUrl?: string;
  status: string;
  reference?: string;
  description?: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdByAdmin?: {
    id: string;
    name: string;
  } | null;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

// Proof Image Viewer Component
function ProofViewer({ url, transaction }: { url: string; transaction: Transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-primary hover:text-primary-hover"
        onClick={() => setIsOpen(true)}
      >
        <ImageIcon className="h-4 w-4 mr-1" />
        View
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Proof - {transaction.reference}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
              {transaction.cryptoAmount && (
                <div>
                  <span className="text-text-muted">Crypto:</span>
                  <span className="ml-2 font-medium">
                    {transaction.cryptoAmount.toFixed(8)} {transaction.cryptoCurrency}
                  </span>
                </div>
              )}
              {transaction.walletNetwork && (
                <div>
                  <span className="text-text-muted">Network:</span>
                  <span className="ml-2 font-medium">{transaction.walletNetwork}</span>
                </div>
              )}
              <div>
                <span className="text-text-muted">User:</span>
                <span className="ml-2 font-medium">{transaction.user?.fullName || "Unknown"}</span>
              </div>
            </div>

            {/* Proof Image */}
            <div className="relative rounded-lg overflow-hidden border border-border bg-surface-muted">
              <img
                src={url}
                alt="Deposit proof"
                className="w-full max-h-[500px] object-contain"
              />
            </div>

            {/* Open in new tab */}
            <div className="flex justify-end">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open full image in new tab
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const columns = [
    {
      key: "user",
      header: "User",
      cell: (tx: Transaction) => (
        <div>
          {tx.user ? (
            <>
              <Link
                href={`/admin/users/${tx.user.id}`}
                className="font-medium text-text-primary hover:text-primary"
              >
                {tx.user.fullName}
              </Link>
              <p className="text-xs text-text-muted">{tx.user.email}</p>
            </>
          ) : (
            <span className="text-text-muted">Unknown</span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (tx: Transaction) => (
        <span className="font-medium text-text-primary">{tx.type}</span>
      ),
    },
    {
      key: "asset",
      header: "Asset",
      cell: (tx: Transaction) => (
        <span className="text-text-secondary">{tx.asset}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (tx: Transaction) => (
        <span className="font-medium text-text-primary">
          {tx.asset === "BTC"
            ? `${tx.amount.toFixed(8)} BTC`
            : formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (tx: Transaction) => <StatusBadge status={tx.status} />,
    },
    {
      key: "proof",
      header: "Proof",
      cell: (tx: Transaction) => (
        tx.type === "DEPOSIT" && tx.depositProofUrl ? (
          <ProofViewer url={tx.depositProofUrl} transaction={tx} />
        ) : (
          <span className="text-text-muted text-sm">—</span>
        )
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (tx: Transaction) => (
        <span className="text-text-muted">
          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (tx: Transaction) => <TransactionActions transaction={tx} />,
      className: "text-right",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      emptyMessage="No transactions found"
    />
  );
}
