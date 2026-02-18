import { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/dashboard/',
        '/auth/',
        '/checkout/',
        '/data-export',
        '/data-deletion',
        '/blocked',
        '/unauthorized',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
