import { Metadata } from 'next';
import Script from 'next/script';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown>[];
}

export function SEO({
  title = 'Hoodie Legends - Anime Merchandise',
  description = 'Premium anime hoodies and merchandise. Wear the power of anime with exclusive hoodie designs.',
  keywords = ['anime hoodies', 'anime merchandise', 'hoodies', 'anime clothing', 'anime apparel'],
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  schema = [],
}: SEOProps) {
  const fullUrl = url || process.env.NEXT_PUBLIC_BASE_URL || 'https://hoodielegends.com';
  const fullImage = image.startsWith('http') ? image : `${fullUrl}${image}`;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Hoodie Legends' }],
    creator: 'Hoodie Legends',
    publisher: 'Hoodie Legends',
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
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title,
      description,
      siteName: 'Hoodie Legends',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImage],
      creator: '@hoodielegends',
    },
    alternates: {
      canonical: fullUrl,
    },
    other: {
      'script:ld+json': JSON.stringify(schema),
    },
  };

  return (
    <>
      <head>
        {/* Additional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhxnlnpksfyqrvojlsfi.supabase.co'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhxnlnpksfyqrvojlsfi.supabase.co'} />
      </head>

      {/* JSON-LD Structured Data */}
      {schema.length > 0 && (
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      )}
    </>
  );
}
