import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your profile and account settings",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary lg:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-text-secondary">
          Manage your profile and security settings
        </p>
      </div>

      {/* Settings Sections */}
      <SettingsContent
        user={{
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          country: user.country,
          city: user.city,
          address: user.address,
          hasPin: !!user.transactionPIN,
        }}
      />
    </div>
  );
}
