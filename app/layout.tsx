import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/providers/auth-provider";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hoodiz - Anime Merchandise",
  description: "Premium anime hoodies and merchandise. Wear the power of anime with exclusive hoodie designs.",
  keywords: ["anime hoodies", "anime merchandise", "hoodies", "anime clothing", "anime apparel"],
  openGraph: {
    title: "Hoodiz - Anime Merchandise",
    description: "Premium anime hoodies and merchandise. Wear the power of anime.",
    type: "website",
    siteName: "Hoodiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoodiz - Anime Merchandise",
    description: "Premium anime hoodies and merchandise.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, webSiteSchema]),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
