import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { SessionProvider } from "@/components/providers/session-provider";
import { getAppSettings } from "@/lib/actions/settings";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const settings = await getAppSettings();
  const siteName = settings?.siteName || "HYI Broker";

  return (
    <SessionProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar siteName={siteName} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader siteName={siteName} />
          <main className="flex-1 overflow-auto p-3 md:p-6">
            <div className="w-full max-w-full">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
