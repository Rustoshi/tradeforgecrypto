"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateTransactionStatus, deleteTransaction } from "@/lib/actions/transactions";

interface TransactionActionsProps {
  transaction: {
    id: string;
    status: string;
  };
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isPending = transaction.status === "PENDING";

  async function handleStatusAction(status: "APPROVED" | "DECLINED") {
    setIsLoading(true);
    try {
      await updateTransactionStatus({
        transactionId: transaction.id,
        status,
      });
      toast.success(`Transaction ${status.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      await deleteTransaction(transaction.id);
      toast.success("Transaction deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isPending && (
            <>
              <DropdownMenuItem onClick={() => handleStatusAction("APPROVED")}>
                <Check className="mr-2 h-4 w-4 text-success" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusAction("DECLINED")}>
                <X className="mr-2 h-4 w-4 text-error" />
                Decline
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-error focus:text-error"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
              {transaction.status === "APPROVED" && (
                <span className="block mt-2 text-warning font-medium">
                  Warning: This will reverse the balance changes made by this transaction.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-error hover:bg-error/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
