"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

interface ForgotPasswordFormProps {
  siteName: string;
}

export function ForgotPasswordForm({ }: ForgotPasswordFormProps) {
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "loading", message: "" });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      setFormState({
        status: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormState({
        status: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setFormState({
        status: "success",
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {formState.status === "success" ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
                Check your email
              </h1>
              <p className="mt-2 text-text-secondary">
                {formState.message}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
                Reset your password
              </h1>
              <p className="mt-2 text-text-secondary">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </>
          )}
        </div>

        {formState.status === "success" ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div className="text-sm text-text-secondary">
                  <p>
                    We&apos;ve sent a password reset link to your email address. 
                    The link will expire in 1 hour.
                  </p>
                  <p className="mt-2">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setFormState({ status: "idle", message: "" })}
                      className="text-primary hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
            
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formState.status === "error" && (
              <div className="flex items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formState.message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={formState.status === "loading"}
            >
              {formState.status === "loading" ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
