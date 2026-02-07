import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { BuyCryptoGuide } from "./buy-crypto-guide";

export const metadata: Metadata = {
    title: "Buy Crypto | Dashboard",
    description: "Learn where to buy cryptocurrency based on your location",
};

export default async function BuyCryptoPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Buy Crypto</h1>
                <p className="mt-1 text-text-secondary">
                    Find trusted exchanges to purchase cryptocurrency in your region
                </p>
            </div>

            {/* Guide Component */}
            <BuyCryptoGuide userCountry={user.country} />
        </div>
    );
}
