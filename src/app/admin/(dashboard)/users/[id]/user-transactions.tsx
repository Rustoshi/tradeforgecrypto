"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/validations/transaction";
import { createTransaction } from "@/lib/actions/transactions";

interface Transaction {
  id: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: Date;
  backdatedAt?: Date | null;
}

interface UserTransactionsProps {
  transactions: Transaction[];
  userId: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function UserTransactions({ transactions, userId }: UserTransactionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      userId,
      type: "DEPOSIT",
      asset: "FIAT",
      amount: 0,
      description: "",
      backdatedAt: "",
    },
  });

  async function onSubmit(data: CreateTransactionInput) {
    setIsLoading(true);

    try {
      await createTransaction(data);
      toast.success("Transaction created successfully");
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create transaction");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-text-primary">Transactions</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DEPOSIT">Deposit</SelectItem>
                            <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                            <SelectItem value="PROFIT">Profit</SelectItem>
                            <SelectItem value="BONUS">Bonus</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="asset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FIAT">Fiat (USD)</SelectItem>
                            <SelectItem value="BTC">Bitcoin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
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
                  name="backdatedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backdate (Optional)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-text-muted">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-border-default pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {tx.type} - {tx.asset}
                  </p>
                  <p className="text-xs text-text-muted">
                    {format(tx.backdatedAt || tx.createdAt, "MMM d, yyyy HH:mm")}
                    {tx.backdatedAt && " (backdated)"}
                  </p>
                  <p className="text-xs text-text-muted">Ref: {tx.reference}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">
                    {tx.asset === "BTC"
                      ? `${tx.amount.toFixed(8)} BTC`
                      : formatCurrency(tx.amount)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
