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

interface BlogPostResult {
  slug: string;
  updatedAt: Date;
}

// Static page paths (without locale prefix)
const staticPagePaths = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/cart', priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
  // Note: /auth, /data-export, /data-deletion excluded - low SEO value or require auth
];

// Generate hreflang alternates for a given path
function generateAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${path}`;
  }
  // Add x-default pointing to default locale
  alternates['x-default'] = `${baseUrl}/${defaultLocale}${path}`;
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all categories, products, and blog posts from database
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

  const blogPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  }) as BlogPostResult[];

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

  // Category shop pages - using shop page with category filter
  // Note: Categories are filtered via query params on the shop page
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/shop?category=${category.slug}`,
      lastModified: category.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: generateAlternates(`/shop?category=${category.slug}`),
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

  // Blog post pages - generate for each locale
  const blogPages: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.updatedAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: generateAlternates(`/blog/${post.slug}`),
      },
    }))
  );

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
