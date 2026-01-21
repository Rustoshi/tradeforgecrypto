import { getPublicAppSettings } from "@/lib/actions/public";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const settings = await getPublicAppSettings();

  return <LoginForm siteName={settings.siteName} />;
}
