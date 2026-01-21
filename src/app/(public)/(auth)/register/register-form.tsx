"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currencies, type Currency } from "@/lib/data/currencies";
import { countries } from "@/lib/data/countries";

interface FormState {
  status: "idle" | "loading" | "error";
  message: string;
}

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

interface RegisterFormProps {
  siteName: string;
  referralCode?: string;
}

export function RegisterForm({ siteName, referralCode: initialReferralCode }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode || "");
  const [phone, setPhone] = useState("");
  const [formState, setFormState] = useState<FormState>({
    status: "idle",
    message: "",
  });

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    const search = currencySearch.toLowerCase().trim();
    if (!search) return currencies;
    return currencies.filter(c =>
      c.code.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search) ||
      c.country.toLowerCase().includes(search)
    );
  }, [currencySearch]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    const search = countrySearch.toLowerCase().trim();
    if (!search) return countries;
    return countries.filter(c =>
      c.code.toLowerCase().includes(search) ||
      c.name.toLowerCase().includes(search)
    );
  }, [countrySearch]);

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);
  const selectedCountryData = countries.find(c => c.name === selectedCountry);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "loading", message: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      country: selectedCountry,
      dob: formData.get("dob") as string,
      gender: selectedGender || undefined,
      phone: phone.trim() || undefined,
      currency: selectedCurrency,
      referralCode: referralCode.trim().toUpperCase() || undefined,
    };

    // Client-side validation
    if (!data.fullName || !data.email || !data.password || !selectedCountry) {
      setFormState({
        status: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setFormState({
        status: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    const passwordValid = passwordRequirements.every((req) =>
      req.regex.test(data.password)
    );
    if (!passwordValid) {
      setFormState({
        status: "error",
        message: "Password does not meet requirements.",
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      router.push("/login?registered=true");
    } catch (error) {
      setFormState({
        status: "error",
        message: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-surface-muted items-center justify-center p-12">
        <div className="max-w-md">
          <h2 className="font-heading text-3xl font-bold text-text-primary">
            Start your investment journey today
          </h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Join thousands of investors who trust {siteName} for secure, 
            transparent, and profitable investments.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
              <div>
                <p className="font-medium text-text-primary">No minimum lock-in</p>
                <p className="text-sm text-text-secondary">Flexible investment terms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Daily profit accrual</p>
                <p className="text-sm text-text-secondary">Watch your investment grow</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Bank-grade security</p>
                <p className="text-sm text-text-secondary">Your assets are protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-2 text-text-secondary">
              Get started with your investment journey
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                className="h-11"
              />
            </div>

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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                autoComplete="tel"
                className="h-11"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  autoComplete="bday"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country <span className="text-destructive">*</span></Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="h-11 w-full justify-between font-normal"
                    >
                      {selectedCountryData ? (
                        <span className="truncate">{selectedCountryData.name}</span>
                      ) : (
                        <span className="text-muted-foreground">Select country</span>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredCountries.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">
                          No country found
                        </p>
                      ) : (
                        filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country.name);
                              setCountryOpen(false);
                              setCountrySearch("");
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-surface-muted transition-colors ${
                              selectedCountry === country.name ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            <span className="truncate flex-1 text-left">
                              {country.name}
                            </span>
                            {selectedCountry === country.name && (
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Preferred Currency</Label>
                <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={currencyOpen}
                      className="h-11 w-full justify-between font-normal"
                    >
                      {selectedCurrencyData ? (
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{selectedCurrencyData.code}</span>
                          <span className="text-text-muted text-xs truncate">
                            {selectedCurrencyData.name}
                          </span>
                        </span>
                      ) : (
                        "Select currency"
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                        <Input
                          placeholder="Search currencies..."
                          value={currencySearch}
                          onChange={(e) => setCurrencySearch(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {filteredCurrencies.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-4">
                          No currency found
                        </p>
                      ) : (
                        filteredCurrencies.map((currency) => (
                          <button
                            key={currency.code}
                            type="button"
                            onClick={() => {
                              setSelectedCurrency(currency.code);
                              setCurrencyOpen(false);
                              setCurrencySearch("");
                            }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-surface-muted transition-colors ${
                              selectedCurrency === currency.code ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            <span className="font-medium w-12">{currency.code}</span>
                            <span className="text-text-secondary truncate flex-1 text-left">
                              {currency.name}
                            </span>
                            {selectedCurrency === currency.code && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className="h-11 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              
              {/* Password Requirements */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 text-xs ${
                      req.regex.test(password)
                        ? "text-success"
                        : "text-text-muted"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (Optional)</Label>
              <Input
                id="referralCode"
                name="referralCode"
                type="text"
                placeholder="Enter referral code"
                className="h-11 font-mono uppercase tracking-wider"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              <p className="text-xs text-text-muted">
                Have a referral code? Enter it here to connect with your referrer.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11"
                disabled={formState.status === "loading"}
              >
                {formState.status === "loading" ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-text-muted text-center">
              By creating an account, you agree to our{" "}
              <Link href="/legal" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal#privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
