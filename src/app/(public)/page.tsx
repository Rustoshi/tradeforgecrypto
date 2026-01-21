import { getPublicAppSettings, getPublicInvestmentPlans } from "@/lib/actions/public";
import { HomepageContent } from "@/components/public/homepage-content";

export default async function HomePage() {
  const [settings, plans] = await Promise.all([
    getPublicAppSettings(),
    getPublicInvestmentPlans(),
  ]);

  return <HomepageContent settings={settings} plans={plans} />;
}

