import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { baseUrl, locales, defaultLocale, Locale } from '@/lib/config';

// Revalidate every hour instead of force-dynamic
// This works better with Accelerate by reducing database calls
export const revalidate = 3600; // 1 hour

interface CategoryResult {
  slug: string;
  updatedAt: Date;
}

interface ProductResult {
  slug: string;
  category: { slug: string };
  updatedAt: Date;
}

// Static page paths (without locale prefix)
const staticPagePaths = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/cart', priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  // Note: /auth, /data-export, /data-deletion excluded - low SEO value or require auth
];

// Generate hreflang alternates for a given path
function generateAlternates(path: string): Record<Locale, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${path}`;
  }
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all categories and products from database
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  }) as CategoryResult[];

  const products = await prisma.product.findMany({
    select: {
      slug: true,
      category: {
        select: { slug: true },
      },
      updatedAt: true,
    },
  }) as ProductResult[];

  const now = new Date();

  // Static pages - generate for each locale
  const staticPages: MetadataRoute.Sitemap = staticPagePaths.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: generateAlternates(page.path),
      },
    }))
  );

  // Category pages - generate for each locale
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/product/${category.slug}`,
      lastModified: category.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: generateAlternates(`/product/${category.slug}`),
      },
    }))
  );

  // Product pages - generate for each locale
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/product/${product.category.slug}/${product.slug}`,
      lastModified: product.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
      alternates: {
        languages: generateAlternates(`/product/${product.category.slug}/${product.slug}`),
      },
    }))
  );

  return [...staticPages, ...categoryPages, ...productPages];
}
