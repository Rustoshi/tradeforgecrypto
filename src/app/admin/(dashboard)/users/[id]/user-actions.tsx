"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Ban,
  CheckCircle,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
} from "lucide-react";
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
import { performUserAction, deleteUser } from "@/lib/actions/users";

interface UserActionsProps {
  user: {
    id: string;
    fullName: string;
    isSuspended: boolean;
    isBlocked: boolean;
  };
}

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function handleAction(action: "suspend" | "unsuspend" | "block" | "unblock" | "resetPin") {
    setIsLoading(true);
    try {
      const result = await performUserAction({ userId: user.id, action });
      
      if (action === "resetPin" && result.newPin) {
        toast.success(`PIN reset successfully. New PIN: ${result.newPin}`, {
          duration: 10000, // Show for 10 seconds so admin can copy it
        });
      } else {
        toast.success(`User ${action}ed successfully`);
      }
      
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
      await deleteUser(user.id);
      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            <MoreHorizontal className="mr-2 h-4 w-4" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {user.isSuspended ? (
            <DropdownMenuItem onClick={() => handleAction("unsuspend")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Unsuspend
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleAction("suspend")}>
              <Ban className="mr-2 h-4 w-4" />
              Suspend
            </DropdownMenuItem>
          )}
          {user.isBlocked ? (
            <DropdownMenuItem onClick={() => handleAction("unblock")}>
              <Unlock className="mr-2 h-4 w-4" />
              Unblock
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleAction("block")}>
              <Lock className="mr-2 h-4 w-4" />
              Block
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleAction("resetPin")}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset PIN
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-error focus:text-error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {user.fullName}? This action cannot be
              undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error text-white hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
