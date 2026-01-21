"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reviewKYC } from "@/lib/actions/kyc";

interface KYCReviewActionsProps {
  kycId: string;
}

export function KYCReviewActions({ kycId }: KYCReviewActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleApprove() {
    setIsLoading(true);
    try {
      await reviewKYC({ kycId, status: "APPROVED" });
      toast.success("KYC approved successfully");
      router.push("/admin/kyc");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve KYC");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDecline() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsLoading(true);
    try {
      await reviewKYC({ kycId, status: "DECLINED", rejectionReason });
      toast.success("KYC declined");
      setDeclineDialogOpen(false);
      router.push("/admin/kyc");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decline KYC");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="bg-success text-white hover:bg-success/90"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Approve
      </Button>

      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-error text-error hover:bg-error/10">
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for declining this KYC submission..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                disabled={isLoading}
                className="bg-error text-white hover:bg-error/90"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
