import type { Metadata } from "next";
import { baseUrl, defaultOgImage, locales, businessInfo } from "@/lib/config";

interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

// Generate metadata for shop page
export async function generateMetadata({ params }: ShopLayoutProps): Promise<Metadata> {
  const { lang } = await params;
  
  // Build language alternates for hreflang
  const languageAlternates: Record<string, string> = {};
  for (const locale of locales) {
    languageAlternates[locale] = `${baseUrl}/${locale}/shop`;
  }
  
  const titles = {
    en: `Shop All Products | ${businessInfo.name}`,
    fr: `Boutique - Tous les Produits | ${businessInfo.name}`,
  };
  
  const descriptions = {
    en: 'Browse our collection of premium anime hoodies and streetwear. Unique designs, quality clothing delivered across Tunisia.',
    fr: 'Parcourez notre collection de sweats à capuche anime premium et streetwear. Designs uniques, vêtements de qualité livrés dans toute la Tunisie.',
  };
  
  return {
    title: titles[lang as keyof typeof titles] || titles.en,
    description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
    keywords: ['shop', 'hoodies', 'anime hoodies', 'streetwear', 'tunisia', 'clothing', 'merchandise'],
    authors: [{ name: businessInfo.name }],
    creator: businessInfo.name,
    openGraph: {
      title: titles[lang as keyof typeof titles] || titles.en,
      description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
      type: 'website',
      siteName: businessInfo.name,
      url: `${baseUrl}/${lang}/shop`,
      locale: lang === 'fr' ? 'fr_FR' : 'en_US',
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: titles[lang as keyof typeof titles] || titles.en,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[lang as keyof typeof titles] || titles.en,
      description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
      images: [defaultOgImage],
    },
    alternates: {
      canonical: `${baseUrl}/${lang}/shop`,
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

export default function ShopLayout({ children }: ShopLayoutProps) {
  return children;
}
