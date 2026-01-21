"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateUserBalanceSchema, type UpdateUserBalanceInput } from "@/lib/validations/user";
import { updateUserBalance } from "@/lib/actions/users";

interface UserBalanceFormProps {
  user: {
    id: string;
    fiatBalance: number;
    bitcoinBalance: number;
    profitBalance: number;
    totalBonus: number;
  };
}

export function UserBalanceForm({ user }: UserBalanceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UpdateUserBalanceInput>({
    resolver: zodResolver(updateUserBalanceSchema),
    defaultValues: {
      userId: user.id,
      fiatBalance: user.fiatBalance,
      bitcoinBalance: user.bitcoinBalance,
      profitBalance: user.profitBalance,
      totalBonus: user.totalBonus,
    },
  });

  async function onSubmit(data: UpdateUserBalanceInput) {
    setIsLoading(true);

    try {
      await updateUserBalance(data);
      toast.success("Balances updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update balances");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">Update Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fiatBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Fiat Balance (USD)</FormLabel>
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
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary-hover"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Balances
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
