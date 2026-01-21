import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/user-auth";
import { DashboardLayout } from "@/components/dashboard";
import { UserSessionProvider } from "@/components/providers/user-session-provider";
import { getPublicAppSettings } from "@/lib/actions/public";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  const settings = await getPublicAppSettings();

  return (
    <UserSessionProvider session={session}>
      <DashboardLayout siteName={settings.siteName}>
        {children}
      </DashboardLayout>
    </UserSessionProvider>
  );
}
