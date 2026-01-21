"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, DollarSign, Bitcoin, ArrowDownToLine, ArrowUpFromLine, ArrowRight, TrendingDown, BarChart3, PlusCircle, Activity, ShieldCheck, ShieldAlert, Clock, ChevronRight, Lightbulb, Sparkles, Repeat, Crown, Users, Copy, Check } from "lucide-react";
import { AnimatedButton } from "./animated-button";
import type { UserData } from "@/lib/user-auth";
import type { BtcPriceData } from "@/lib/actions/crypto";
import type { UserTransaction } from "@/lib/actions/transactions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardContentProps {
  user: UserData;
  btcPriceData: BtcPriceData;
  recentTransactions: UserTransaction[];
}

// Format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format bitcoin
function formatBitcoin(amount: number): string {
  return `${amount.toFixed(8)} BTC`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

// Premium floating surface component with glass morphism
function Surface({ 
  children, 
  className, 
  delay = 0,
  variant = "default"
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
  variant?: "default" | "fiat" | "btc" | "profit" | "elevated";
}) {
  const variantStyles = {
    default: "glass-card",
    fiat: "fiat-card glass-card",
    btc: "btc-card glass-card",
    profit: "profit-card glass-card",
    elevated: "glass-card",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-2xl",
        "transition-all duration-300 ease-out",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// Premium icon container with glow
function IconBadge({ 
  icon: Icon, 
  variant 
}: { 
  icon: React.ElementType; 
  variant: "primary" | "success" | "warning" | "muted";
}) {
  const styles = {
    primary: "icon-container icon-container-primary text-primary",
    success: "icon-container icon-container-success text-success",
    warning: "icon-container icon-container-warning text-warning",
    muted: "bg-surface-muted/50 text-text-muted",
  };

  return (
    <div className={cn(
      "h-7 w-7 rounded-lg",
      "transition-all duration-300 group-hover:scale-105",
      styles[variant]
    )}>
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

// Simple sparkline component
function Sparkline({ positive = true }: { positive?: boolean }) {
  // Generate a simple SVG sparkline pattern
  const points = positive 
    ? "0,20 10,18 20,15 30,16 40,12 50,14 60,10 70,8 80,6 90,4 100,2"
    : "0,2 10,4 20,6 30,5 40,8 50,7 60,10 70,12 80,14 90,16 100,18";
  
  return (
    <svg 
      viewBox="0 0 100 22" 
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={positive ? "sparkGreen" : "sparkRed"} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon 
        points={`${points} 100,22 0,22`}
        fill={`url(#${positive ? "sparkGreen" : "sparkRed"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Section Divider Component
function SectionDivider() {
  return <div className="section-divider my-1" />;
}

// Portfolio Allocation Bar Component
function PortfolioAllocation({ 
  fiat, 
  btc, 
  profit,
  invested,
}: { 
  fiat: number; 
  btc: number; 
  profit: number;
  invested: number;
}) {
  // Total is the sum of all displayed values (these are the actual card values)
  const total = fiat + btc + profit + invested;
  if (total === 0) return null;

  const allSegments = [
    { label: "Fiat", value: fiat, percent: total > 0 ? (fiat / total) * 100 : 0, color: "bg-primary" },
    { label: "Bitcoin", value: btc, percent: total > 0 ? (btc / total) * 100 : 0, color: "bg-warning" },
    { label: "Total Profit", value: profit, percent: total > 0 ? (profit / total) * 100 : 0, color: "bg-success" },
    { label: "Active Investment", value: invested, percent: total > 0 ? (invested / total) * 100 : 0, color: "bg-info" },
  ];
  
  // Only show segments with value > 0 in the bar
  const barSegments = allSegments.filter(s => s.percent > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Portfolio Allocation</span>
      </div>
      <div className="allocation-bar flex">
        {barSegments.map((segment, i) => (
          <motion.div
            key={segment.label}
            initial={{ width: 0 }}
            animate={{ width: `${segment.percent}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
            className={cn("allocation-segment", segment.color, i > 0 && "ml-0.5")}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {allSegments.map(segment => {
          // Show "<1%" for very small non-zero percentages, otherwise show rounded value
          const displayPercent = segment.percent === 0 
            ? "0%" 
            : segment.percent < 1 
              ? "<1%" 
              : `${segment.percent.toFixed(0)}%`;
          return (
            <div key={segment.label} className="flex items-center gap-1.5">
              <div className={cn("h-2 w-2 rounded-full", segment.color, segment.percent === 0 && "opacity-40")} />
              <span className={cn("text-[10px] text-text-muted", segment.percent === 0 && "opacity-60")}>
                {segment.label} <span className="text-text-secondary font-medium">{displayPercent}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Daily Tip Widget Component
function DailyTipWidget() {
  const tips = [
    { icon: Lightbulb, text: "Diversifying across multiple investment plans can help reduce risk." },
    { icon: TrendingUp, text: "Consistent small deposits often outperform irregular large ones." },
    { icon: ShieldCheck, text: "Complete KYC verification to unlock higher withdrawal limits." },
    { icon: Sparkles, text: "Refer friends and earn bonus rewards on their first investment." },
    { icon: Bitcoin, text: "Bitcoin holdings provide a hedge against currency fluctuations." },
  ];
  
  // Select tip based on day of year for consistency
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const tip = tips[dayOfYear % tips.length];
  const Icon = tip.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tip-card rounded-xl p-3 flex items-start gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-medium text-primary uppercase tracking-wider mb-0.5">Daily Tip</p>
        <p className="text-xs text-text-secondary leading-relaxed">{tip.text}</p>
      </div>
    </motion.div>
  );
}

// KYC Status Badge Component
function KycStatusBadge({ status }: { status?: string }) {
  const kycConfig = {
    verified: {
      icon: ShieldCheck,
      label: "Verified",
      description: "Your identity has been verified",
      bgClass: "bg-success/10 border-success/20",
      iconClass: "text-success",
      textClass: "text-success",
    },
    pending: {
      icon: Clock,
      label: "Pending Review",
      description: "Your documents are being reviewed",
      bgClass: "bg-warning/10 border-warning/20",
      iconClass: "text-warning",
      textClass: "text-warning",
    },
    rejected: {
      icon: ShieldAlert,
      label: "Verification Failed",
      description: "Please resubmit your documents",
      bgClass: "bg-destructive/10 border-destructive/20",
      iconClass: "text-destructive",
      textClass: "text-destructive",
    },
    unverified: {
      icon: ShieldAlert,
      label: "Not Verified",
      description: "Verify your identity to unlock all features",
      bgClass: "bg-surface-muted/50 border-white/5",
      iconClass: "text-text-muted",
      textClass: "text-text-muted",
    },
  };

  const normalizedStatus = (status?.toLowerCase() || "unverified") as keyof typeof kycConfig;
  const config = kycConfig[normalizedStatus] || kycConfig.unverified;
  const Icon = config.icon;
  const showCta = normalizedStatus === "unverified" || normalizedStatus === "rejected";

  return (
    <Link 
      href="/dashboard/kyc"
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all",
        "hover:border-white/10 group",
        config.bgClass
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.bgClass)}>
          <Icon className={cn("h-4 w-4", config.iconClass)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold", config.textClass)}>{config.label}</span>
            <span className="text-[10px] text-text-muted">KYC</span>
          </div>
          <p className="text-[10px] text-text-muted">{config.description}</p>
        </div>
      </div>
      {showCta && (
        <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:text-primary-hover transition-colors">
          <span>Verify Now</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </Link>
  );
}

// Account Info Widget - Plan, Tier, Referral Code
function AccountInfoWidget({ 
  tier, 
  referralCode,
  currentPlan 
}: { 
  tier: number;
  referralCode: string;
  currentPlan?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const tierConfig = {
    1: { label: "Tier 1", color: "text-text-muted", bgColor: "bg-surface-muted/50", borderColor: "border-white/5" },
    2: { label: "Tier 2", color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
    3: { label: "Tier 3", color: "text-warning", bgColor: "bg-warning/10", borderColor: "border-warning/20" },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig[1];

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Current Plan */}
      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-muted/30 border border-white/5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 mb-1.5">
          <Crown className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Plan</span>
        <span className="text-xs font-semibold text-text-primary truncate max-w-full">
          {currentPlan || "None"}
        </span>
      </div>

      {/* Account Tier */}
      <div className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border",
        config.bgColor,
        config.borderColor
      )}>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg mb-1.5", config.bgColor)}>
          <ShieldCheck className={cn("h-3.5 w-3.5", config.color)} />
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Tier</span>
        <span className={cn("text-xs font-semibold", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Referral Code */}
      <button
        onClick={copyReferralCode}
        className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-muted/30 border border-white/5 hover:bg-surface-muted/50 hover:border-white/10 transition-all group"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 mb-1.5">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Users className="h-3.5 w-3.5 text-success" />
          )}
        </div>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Referral</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono font-semibold text-text-primary">
            {referralCode?.slice(0, 6) || "N/A"}
          </span>
          <Copy className="h-2.5 w-2.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>
  );
}

// TradingView Advanced Chart - reliable dark mode
function TradingViewWidget({ symbol, height = 220 }: { symbol: string; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-[#131722]">
      <iframe
        src={`https://www.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en#%7B%22symbol%22%3A%22${symbol}%22%2C%22frameElementId%22%3A%22tv_widget%22%2C%22interval%22%3A%22D%22%2C%22hide_side_toolbar%22%3A%221%22%2C%22allow_symbol_change%22%3A%220%22%2C%22save_image%22%3A%220%22%2C%22details%22%3A%221%22%2C%22calendar%22%3A%220%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%223%22%2C%22withdateranges%22%3A%220%22%7D`}
        style={{ width: "100%", height: `${height}px`, border: 0 }}
        scrolling="no"
        allowFullScreen
      />
    </div>
  );
}

export function DashboardContent({ user, btcPriceData, recentTransactions }: DashboardContentProps) {
  const btcValueInFiat = user.bitcoinBalance * btcPriceData.price;
  const btcChange24h = btcPriceData.changePercent24h;
  const isBtcPositive = btcChange24h >= 0;
  // Total portfolio = fiat + btc + active investments (profit is already in fiat)
  const totalPortfolio = user.fiatBalance + user.activeInvestment + btcValueInFiat;
  const hasTransactions = recentTransactions.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION - Portfolio Overview with Sparkline
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Surface className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Good {getGreeting()},</span>
              <span className="text-sm font-semibold text-text-primary font-heading">{user.fullName.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-surface-muted/50 border border-white/5 px-2 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-medium text-text-muted">Active</span>
            </div>
          </div>

          {/* Portfolio Value + Change */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total Portfolio</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-text-primary tracking-tight sm:text-3xl font-heading financial-number">
                  {formatCurrency(totalPortfolio, user.currency)}
                </span>
                {user.profitBalance > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                    <TrendingUp className="h-3 w-3" />
                    +{formatCurrency(user.profitBalance, user.currency)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3">
            <Sparkline positive={user.profitBalance >= 0} />
          </div>

          {/* Portfolio Allocation */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <PortfolioAllocation 
              fiat={user.fiatBalance}
              btc={btcValueInFiat}
              profit={user.profitBalance}
              invested={user.activeInvestment}
            />
          </div>
        </Surface>
      </motion.div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          KYC STATUS - Identity verification status (only show if not verified)
      ═══════════════════════════════════════════════════════════════════ */}
      {user.kycStatus !== "verified" && (
        <motion.div variants={itemVariants}>
          <KycStatusBadge status={user.kycStatus} />
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ACCOUNT INFO - Plan, Tier, Referral Code
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <AccountInfoWidget 
          tier={user.tier}
          referralCode={user.referralCode}
          currentPlan={user.currentPlanName}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          PRIMARY ASSETS - Fiat & Bitcoin (Premium emphasis)
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {/* Fiat Balance - Cool, stable, glassy */}
          <Surface delay={0.1} variant="fiat" className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Fiat Balance</p>
              <IconBadge icon={Wallet} variant="primary" />
            </div>
            <p className="mt-3 text-2xl font-bold text-text-primary tracking-tight font-heading financial-number">
              {formatCurrency(user.fiatBalance, user.currency)}
            </p>
          </Surface>

          {/* Bitcoin Balance - Warm, premium amber glow */}
          <Surface delay={0.15} variant="btc" className="p-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-warning/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Bitcoin</p>
                  {/* 24h Change */}
                  <div className={cn(
                    "flex items-center gap-1 mt-0.5",
                    isBtcPositive ? "text-success" : "text-destructive"
                  )}>
                    {isBtcPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="text-[10px] font-medium">
                      {isBtcPositive ? "+" : ""}{btcChange24h.toFixed(2)}% 24h
                    </span>
                  </div>
                </div>
                <IconBadge icon={Bitcoin} variant="warning" />
              </div>
              <p className="mt-2 text-xl font-bold text-text-primary tracking-tight font-heading financial-number glow-warning">
                {formatBitcoin(user.bitcoinBalance)}
              </p>
              <p className="text-xs text-warning/80 font-medium">
                ≈ {formatCurrency(btcValueInFiat, user.currency)}
              </p>
            </div>
          </Surface>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          KEY METRICS - Consolidated (Profit + Invested only)
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-3 grid-cols-2">
          {/* Profit Balance */}
          <Surface delay={0.2} variant="profit" className="p-3.5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-success/15 blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Total Profit</p>
                <IconBadge icon={DollarSign} variant="success" />
              </div>
              <p className="mt-2 text-lg font-bold text-success tracking-tight font-heading financial-number glow-success">
                {formatCurrency(user.profitBalance, user.currency)}
              </p>
            </div>
          </Surface>

          {/* Active Investment */}
          <Surface delay={0.25} className="p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Active Investments</p>
              <IconBadge icon={TrendingUp} variant="primary" />
            </div>
            <p className="mt-2 text-lg font-bold text-text-primary tracking-tight font-heading financial-number">
              {formatCurrency(user.activeInvestment, user.currency)}
            </p>
          </Surface>
        </div>
      </motion.div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          QUICK ACTIONS - Native-feel tap-ready buttons
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
          <AnimatedButton href="/dashboard/deposit" variant="default">
            <ArrowDownToLine className="h-4 w-4" />
            <span>Deposit</span>
          </AnimatedButton>
          <AnimatedButton href="/dashboard/swap">
            <Repeat className="h-4 w-4" />
            <span>Swap</span>
          </AnimatedButton>
          <AnimatedButton href="/dashboard/withdraw">
            <ArrowUpFromLine className="h-4 w-4" />
            <span>Withdraw</span>
          </AnimatedButton>
          <AnimatedButton href="/dashboard/transactions">
            <Activity className="h-4 w-4" />
            <span>History</span>
          </AnimatedButton>
        </div>
      </motion.div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          DAILY TIP - Engagement widget
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <DailyTipWidget />
      </motion.div>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          MARKET CHARTS - TradingView Widgets
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Market Overview</h2>
          <div className="flex items-center gap-1 text-[10px] text-text-muted">
            <BarChart3 className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          <TradingViewWidget symbol="BITSTAMP:BTCUSD" height={220} />
          <TradingViewWidget symbol="NASDAQ:AAPL" height={220} />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          RECENT ACTIVITY - Better empty state with CTA
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Recent Activity</h2>
          <Link 
            href="/dashboard/transactions"
            className="flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {hasTransactions ? (
          <Surface delay={0.5} className="p-3">
            <div className="space-y-1">
              {recentTransactions.map((tx, index) => {
                const isDeposit = tx.type === "DEPOSIT" || tx.type === "PROFIT" || tx.type === "BONUS";
                const typeConfig = {
                  DEPOSIT: { icon: ArrowDownToLine, label: "Deposit", color: "text-success" },
                  WITHDRAWAL: { icon: ArrowUpFromLine, label: "Withdrawal", color: "text-destructive" },
                  PROFIT: { icon: TrendingUp, label: "Profit", color: "text-success" },
                  BONUS: { icon: Sparkles, label: "Bonus", color: "text-primary" },
                };
                const config = typeConfig[tx.type];
                const Icon = config.icon;
                const statusColors = {
                  PENDING: "bg-warning/10 text-warning",
                  APPROVED: "bg-success/10 text-success",
                  DECLINED: "bg-destructive/10 text-destructive",
                };
                
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isDeposit ? "bg-success/10" : "bg-destructive/10"
                      )}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{config.label}</p>
                        <p className="text-[10px] text-text-muted">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-semibold financial-number",
                        isDeposit ? "text-success" : "text-destructive"
                      )}>
                        {isDeposit ? "+" : "-"}
                        {tx.asset === "BTC" ? formatBitcoin(tx.amount) : formatCurrency(tx.amount, user.currency)}
                      </p>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                        statusColors[tx.status]
                      )}>
                        {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Surface>
        ) : (
          <Surface delay={0.5} className="p-5">
            <div className="flex flex-col items-center justify-center py-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">
                Start your investment journey
              </p>
              <p className="mt-1 text-xs text-text-muted max-w-[260px]">
                Make your first deposit to begin investing and watch your portfolio grow.
              </p>
              <Link 
                href="/dashboard/wallets"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-colors"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Make First Deposit
              </Link>
            </div>
          </Surface>
        )}
      </motion.div>
    </motion.div>
  );
}

// Helper function for greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
