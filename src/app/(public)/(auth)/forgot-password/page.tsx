import { getPublicAppSettings } from "@/lib/actions/public";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const settings = await getPublicAppSettings();

  return <ForgotPasswordForm siteName={settings.siteName} />;
}
