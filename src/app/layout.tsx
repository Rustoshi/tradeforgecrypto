import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { TradeNotifications } from "@/components/ui/trade-notifications";
import { GTranslateWidget } from "@/components/ui/gtranslate-widget";
import { LiveChatWidget } from "@/components/ui/livechat-widget";
import { getPublicAppSettings } from "@/lib/actions/public";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://standardbroker.com";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicAppSettings();
  const siteName = settings.siteName;
  const description = `${siteName} - Professional investment platform with transparent returns and institutional-grade security. Start your investment journey today.`;
  const previewImage = `${SITE_URL}/preview.jpeg`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${siteName} - Secure Investment Platform`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      "investment platform",
      "secure investments",
      "cryptocurrency",
      "bitcoin investment",
      "trading platform",
      "financial services",
      "wealth management",
      "portfolio management",
      "high ROI investments",
      "crypto trading",
      "online investment",
      siteName,
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName,
      title: `${siteName} - Secure Investment Platform`,
      description,
      images: [
        {
          url: previewImage,
          secureUrl: previewImage,
          width: 800,
          height: 600,
          alt: `${siteName} - Professional Investment Platform`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${siteName.replace(/\s+/g, "")}`,
      creator: `@${siteName.replace(/\s+/g, "")}`,
      title: `${siteName} - Secure Investment Platform`,
      description,
      images: {
        url: previewImage,
        alt: `${siteName} - Professional Investment Platform`,
      },
    },
    verification: {
      // Add your verification codes here if needed
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
    },
    alternates: {
      canonical: SITE_URL,
    },
    other: {
      // WhatsApp specific
      "og:image:width": "800",
      "og:image:height": "600",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster position="top-right" />
            <TradeNotifications />
            <GTranslateWidget />
          </QueryProvider>
        </ThemeProvider>
        <LiveChatWidget />
      </body>
    </html>
  );
}
