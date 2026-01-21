"use client";

import { useState } from "react";
import { Copy, Check, Users, Share2, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { ReferralStats, ReferredUser } from "@/lib/actions/referrals";

interface ReferralContentProps {
  stats: ReferralStats;
  referredUsers: ReferredUser[];
}

export function ReferralContent({ stats, referredUsers }: ReferralContentProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/register?ref=${stats.referralCode}`
    : `/register?ref=${stats.referralCode}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on this platform!",
          text: "Sign up using my referral link",
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border-default bg-surface">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.totalReferrals}</p>
                <p className="text-sm text-text-muted">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-surface">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Gift className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stats.referralCode}</p>
                <p className="text-sm text-text-muted">Your Referral Code</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">Share Your Referral</CardTitle>
          <CardDescription>
            Invite friends to join using your unique referral code or link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={stats.referralCode}
                readOnly
                className="font-mono text-lg font-bold tracking-wider bg-surface-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyCode}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm bg-surface-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                className="shrink-0"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={shareLink}
                className="shrink-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referred Users */}
      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">Your Referrals</CardTitle>
          <CardDescription>
            Users who signed up using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted">No referrals yet</p>
              <p className="text-sm text-text-muted mt-1">
                Share your referral code to start earning rewards
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-muted"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-text-muted shrink-0 ml-2">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
