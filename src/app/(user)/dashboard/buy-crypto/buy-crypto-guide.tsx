"use client";

import { useState } from "react";
import { ExternalLink, CreditCard, Building2, Smartphone, Zap, Clock, DollarSign, Globe, MapPin, ChevronDown, ArrowRight, Coins, ShieldCheck, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    type Exchange,
    type Region,
    getExchangesForCountry,
    getExchangesForRegion,
    getAllRegions,
    getCountryName,
} from "@/lib/data/exchanges";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BuyCryptoGuideProps {
    userCountry: string | null | undefined;
}

const speedIcons = {
    instant: { icon: Zap, label: "Instant", color: "text-success" },
    fast: { icon: Zap, label: "Fast", color: "text-primary" },
    moderate: { icon: Clock, label: "Moderate", color: "text-warning" },
};

const paymentIcons: Record<string, typeof CreditCard> = {
    "Card": CreditCard,
    "Debit Card": CreditCard,
    "Credit Card": CreditCard,
    "Bank Transfer": Building2,
    "SEPA": Building2,
    "Wire Transfer": Building2,
    "Wire": Building2,
    "EFT": Building2,
    "Mobile Money": Smartphone,
    "M-Pesa": Smartphone,
    "GCash": Smartphone,
    "PayMaya": Smartphone,
    "OVO": Smartphone,
    "GoPay": Smartphone,
    "Dana": Smartphone,
    "UPI": Smartphone,
    "PIX": Smartphone,
    "PayID": Smartphone,
    "PayNow": Smartphone,
    "P2P": Globe,
};

function getPaymentIcon(method: string) {
    // Check for exact match
    if (paymentIcons[method]) {
        return paymentIcons[method];
    }
    // Check for partial match
    for (const [key, icon] of Object.entries(paymentIcons)) {
        if (method.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return CreditCard;
}

function ExchangeCard({ exchange }: { exchange: Exchange }) {
    const SpeedIcon = speedIcons[exchange.speed].icon;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-muted/50 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-surface-muted">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo placeholder with initials */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 font-semibold text-primary">
                            {exchange.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-primary">{exchange.name}</h3>
                            <div className={cn("flex items-center gap-1 text-xs", speedIcons[exchange.speed].color)}>
                                <SpeedIcon className="h-3 w-3" />
                                <span>{speedIcons[exchange.speed].label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fees badge */}
                    <div className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-text-secondary">
                        <DollarSign className="h-3 w-3" />
                        <span>{exchange.fees}</span>
                    </div>
                </div>

                {/* Description */}
                {exchange.description && (
                    <p className="mb-4 text-sm text-text-secondary line-clamp-2">
                        {exchange.description}
                    </p>
                )}

                {/* Payment methods */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {exchange.paymentMethods.slice(0, 4).map((method) => {
                            const Icon = getPaymentIcon(method);
                            return (
                                <div
                                    key={method}
                                    className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-xs text-text-secondary"
                                >
                                    <Icon className="h-3 w-3" />
                                    <span>{method}</span>
                                </div>
                            );
                        })}
                        {exchange.paymentMethods.length > 4 && (
                            <div className="flex items-center rounded-lg bg-surface px-2.5 py-1.5 text-xs text-text-muted">
                                +{exchange.paymentMethods.length - 4} more
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <a
                    href={exchange.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                >
                    <span>Visit {exchange.name}</span>
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

export function BuyCryptoGuide({ userCountry }: BuyCryptoGuideProps) {
    const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

    // Get initial exchanges based on user's country
    const countryData = getExchangesForCountry(userCountry);

    // If user manually selected a region, use that instead
    const displayExchanges = selectedRegion
        ? getExchangesForRegion(selectedRegion)
        : countryData.exchanges;

    const regions = getAllRegions();
    const selectedRegionName = selectedRegion
        ? regions.find(r => r.id === selectedRegion)?.name
        : null;

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-primary/10 via-surface-muted to-surface p-6 md:p-8">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-primary/10 blur-3xl" />

                <div className="relative">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary">
                        <Coins className="h-4 w-4" />
                        <span>How to Buy Crypto</span>
                    </div>

                    <h1 className="mb-3 text-2xl font-bold text-text-primary md:text-3xl">
                        Purchase Cryptocurrency
                    </h1>
                    <p className="max-w-2xl text-text-secondary">
                        We&apos;ve curated trusted exchanges available in your location. Purchase crypto on any of these platforms, then send it to your deposit address to fund your account.
                        <br /><span className="text-xs text-text-muted italic mt-1 block">* Availability may vary by state or region. Please check the exchange&apos;s terms.</span>
                    </p>

                    {/* Location indicator */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-surface/80 px-3 py-2 text-sm backdrop-blur-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-text-secondary">Showing exchanges for:</span>
                            <span className="font-medium text-text-primary">
                                {selectedRegionName || (countryData.source === "country" ? countryData.countryName :
                                    countryData.source === "region" ? `${countryData.countryName} (${countryData.region?.replace("_", " ")})` :
                                        "Worldwide")}
                            </span>
                        </div>

                        {/* Region selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span>Change Region</span>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem
                                    onClick={() => setSelectedRegion(null)}
                                    className={cn(!selectedRegion && "bg-primary/10 text-primary")}
                                >
                                    <MapPin className="mr-2 h-4 w-4" />
                                    My Location
                                </DropdownMenuItem>
                                {regions.map((region) => (
                                    <DropdownMenuItem
                                        key={region.id}
                                        onClick={() => setSelectedRegion(region.id)}
                                        className={cn(selectedRegion === region.id && "bg-primary/10 text-primary")}
                                    >
                                        <Globe className="mr-2 h-4 w-4" />
                                        {region.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Exchange Cards Grid */}
            <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Recommended Exchanges</span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayExchanges.map((exchange) => (
                        <ExchangeCard key={exchange.id} exchange={exchange} />
                    ))}
                </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-white/[0.06] bg-surface-muted/30 p-6">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-text-primary">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>How to Fund Your Account</span>
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* Step 1 */}
                    <div className="relative rounded-xl bg-surface p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
                            1
                        </div>
                        <h3 className="mb-2 font-medium text-text-primary">Buy Crypto</h3>
                        <p className="text-sm text-text-secondary">
                            Choose an exchange above and purchase Bitcoin or another cryptocurrency using your preferred payment method.
                        </p>
                        <ArrowRight className="absolute right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-text-muted md:block" />
                    </div>

                    {/* Step 2 */}
                    <div className="relative rounded-xl bg-surface p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
                            2
                        </div>
                        <h3 className="mb-2 font-medium text-text-primary">Send to Deposit</h3>
                        <p className="text-sm text-text-secondary">
                            Go to the Deposit page, select your cryptocurrency, copy the wallet address, and send your crypto there.
                        </p>
                        <ArrowRight className="absolute right-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-text-muted md:block" />
                    </div>

                    {/* Step 3 */}
                    <div className="rounded-xl bg-surface p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-lg font-bold text-success">
                            ✓
                        </div>
                        <h3 className="mb-2 font-medium text-text-primary">Funds Credited</h3>
                        <p className="text-sm text-text-secondary">
                            Once confirmed on the blockchain, your deposit will be credited to your account balance.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA to deposit */}
            <div className="flex justify-center">
                <a
                    href="/dashboard/deposit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                >
                    <span>Go to Deposit Page</span>
                    <ArrowRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}
