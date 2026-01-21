import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { getPublicAppSettings } from "@/lib/actions/public";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicAppSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader siteName={settings.siteName} />
      <main className="flex-1">{children}</main>
      <PublicFooter siteName={settings.siteName} />
    </div>
  );
}
