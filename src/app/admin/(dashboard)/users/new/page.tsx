"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";
import { createUser } from "@/lib/actions/users";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "ZAR", name: "South African Rand" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "KRW", name: "South Korean Won" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "COP", name: "Colombian Peso" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "PEN", name: "Peruvian Sol" },
];

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "",
      city: "",
      phone: "",
      currency: "USD",
      fiatBalance: 0,
      bitcoinBalance: 0,
      profitBalance: 0,
      totalBonus: 10,
      withdrawalFee: 0,
      transactionPIN: "",
      accountAge: "",
      sendWelcomeEmail: false,
    },
  });

  async function onSubmit(data: CreateUserInput) {
    setIsLoading(true);

    try {
      await createUser(data);
      toast.success("User created successfully");
      router.push("/admin/users");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create User</h1>
          <p className="text-text-muted">Add a new user to the platform</p>
        </div>
      </div>

      <Card className="border-border-default bg-surface">
        <CardHeader>
          <CardTitle className="text-text-primary">User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-secondary">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="border-border-default bg-surface"
                          {...field}
                        />
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
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="border-border-default bg-surface"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text-secondary">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          className="border-border-default bg-surface"
                          {...field}
                        />
                      </FormControl>
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
                        <Input
                          placeholder="+1 234 567 8900"
                          className="border-border-default bg-surface"
                          {...field}
                        />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-border-default bg-surface">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
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
                        <Input
                          placeholder="United States"
                          className="border-border-default bg-surface"
                          {...field}
                        />
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
                        <Input
                          placeholder="New York"
                          className="border-border-default bg-surface"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border-default pt-6">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Initial Balances
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
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
                    name="totalBonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Bonus</FormLabel>
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
              </div>

              <div className="border-t border-border-default pt-6">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Account Settings
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="transactionPIN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Transaction PIN</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            maxLength={6}
                            placeholder="4-6 digits"
                            className="border-border-default bg-surface"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Optional 4-6 digit PIN for transactions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="withdrawalFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Withdrawal Fee</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="border-border-default bg-surface"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Flat fee amount for withdrawals
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text-secondary">Account Created Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="border-border-default bg-surface"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Backdate account creation (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t border-border-default pt-6">
                <h3 className="mb-4 text-lg font-medium text-text-primary">
                  Notifications
                </h3>
                <FormField
                  control={form.control}
                  name="sendWelcomeEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border-default p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-text-primary">Send Welcome Email</FormLabel>
                        <FormDescription className="text-xs">
                          Send account credentials and welcome message to the user
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

              <div className="flex justify-end gap-4">
                <Link href="/admin/users">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary-hover"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create User
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
