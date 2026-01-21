"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, Search, Check } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
import { adminEditUserSchema, type AdminEditUserInput } from "@/lib/validations/user";
import { adminEditUser } from "@/lib/actions/users";
import { currencies } from "@/lib/data/currencies";

interface UserEditFormProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    rawPassword?: string | null;
    phone?: string | null;
    dob?: Date | null;
    gender?: string | null;
    country?: string | null;
    city?: string | null;
    address?: string | null;
    currency: string;
    fiatBalance: number;
    bitcoinBalance: number;
    profitBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    activeInvestment: number;
    totalBonus: number;
    withdrawalFee: number;
    withdrawalFeeInstruction?: string | null;
    signalFeeEnabled?: boolean;
    signalFeeInstruction?: string | null;
    tier?: 1 | 2 | 3;
    tierUpgradeEnabled?: boolean;
    tierUpgradeInstruction?: string | null;
    transactionPIN?: string | null;
    isSuspended: boolean;
    isBlocked: boolean;
    createdAt: Date;
    kyc?: {
      status: string;
    } | null;
  };
}

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const tierOptions = [
  { value: 1, label: "Tier 1" },
  { value: 2, label: "Tier 2" },
  { value: 3, label: "Tier 3" },
];

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);

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

  const form = useForm<AdminEditUserInput>({
    resolver: zodResolver(adminEditUserSchema),
    defaultValues: {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      rawPassword: user.rawPassword || "",
      phone: user.phone || "",
      dob: user.dob ? format(new Date(user.dob), "yyyy-MM-dd") : "",
      gender: (user.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") || undefined,
      country: user.country || "",
      city: user.city || "",
      address: user.address || "",
      currency: user.currency || "USD",
      fiatBalance: user.fiatBalance,
      bitcoinBalance: user.bitcoinBalance,
      profitBalance: user.profitBalance,
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      activeInvestment: user.activeInvestment,
      totalBonus: user.totalBonus,
      withdrawalFee: user.withdrawalFee,
      withdrawalFeeInstruction: user.withdrawalFeeInstruction || "",
      signalFeeEnabled: user.signalFeeEnabled || false,
      signalFeeInstruction: user.signalFeeInstruction || "",
      tier: user.tier || 1,
      tierUpgradeEnabled: user.tierUpgradeEnabled || false,
      tierUpgradeInstruction: user.tierUpgradeInstruction || "",
      transactionPIN: user.transactionPIN || "",
      isSuspended: user.isSuspended,
      isBlocked: user.isBlocked,
      kycStatus: (user.kyc?.status as "PENDING" | "APPROVED" | "DECLINED") || undefined,
      createdAt: format(new Date(user.createdAt), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const selectedCurrency = form.watch("currency");
  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  async function onSubmit(data: AdminEditUserInput) {
    setIsLoading(true);

    try {
      await adminEditUser(data);
      toast.success("User updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Personal Information</CardTitle>
            <CardDescription>Basic user profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Full Name</FormLabel>
                    <FormControl>
                      <Input className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Email</FormLabel>
                    <FormControl>
                      <Input type="email" className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rawPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Password (Plain Text)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        className="border-border-default bg-surface font-mono" 
                        placeholder="Enter new password to change"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Visible password. Changing this will update the user&apos;s login password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Phone</FormLabel>
                    <FormControl>
                      <Input className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border-default bg-surface">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Country</FormLabel>
                    <FormControl>
                      <Input className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">City</FormLabel>
                    <FormControl>
                      <Input className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-text-secondary">Address</FormLabel>
                    <FormControl>
                      <Textarea className="border-border-default bg-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Currency</FormLabel>
                    <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between border-border-default bg-surface font-normal"
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
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
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
                        <div className="max-h-[250px] overflow-y-auto p-1">
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
                                  field.onChange(currency.code);
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Account Created Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        className="border-border-default bg-surface" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Change to backdate or adjust account age
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Balances */}
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Account Balances</CardTitle>
            <CardDescription>Financial balances and totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="fiatBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Fiat Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bitcoinBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Bitcoin Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00000001"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profitBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Profit Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalDeposited"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Total Deposited</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalWithdrawn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Total Withdrawn</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activeInvestment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Active Investment</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalBonus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Total Bonus</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="border-border-default bg-surface">
          <CardHeader>
            <CardTitle className="text-text-primary">Account Settings</CardTitle>
            <CardDescription>Withdrawal fees, PIN, and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="withdrawalFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Withdrawal Fee ({user.currency})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-border-default bg-surface"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Flat fee amount that blocks withdrawal until paid
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transactionPIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Transaction PIN</FormLabel>
                    <FormControl>
                      <Input 
                        className="border-border-default bg-surface font-mono" 
                        placeholder="Enter 4-digit PIN"
                        maxLength={6}
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Current PIN: {user.transactionPIN || "Not set"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Account Tier</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value) as 1 | 2 | 3)} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="border-border-default bg-surface">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tierOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      User account tier level
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="withdrawalFeeInstruction"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-text-secondary">Withdrawal Fee Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="border-border-default bg-surface" 
                        placeholder="Custom instructions shown to user during withdrawal"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Signal Fee Section */}
            <div className="border-t border-border-default pt-4 mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-4">Signal Fee Settings</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="signalFeeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border-default p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-text-secondary">Enable Signal Fee</FormLabel>
                        <FormDescription className="text-xs">
                          Block withdrawal until signal fee is paid
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="signalFeeInstruction"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-text-secondary">Signal Fee Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="border-border-default bg-surface" 
                          placeholder="Instructions shown to user when signal fee is required"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This message is shown after withdrawal fee (if any) is cleared
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tier Upgrade Section */}
            <div className="border-t border-border-default pt-4 mt-4">
              <h4 className="text-sm font-medium text-text-primary mb-4">Tier Upgrade Settings</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tierUpgradeEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border-default p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-text-secondary">Enable Tier Upgrade Requirement</FormLabel>
                        <FormDescription className="text-xs">
                          Block withdrawal until user upgrades tier
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tierUpgradeInstruction"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-text-secondary">Tier Upgrade Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="border-border-default bg-surface" 
                          placeholder="Instructions shown to user when tier upgrade is required"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This message is shown after signal fee (if any) is cleared. Default: &quot;You cannot make withdrawals because you are still in Tier X. You need to upgrade to Tier 3 to enable withdrawals. Please contact support for assistance.&quot;
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* KYC Status */}
            {user.kyc && (
              <FormField
                control={form.control}
                name="kycStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">KYC Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-border-default bg-surface w-[200px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="DECLINED">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Status Toggles */}
            <div className="flex flex-col gap-4 pt-4 border-t border-border-default">
              <FormField
                control={form.control}
                name="isSuspended"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border-default p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-text-primary">Account Suspended</FormLabel>
                      <FormDescription className="text-xs">
                        Suspended users cannot make transactions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isBlocked"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-destructive">Account Blocked</FormLabel>
                      <FormDescription className="text-xs">
                        Blocked users cannot access their account
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary-hover"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save All Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
