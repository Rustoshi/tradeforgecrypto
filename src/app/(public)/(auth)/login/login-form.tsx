"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormState {
  status: "idle" | "loading" | "error";
  message: string;
}

interface LoginFormProps {
  siteName: string;
}

export function LoginForm({ }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "loading", message: "" });

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setFormState({
        status: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      router.push("/dashboard");
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-text-secondary">
              Sign in to access your investment dashboard
            </p>
          </div>

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={formState.status === "loading"}
            >
              {formState.status === "loading" ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-surface-muted items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="font-heading text-4xl font-bold text-success">$847M+</p>
            <p className="mt-2 text-text-secondary">Total payouts to investors</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="font-heading text-2xl font-bold text-text-primary">50K+</p>
              <p className="text-sm text-text-muted">Active Investors</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="font-heading text-2xl font-bold text-text-primary">99.9%</p>
              <p className="text-sm text-text-muted">Uptime</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-text-muted">
            Trusted by investors in 45+ countries worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
