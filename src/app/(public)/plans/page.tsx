import Link from "next/link";
import { Check, ArrowRight, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPublicInvestmentPlans, type PublicInvestmentPlan } from "@/lib/actions/public";

// Plan descriptions and features based on tier (by index or amount range)
const planDescriptions: Record<number, { description: string; features: string[] }> = {
  0: {
    description: "Perfect for new investors looking to begin their journey.",
    features: [
      "Daily profit accrual",
      "Principal returned at maturity",
      "Email support",
      "Basic portfolio reporting",
    ],
  },
  1: {
    description: "Balanced returns for investors seeking steady growth.",
    features: [
      "Daily profit accrual",
      "Principal returned at maturity",
      "Priority email support",
      "Detailed portfolio reporting",
      "Monthly performance reviews",
    ],
  },
  2: {
    description: "Enhanced returns for experienced investors.",
    features: [
      "Daily profit accrual",
      "Principal returned at maturity",
      "Dedicated account manager",
      "Real-time portfolio dashboard",
      "Weekly performance reviews",
      "Priority withdrawals",
    ],
  },
  3: {
    description: "Maximum returns for high-net-worth investors.",
    features: [
      "Daily profit accrual",
      "Principal returned at maturity",
      "Personal investment advisor",
      "Custom portfolio strategies",
      "Daily performance reviews",
      "Instant withdrawals",
      "Exclusive investment opportunities",
    ],
  },
};

// Default features for plans beyond index 3
const defaultPlanMeta = {
  description: "A tailored investment plan designed for your goals.",
  features: [
    "Daily profit accrual",
    "Principal returned at maturity",
    "Dedicated support",
    "Portfolio reporting",
  ],
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days === 30) return "30 days";
  if (days === 60) return "60 days";
  if (days === 90) return "90 days";
  if (days === 180) return "180 days";
  if (days === 365) return "1 year";
  return `${days} days`;
}

export default async function PlansPage() {
  const plans = await getPublicInvestmentPlans();
  
  // Determine which plan is "popular" (middle plan or second if 4+ plans)
  const popularIndex = plans.length >= 2 ? 1 : 0;
  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Investment Plans
            </h1>
            <p className="mt-6 text-xl text-text-secondary leading-relaxed">
              Choose a plan that matches your investment goals. All plans include 
              daily profit accrual and full principal return at maturity.
            </p>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted mx-auto">
                <TrendingUp className="h-8 w-8 text-text-muted" />
              </div>
              <p className="mt-4 text-lg text-text-muted">No investment plans available</p>
              <p className="mt-2 text-sm text-text-muted">
                Please check back later for our investment offerings.
              </p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              plans.length === 1 && "max-w-md mx-auto",
              plans.length === 2 && "lg:grid-cols-2 max-w-3xl mx-auto",
              plans.length === 3 && "lg:grid-cols-3",
              plans.length >= 4 && "lg:grid-cols-4"
            )}>
              {plans.map((plan, index) => {
                const isPopular = index === popularIndex;
                const meta = planDescriptions[index] || defaultPlanMeta;
                
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-xl border bg-surface p-6 lg:p-8",
                      isPopular
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="font-heading text-xl font-semibold text-text-primary">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-sm text-text-secondary h-10">
                        {meta.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-text-muted">Target Return</p>
                      <p className="mt-1 font-heading text-3xl font-bold text-success">
                        {plan.roiPercentage}%
                      </p>
                      <p className="mt-1 text-sm text-text-muted">per {formatDuration(plan.durationDays)}</p>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Min Investment</span>
                        <span className="font-medium text-text-primary">
                          {formatCurrency(plan.minAmount)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-text-muted">Max Investment</span>
                        <span className="font-medium text-text-primary">
                          {plan.maxAmount ? formatCurrency(plan.maxAmount) : "Unlimited"}
                        </span>
                      </div>
                    </div>
                    
                    <ul className="mt-6 space-y-3">
                      {meta.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-8">
                      <Link href="/register">
                        <Button
                          className="w-full"
                          variant={isPopular ? "default" : "outline"}
                        >
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      {plans.length >= 2 && (
        <section className="py-16 lg:py-24 bg-surface-muted">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                Plan Comparison
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                A detailed breakdown of what each plan offers.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 px-4 text-left text-sm font-medium text-text-muted">
                      Feature
                    </th>
                    {plans.map((plan, index) => (
                      <th 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm font-medium",
                          index === popularIndex ? "text-primary" : "text-text-primary"
                        )}
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-sm text-text-secondary">Minimum Investment</td>
                    {plans.map((plan, index) => (
                      <td 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm text-text-primary",
                          index === popularIndex && "bg-primary/5"
                        )}
                      >
                        {formatCurrency(plan.minAmount)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-sm text-text-secondary">Maximum Investment</td>
                    {plans.map((plan, index) => (
                      <td 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm text-text-primary",
                          index === popularIndex && "bg-primary/5"
                        )}
                      >
                        {plan.maxAmount ? formatCurrency(plan.maxAmount) : "Unlimited"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-sm text-text-secondary">Target ROI</td>
                    {plans.map((plan, index) => (
                      <td 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm font-medium text-success",
                          index === popularIndex && "bg-primary/5"
                        )}
                      >
                        {plan.roiPercentage}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-sm text-text-secondary">Investment Duration</td>
                    {plans.map((plan, index) => (
                      <td 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm text-text-primary",
                          index === popularIndex && "bg-primary/5"
                        )}
                      >
                        {formatDuration(plan.durationDays)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-sm text-text-secondary">Profit Accrual</td>
                    {plans.map((plan, index) => (
                      <td 
                        key={plan.id} 
                        className={cn(
                          "py-4 px-4 text-center text-sm text-text-primary",
                          index === popularIndex && "bg-primary/5"
                        )}
                      >
                        Daily
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ROI Explanation */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                How Returns Work
              </h2>
              <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
                <p>
                  Our investment returns are generated through a diversified portfolio 
                  of assets including equities, fixed income, real estate, and digital 
                  assets. Our experienced team actively manages these portfolios to 
                  optimize returns while managing risk.
                </p>
                <p>
                  Profits are calculated daily and credited to your account. You can 
                  choose to withdraw profits as they accrue or reinvest them for 
                  compound growth.
                </p>
                <p>
                  At the end of your investment term, your full principal is returned 
                  along with any accumulated profits that haven&apos;t been withdrawn.
                </p>
              </div>
            </div>
            
            <div className="rounded-xl border border-border bg-surface p-6 lg:p-8">
              <h3 className="font-heading text-xl font-semibold text-text-primary">
                Example Calculation
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                Growth Plan · $10,000 investment · 60 days
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Principal</span>
                  <span className="font-medium text-text-primary">$10,000</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Target ROI (12%)</span>
                  <span className="font-medium text-success">+$1,200</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Daily Profit</span>
                  <span className="font-medium text-text-primary">~$20/day</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-text-primary">Total at Maturity</span>
                  <span className="font-heading text-xl font-bold text-text-primary">$11,200</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-surface-muted">
                <Info className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
                <p className="text-xs text-text-muted">
                  This is an example based on target returns. Actual returns may vary 
                  based on market conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-16 lg:py-24 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl text-center">
              Investment Terms
            </h2>
            
            <div className="mt-12 space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  Minimum Investment Period
                </h3>
                <p className="mt-2 text-text-secondary">
                  Each plan has a fixed investment duration. Early withdrawal is not 
                  permitted to ensure optimal portfolio management and returns.
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  Profit Withdrawals
                </h3>
                <p className="mt-2 text-text-secondary">
                  Accrued profits can be withdrawn at any time without affecting your 
                  principal investment. Withdrawal processing times vary by plan tier.
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  Reinvestment
                </h3>
                <p className="mt-2 text-text-secondary">
                  At maturity, you can choose to reinvest your principal and profits 
                  into the same or a different plan. Reinvestment is processed 
                  automatically if you enable auto-renewal.
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  Fees
                </h3>
                <p className="mt-2 text-text-secondary">
                  There are no management fees or hidden charges. A small withdrawal 
                  fee may apply depending on your payment method and account tier.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Ready to start investing?
            </h2>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Create your account in minutes and choose the plan that fits your goals.
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
