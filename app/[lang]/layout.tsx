import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import "../globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/providers/auth-provider";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/structured-data";
import { routing } from '@/i18n/routing';
import { baseUrl, defaultOgImage, locales, businessInfo } from '@/lib/config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: 'metadata' });
  
  // Get keywords as array from translation
  const keywords = t.raw('keywords') as string[];
  
  // Build language alternates for hreflang
  const languageAlternates: Record<string, string> = {};
  for (const locale of locales) {
    languageAlternates[locale] = `${baseUrl}/${locale}`;
  }
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: keywords,
    authors: [{ name: businessInfo.name }],
    creator: businessInfo.name,
    publisher: businessInfo.name,
    openGraph: {
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      type: t('openGraph.type') as "website",
      siteName: t('openGraph.siteName'),
      url: `${baseUrl}/${lang}`,
      locale: lang === 'fr' ? 'fr_FR' : 'en_US',
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: t('twitter.card') as "summary_large_image",
      title: t('twitter.title'),
      description: t('twitter.description'),
      images: [defaultOgImage],
    },
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: languageAlternates,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  
  // Enable static rendering
  setRequestLocale(lang);
  
  // Get messages for the current locale
  const messages = await getMessages();
  
  const organizationSchema = getOrganizationSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html lang={lang} className="dark">
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, webSiteSchema]),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            {children}
            <Footer />
            <CookieConsentBanner />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}