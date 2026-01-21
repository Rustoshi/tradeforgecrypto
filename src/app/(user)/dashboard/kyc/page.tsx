import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserKYCStatus } from "@/lib/actions/kyc";
import { KYCForm } from "./kyc-form";
import { KYCStatusDisplay, KYCBenefits } from "./kyc-status";

export const metadata: Metadata = {
  title: "KYC Verification | Dashboard",
  description: "Complete your identity verification",
};

export default async function KYCPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const kycStatus = await getUserKYCStatus();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          KYC Verification
        </h1>
        <p className="mt-1 text-text-secondary">
          Complete identity verification to unlock all features
        </p>
      </div>

      {/* Show status if submitted */}
      {kycStatus.hasSubmitted && (
        <KYCStatusDisplay kycStatus={kycStatus} />
      )}

      {/* Show benefits if approved */}
      {kycStatus.status === "APPROVED" && (
        <KYCBenefits />
      )}

      {/* Show form if not submitted or declined */}
      {(!kycStatus.hasSubmitted || kycStatus.status === "DECLINED") && (
        <>
          <KYCForm kycStatus={kycStatus} />

          {/* Info Box */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-text-primary">Why is KYC required?</p>
                <p className="mt-1 text-text-secondary">
                  KYC verification helps us comply with regulations and protect your account from unauthorized access. 
                  It also unlocks higher deposit and withdrawal limits.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Show pending message */}
      {kycStatus.status === "PENDING" && (
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-text-primary">Application Under Review</p>
              <p className="mt-1 text-text-secondary">
                Your documents are being reviewed by our team. You will receive an email notification once the review is complete.
                This process typically takes 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
