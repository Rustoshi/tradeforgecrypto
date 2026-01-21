import { getPublicAppSettings } from "@/lib/actions/public";
import { RegisterForm } from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [settings, params] = await Promise.all([
    getPublicAppSettings(),
    searchParams,
  ]);

  return <RegisterForm siteName={settings.siteName} referralCode={params.ref} />;
}
