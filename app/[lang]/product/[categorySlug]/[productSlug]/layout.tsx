import type { Metadata } from "next";
import { baseUrl, defaultOgImage, locales, businessInfo } from "@/lib/config";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
    categorySlug: string;
    productSlug: string;
  }>;
}

// Generate metadata for product pages
export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { lang, categorySlug, productSlug } = await params;
  
  try {
    // Fetch product data for metadata
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${categorySlug}/${productSlug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
      };
    }
    
    const product = await res.json();
    const productImage = product.colors?.[0]?.frontImageURL || defaultOgImage;
    
    // Build language alternates for hreflang
    const languageAlternates: Record<string, string> = {};
    for (const locale of locales) {
      languageAlternates[locale] = `${baseUrl}/${locale}/product/${categorySlug}/${productSlug}`;
    }
    
    return {
      title: `${product.name} | ${businessInfo.name}`,
      description: product.description || `Premium ${product.name} hoodie from ${businessInfo.name}.`,
      keywords: [product.name, product.category?.name, 'hoodie', 'anime', 'streetwear', categorySlug].filter(Boolean),
      authors: [{ name: businessInfo.name }],
      creator: businessInfo.name,
      openGraph: {
        title: product.name,
        description: product.description || `Premium ${product.name} hoodie from ${businessInfo.name}.`,
        type: 'website',
        siteName: businessInfo.name,
        url: `${baseUrl}/${lang}/product/${categorySlug}/${productSlug}`,
        locale: lang === 'fr' ? 'fr_FR' : 'en_US',
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Premium ${product.name} hoodie from ${businessInfo.name}.`,
        images: [productImage],
      },
      alternates: {
        canonical: `${baseUrl}/${lang}/product/${categorySlug}/${productSlug}`,
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
  } catch (error) {
    return {
      title: 'Product | ' + businessInfo.name,
      description: 'Browse our premium anime hoodies and streetwear.',
    };
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children;
}
