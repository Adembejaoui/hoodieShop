import { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/static/',
          // Locale-prefixed paths that should be blocked
          '/*/admin/',
          '/*/dashboard/',
          '/*/auth/',
          '/*/checkout/',
          '/*/data-export',
          '/*/data-deletion',
          '/*/blocked',
          '/*/unauthorized',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
