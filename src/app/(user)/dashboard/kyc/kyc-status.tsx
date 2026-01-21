"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { type UserKYCStatus } from "@/lib/actions/kyc";

interface KYCStatusProps {
  kycStatus: UserKYCStatus;
  onResubmit?: () => void;
}

export function KYCStatusDisplay({ kycStatus, onResubmit }: KYCStatusProps) {
  if (!kycStatus.hasSubmitted) {
    return null;
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      title: "Verification In Progress",
      description: "Your documents are being reviewed. This usually takes 1-2 business days.",
      bgColor: "bg-warning/10",
      iconColor: "text-warning",
      borderColor: "border-warning/20",
    },
    APPROVED: {
      icon: CheckCircle2,
      title: "Verification Complete",
      description: "Your identity has been verified. You now have full access to all features.",
      bgColor: "bg-success/10",
      iconColor: "text-success",
      borderColor: "border-success/20",
    },
    DECLINED: {
      icon: XCircle,
      title: "Verification Declined",
      description: kycStatus.rejectionReason || "Your verification was not successful. Please submit new documents.",
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive",
      borderColor: "border-destructive/20",
    },
  };

  const config = statusConfig[kycStatus.status!];
  const Icon = config.icon;

  return (
    <Card className={`border ${config.borderColor} ${config.bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">
              {config.title}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {config.description}
            </p>
            
            {/* Additional Info */}
            <div className="mt-4 space-y-2 text-sm">
              {kycStatus.documentType && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Document Type</span>
                  <span className="text-text-primary">{kycStatus.documentType.replace("_", " ")}</span>
                </div>
              )}
              {kycStatus.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Submitted</span>
                  <span className="text-text-primary">
                    {format(new Date(kycStatus.submittedAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              )}
              {kycStatus.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Reviewed</span>
                  <span className="text-text-primary">
                    {format(new Date(kycStatus.reviewedAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>

            {/* Resubmit Button for Declined */}
            {kycStatus.status === "DECLINED" && onResubmit && (
              <Button onClick={onResubmit} className="mt-4">
                Submit New Documents
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Benefits card for approved KYC
export function KYCBenefits() {
  const benefits = [
    { icon: Shield, title: "Higher Limits", description: "Increased deposit and withdrawal limits" },
    { icon: CheckCircle2, title: "Full Access", description: "Access to all platform features" },
    { icon: AlertTriangle, title: "Priority Support", description: "Faster response from our team" },
  ];

  return (
    <Card className="border-border bg-surface">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Your Verified Benefits</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{benefit.title}</p>
                  <p className="text-sm text-text-muted">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
