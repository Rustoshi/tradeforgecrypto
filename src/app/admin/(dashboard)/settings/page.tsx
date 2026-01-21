import { Suspense } from "react";
import { getAppSettings, getInvestmentPlans } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "./settings-form";
import { PaymentMethodsManager } from "./payment-methods";
import { InvestmentPlansManager } from "./investment-plans";
import { SecuritySettings } from "./security-settings";

async function SettingsContent() {
  const [settings, plans] = await Promise.all([
    getAppSettings(),
    getInvestmentPlans(),
  ]);

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="bg-surface-muted">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="payments">Payment Methods</TabsTrigger>
        <TabsTrigger value="plans">Investment Plans</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <SettingsForm settings={settings} />
      </TabsContent>

      <TabsContent value="payments">
        <PaymentMethodsManager paymentMethods={settings.paymentMethods || []} />
      </TabsContent>

      <TabsContent value="plans">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <InvestmentPlansManager plans={plans as any} />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  );
}

function SettingsSkeleton() {
  return (
    <Card className="border-border-default bg-surface">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted">Configure platform settings and preferences</p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
