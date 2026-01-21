"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { updateAppSettings } from "@/lib/actions/settings";

const settingsFormSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  companyEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  defaultWithdrawalFee: z.number().min(0),
  defaultWithdrawalInstruction: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  settings: {
    siteName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    defaultWithdrawalFee: number;
    defaultWithdrawalInstruction: string;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema) as any,
    defaultValues: {
      siteName: settings.siteName || "HYI Broker",
      companyEmail: settings.companyEmail || "",
      companyPhone: settings.companyPhone || "",
      companyAddress: settings.companyAddress || "",
      defaultWithdrawalFee: settings.defaultWithdrawalFee,
      defaultWithdrawalInstruction: settings.defaultWithdrawalInstruction,
    },
  });

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);

    try {
      await updateAppSettings(data);
      toast.success("Settings updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <CardTitle className="text-text-primary">General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Site Name</FormLabel>
                  <FormControl>
                    <Input
                      className="border-border-default bg-surface"
                      placeholder="Your Company Name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Company name displayed in emails and throughout the platform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Company Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="border-border-default bg-surface"
                      placeholder="support@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Contact email displayed on public pages
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Company Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className="border-border-default bg-surface"
                      placeholder="+1 (888) 555-0123"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Contact phone number displayed on public pages
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Company Address</FormLabel>
                  <FormControl>
                    <Textarea
                      className="border-border-default bg-surface"
                      rows={2}
                      placeholder="123 Business Street, City, State, Country"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Physical address displayed on public pages
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultWithdrawalFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">
                    Default Withdrawal Fee
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="border-border-default bg-surface"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Default flat fee amount applied to withdrawals
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultWithdrawalInstruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">
                    Default Withdrawal Instructions
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="border-border-default bg-surface"
                      rows={4}
                      placeholder="Enter default instructions shown to users during withdrawal..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions displayed to users when they request a withdrawal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary-hover"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
